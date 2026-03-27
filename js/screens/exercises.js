// exercises.js — Math exercise screen
import { getState, updateState, addCoins, checkUnlocks, resetSession } from '../state.js';
import { generateProblem } from '../math-engine.js';
import { playCorrect, playWrong, playCoin, playLevelUp, playClick } from '../audio.js';

let currentProblem = null;
let attempts = 0;
let showScreenFn = null;

const ENCOURAGEMENTS = ['!כל הכבוד', '!מדהים', '!יופי', '!נהדר', '!מצוין', '!אלוף'];
const RETRY_MESSAGES = ['נסה שוב!', '!עוד פעם', '!אפשר לנסות שוב'];

export function initExercises(showScreen) {
    showScreenFn = showScreen;

    document.getElementById('exercise-back-btn').addEventListener('click', () => {
        playClick();
        showScreen('screen-map');
    });
}

export function startExerciseSession(type) {
    const state = getState();
    resetSession();
    updateState('session.currentExerciseType', type);
    updateState('session.currentRound', 0);
    updateState('session.sessionCoins', 0);
    updateState('session.currentStreak', 0);
    showNextProblem();
}

function showNextProblem() {
    const state = getState();
    const { currentExerciseType, currentRound, roundsPerSession } = state.session;

    if (currentRound >= roundsPerSession) {
        showSessionComplete();
        return;
    }

    const completed = state.progress[currentExerciseType].completed;
    currentProblem = generateProblem(currentExerciseType, completed);
    attempts = 0;

    updateProgressBar(currentRound, roundsPerSession);
    renderProblem(currentProblem);
}

function updateProgressBar(current, total) {
    const bar = document.getElementById('exercise-progress-bar');
    const text = document.getElementById('exercise-progress-text');
    if (bar) bar.style.width = `${(current / total) * 100}%`;
    if (text) text.textContent = `${current + 1} / ${total}`;
}

function renderProblem(problem) {
    const container = document.getElementById('exercise-content');
    const feedbackEl = document.getElementById('exercise-feedback');
    feedbackEl.textContent = '';
    feedbackEl.className = 'exercise-feedback';

    // Update exercise type title
    const typeNames = { counting: 'ספירה', addition: 'חיבור', subtraction: 'חיסור', comparison: 'גדול או קטן' };
    document.getElementById('exercise-type-title').textContent = typeNames[problem.type] || '';

    let html = '';

    // Visual area
    html += '<div class="exercise-visual">';
    if (problem.visual.type === 'objects') {
        html += '<div class="counting-grid">';
        problem.visual.items.forEach((item, i) => {
            html += `<span class="count-item" style="animation-delay:${i * 0.05}s">${item}</span>`;
        });
        html += '</div>';
    } else if (problem.visual.type === 'groups') {
        html += '<div class="groups-visual" dir="ltr">';
        html += '<div class="group-a">';
        problem.visual.groupA.forEach((item, i) => {
            const crossed = problem.visual.crossed && i >= problem.visual.groupA.length - problem.visual.crossed;
            html += `<span class="count-item ${crossed ? 'crossed' : ''}">${item}</span>`;
        });
        html += '</div>';
        if (problem.visual.groupB) {
            html += `<span class="operator">${problem.visual.operator}</span>`;
            html += '<div class="group-b">';
            problem.visual.groupB.forEach(item => {
                html += `<span class="count-item">${item}</span>`;
            });
            html += '</div>';
        }
        html += '</div>';
    } else if (problem.visual.type === 'comparison') {
        html += '<div class="comparison-visual" dir="ltr">';
        html += `<div class="compare-side"><span class="compare-number">${problem.questionParts.left}</span>`;
        html += `<div class="compare-dots">`;
        for (let i = 0; i < Math.min(problem.questionParts.left, 20); i++) html += '<span class="dot">🐞</span>';
        html += '</div></div>';
        html += '<span class="compare-question">?</span>';
        html += `<div class="compare-side"><span class="compare-number">${problem.questionParts.right}</span>`;
        html += `<div class="compare-dots">`;
        for (let i = 0; i < Math.min(problem.questionParts.right, 20); i++) html += '<span class="dot">🐞</span>';
        html += '</div></div>';
        html += '</div>';
    }
    html += '</div>';

    // Question text
    html += `<div class="exercise-question" dir="ltr">${problem.question}</div>`;

    // Input area
    html += '<div class="exercise-input">';
    if (problem.inputType === 'number-buttons') {
        html += '<div class="number-buttons" dir="ltr">';
        const max = problem.maxInput || 20;
        for (let i = 0; i <= max; i++) {
            html += `<button class="num-btn" data-value="${i}">${i}</button>`;
        }
        html += '</div>';
    } else if (problem.inputType === 'comparison-buttons') {
        html += '<div class="comparison-buttons" dir="ltr">';
        ['<', '=', '>'].forEach(op => {
            const label = op === '<' ? 'קטן מ' : op === '>' ? 'גדול מ' : 'שווה';
            html += `<button class="compare-btn" data-value="${op}">
                <span class="compare-symbol">${op}</span>
                <span class="compare-label">${label}</span>
            </button>`;
        });
        html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.num-btn, .compare-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(btn.dataset.value));
    });
}

