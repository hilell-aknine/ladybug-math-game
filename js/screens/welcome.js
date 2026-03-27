// welcome.js — Welcome/start screen
import { getState, updateState, initState } from '../state.js';
import { resumeAudio, playClick } from '../audio.js';

export function initWelcome(showScreen) {
    const nameInput = document.getElementById('player-name');
    const startBtn = document.getElementById('start-btn');
    const welcomeBack = document.getElementById('welcome-back');
    const welcomeNew = document.getElementById('welcome-new');

    // Check if returning player
    const state = getState();
    if (state.player.name) {
        welcomeNew.style.display = 'none';
        welcomeBack.style.display = 'block';
        document.getElementById('welcome-name').textContent = state.player.name;
        document.getElementById('continue-btn').onclick = () => {
            resumeAudio();
            playClick();
            showScreen('screen-map');
        };
    } else {
        welcomeNew.style.display = 'block';
        welcomeBack.style.display = 'none';
    }

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.classList.add('shake');
            setTimeout(() => nameInput.classList.remove('shake'), 500);
            return;
        }
        resumeAudio();
        playClick();
        updateState('player.name', name);
        showScreen('screen-map');
    });

    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startBtn.click();
    });
}
