// app.js — Main entry point, screen router
import { initState, subscribe, getState } from './state.js';
import { initWelcome } from './screens/welcome.js';
import { initMap } from './screens/map.js';
import { initExercises, startExerciseSession } from './screens/exercises.js';
import { initShop } from './screens/shop.js';
import { initHouse } from './screens/house.js';

let currentScreen = null;

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });

    // Show target
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;
    }
}

function startExercise(type) {
    showScreen('screen-exercises');
    startExerciseSession(type);
}

// Initialize everything on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initState();

    // Initialize all screens
    initWelcome(showScreen);
    initMap(showScreen, startExercise);
    initExercises(showScreen);
    initShop(showScreen);
    initHouse(showScreen);

    // Show welcome screen
    showScreen('screen-welcome');

    // Global coin display updates
    subscribe((state) => {
        document.querySelectorAll('.global-coins').forEach(el => {
            el.textContent = state.player.coins;
        });
    });
});
