// state.js — Central game state management
import { loadState, saveState } from './storage.js';

const DEFAULT_STATE = {
    player: {
        name: '',
        coins: 0,
        totalCoinsEarned: 0,
        stars: 0,
    },
    progress: {
        counting:    { completed: 0, bestStreak: 0, unlocked: true },
        addition:    { completed: 0, bestStreak: 0, unlocked: true },
        subtraction: { completed: 0, bestStreak: 0, unlocked: false },
        comparison:  { completed: 0, bestStreak: 0, unlocked: false },
    },
    shop: {
        purchasedItems: [],
    },
    house: {
        placedItems: {},
    },
    session: {
        currentStreak: 0,
        currentExerciseType: null,
        currentRound: 0,
        roundsPerSession: 10,
        sessionCoins: 0,
    },
    settings: {
        soundEnabled: true,
    },
};

let state = null;
const listeners = [];

export function initState() {
    const saved = loadState();
    state = saved ? { ...DEFAULT_STATE, ...saved } : structuredClone(DEFAULT_STATE);
    // Ensure nested objects exist after merge
    state.progress = { ...DEFAULT_STATE.progress, ...state.progress };
    state.session = { ...DEFAULT_STATE.session };
    notifyListeners();
}

export function getState() {
    return state;
}

export function updateState(path, value) {
    const keys = path.split('.');
    let obj = state;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    saveState(state);
    notifyListeners();
}

export function addCoins(amount) {
    state.player.coins += amount;
    state.player.totalCoinsEarned += amount;
    state.session.sessionCoins += amount;
    saveState(state);
    notifyListeners();
}

export function spendCoins(amount) {
    if (state.player.coins >= amount) {
        state.player.coins -= amount;
        saveState(state);
        notifyListeners();
        return true;
    }
    return false;
}

export function purchaseItem(itemId) {
    if (!state.shop.purchasedItems.includes(itemId)) {
        state.shop.purchasedItems.push(itemId);
        saveState(state);
        notifyListeners();
    }
}

export function placeItem(slotId, itemId) {
    state.house.placedItems[slotId] = itemId;
    saveState(state);
    notifyListeners();
}

export function removeItem(slotId) {
    delete state.house.placedItems[slotId];
    saveState(state);
    notifyListeners();
}

export function checkUnlocks() {
    const p = state.progress;
    if (p.addition.completed >= 10 && !p.subtraction.unlocked) {
        p.subtraction.unlocked = true;
    }
    if (p.subtraction.completed >= 10 && !p.comparison.unlocked) {
        p.comparison.unlocked = true;
    }
    saveState(state);
    notifyListeners();
}

export function subscribe(fn) {
    listeners.push(fn);
    return () => {
        const idx = listeners.indexOf(fn);
        if (idx > -1) listeners.splice(idx, 1);
    };
}

function notifyListeners() {
    listeners.forEach(fn => fn(state));
}

export function resetSession() {
    state.session = { ...DEFAULT_STATE.session };
}
