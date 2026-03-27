// audio.js — Web Audio API sound effects (no external files)
let ctx = null;

function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
}

export function resumeAudio() {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
}

export function playCorrect() {
    const c = getCtx();
    const t = c.currentTime;
    // Happy ascending arpeggio
    [523, 659, 784].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.3);
    });
}

export function playWrong() {
    playTone(200, 0.4, 'triangle', 0.2);
}

export function playCoin() {
    const c = getCtx();
    const t = c.currentTime;
    [1200, 1600].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.15);
    });
}

export function playPurchase() {
    const c = getCtx();
    const t = c.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.25);
    });
}

export function playLevelUp() {
    const c = getCtx();
    const t = c.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, t + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.4);
    });
}

export function playClick() {
    playTone(800, 0.08, 'sine', 0.15);
}
