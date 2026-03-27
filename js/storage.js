// storage.js — LocalStorage persistence wrapper
const STORAGE_KEY = 'ladybug_math_state';

export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* quota exceeded — silently fail */ }
}

export function clearState() {
    localStorage.removeItem(STORAGE_KEY);
}
