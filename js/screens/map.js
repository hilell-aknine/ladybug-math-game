// map.js — Map/navigation screen
import { getState, subscribe } from '../state.js';
import { playClick } from '../audio.js';

export function initMap(showScreen, startExercise) {
    const stations = document.querySelectorAll('.map-station');
    const shopBtn = document.getElementById('map-shop-btn');
    const houseBtn = document.getElementById('map-house-btn');

    stations.forEach(station => {
        station.addEventListener('click', () => {
            const type = station.dataset.type;
            const state = getState();
            if (!state.progress[type].unlocked) {
                station.classList.add('shake');
                setTimeout(() => station.classList.remove('shake'), 500);
                return;
            }
            playClick();
            startExercise(type);
        });
    });

    shopBtn.addEventListener('click', () => {
        playClick();
        showScreen('screen-shop');
    });

    houseBtn.addEventListener('click', () => {
        playClick();
        showScreen('screen-house');
    });

    // Update UI on state change
    subscribe(updateMapUI);
    updateMapUI(getState());
}

function updateMapUI(state) {
    // Update coin display
    const coinDisplay = document.getElementById('map-coins');
    if (coinDisplay) coinDisplay.textContent = state.player.coins;

    // Update station states
    document.querySelectorAll('.map-station').forEach(station => {
        const type = station.dataset.type;
        const prog = state.progress[type];
        const lockIcon = station.querySelector('.lock-icon');
        const starsEl = station.querySelector('.station-stars');

        if (prog.unlocked) {
            station.classList.remove('locked');
            if (lockIcon) lockIcon.style.display = 'none';
        } else {
            station.classList.add('locked');
            if (lockIcon) lockIcon.style.display = 'flex';
        }

        // Show progress stars (1 star per 10 completed)
        if (starsEl) {
            const starCount = Math.min(3, Math.floor(prog.completed / 10));
            starsEl.textContent = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);
        }
    });

    // Update player name
    const nameEl = document.getElementById('map-player-name');
    if (nameEl) nameEl.textContent = state.player.name;
}