function handleAnswer(value) {
    const feedbackEl = document.getElementById('exercise-feedback');
    const state = getState();
    const answer = currentProblem.type === 'comparison' ? value : parseInt(value);
    const correct = answer === currentProblem.answer || answer === String(currentProblem.answer);

    if (correct) {
        // Correct answer!
        playCorrect();
        feedbackEl.textContent = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        feedbackEl.className = 'exercise-feedback correct';

        // Update streak
        const newStreak = state.session.currentStreak + 1;
        updateState('session.currentStreak', newStreak);

        // Award coins
        addCoins(1);
        animateCoin();

        // Bonus for 3-streak
        if (newStreak % 3 === 0) {
            addCoins(1);
            setTimeout(() => animateCoin(), 300);
            feedbackEl.textContent += ' 🌟 בונוס!';
        }

        // Update progress
        const type = state.session.currentExerciseType;
        const newCompleted = state.progress[type].completed + 1;
        updateState(`progress.${type}.completed`, newCompleted);

        if (newStreak > state.progress[type].bestStreak) {
            updateState(`progress.${type}.bestStreak`, newStreak);
        }

        checkUnlocks();

        // Next problem
        const nextRound = state.session.currentRound + 1;
        updateState('session.currentRound', nextRound);

        // Disable buttons during feedback
        disableButtons();
        setTimeout(showNextProblem, 1200);

    } else {
        attempts++;
        if (attempts >= 2) {
            // Show correct answer after 2 wrong attempts
            playWrong();
            feedbackEl.textContent = `התשובה הנכונה היא: ${currentProblem.answer}`;
            feedbackEl.className = 'exercise-feedback wrong';
            updateState('session.currentStreak', 0);

            // Highlight correct answer
            highlightCorrectAnswer(currentProblem.answer);

            const nextRound = state.session.currentRound + 1;
            updateState('session.currentRound', nextRound);

            disableButtons();
            setTimeout(showNextProblem, 2000);
        } else {
            // First wrong — let them retry
            playWrong();
            feedbackEl.textContent = RETRY_MESSAGES[Math.floor(Math.random() * RETRY_MESSAGES.length)];
            feedbackEl.className = 'exercise-feedback retry';

            // Shake the clicked button
            const clicked = document.querySelector(`[data-value="${value}"]`);
            if (clicked) {
                clicked.classList.add('shake', 'wrong-btn');
                setTimeout(() => clicked.classList.remove('shake'), 500);
            }
        }
    }
}

function highlightCorrectAnswer(answer) {
    const btn = document.querySelector(`[data-value="${answer}"]`);
    if (btn) btn.classList.add('correct-btn');
}

function disableButtons() {
    document.querySelectorAll('.num-btn, .compare-btn').forEach(btn => {
        btn.disabled = true;
    });
}

function animateCoin() {
    const coin = document.createElement('div');
    coin.className = 'flying-coin';
    coin.textContent = '🪙';
    const exerciseArea = document.getElementById('exercise-content');
    exerciseArea.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);

    // Update coin display
    const coinDisplay = document.getElementById('exercise-coins');
    if (coinDisplay) coinDisplay.textContent = getState().player.coins;
}

function showSessionComplete() {
    const state = getState();
    const container = document.getElementById('exercise-content');
    const sessionCoins = state.session.sessionCoins;

    playLevelUp();

    container.innerHTML = `
        <div class="session-complete">
            <div class="celebration-emoji">🎉🐞🎉</div>
            <h2>!כל הכבוד</h2>
            <p>!סיימת את כל התרגילים</p>
            <div class="session-stats">
                <div class="stat-item">
                    <span class="stat-icon">🪙</span>
                    <span class="stat-value">${sessionCoins}</span>
                    <span class="stat-label">מטבעות</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🔥</span>
                    <span class="stat-value">${state.progress[state.session.currentExerciseType].bestStreak}</span>
                    <span class="stat-label">רצף שיא</span>
                </div>
            </div>
            <div class="session-buttons">
                <button class="btn-primary" id="session-shop-btn">🛍️ לחנות</button>
                <button class="btn-secondary" id="session-map-btn">🗺️ חזרה למפה</button>
                <button class="btn-accent" id="session-again-btn">🔄 עוד סבב</button>
            </div>
        </div>
    `;

    document.getElementById('session-shop-btn').onclick = () => {
        playClick();
        showScreenFn('screen-shop');
    };
    document.getElementById('session-map-btn').onclick = () => {
        playClick();
        showScreenFn('screen-map');
    };
    document.getElementById('session-again-btn').onclick = () => {
        playClick();
        startExerciseSession(state.session.currentExerciseType);
    };
}
