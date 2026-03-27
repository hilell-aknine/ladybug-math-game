// math-engine.js — Pure math problem generation for ages 5-6

const COUNTING_OBJECTS = ['🐞', '🍪', '⭐', '🌸', '🦋', '🍰', '🎀', '❤️'];

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMaxForLevel(completed) {
    if (completed < 20) return 10;
    if (completed < 40) return 15;
    return 20;
}

export function generateCounting(completed = 0) {
    const max = getMaxForLevel(completed);
    const count = rand(1, Math.min(max, 10));
    const obj = COUNTING_OBJECTS[rand(0, COUNTING_OBJECTS.length - 1)];
    const objects = Array(count).fill(obj);

    return {
        type: 'counting',
        question: 'כמה יש פה?',
        answer: count,
        visual: { type: 'objects', items: objects },
        inputType: 'number-buttons',
        maxInput: 10,
    };
}

export function generateAddition(completed = 0) {
    const max = getMaxForLevel(completed);
    const a = rand(1, max - 1);
    const b = rand(1, max - a);

    return {
        type: 'addition',
        question: `${a} + ${b} = ?`,
        answer: a + b,
        visual: {
            type: 'groups',
            groupA: Array(a).fill('🐞'),
            groupB: Array(b).fill('🐞'),
            operator: '+',
        },
        inputType: 'number-buttons',
        maxInput: 20,
    };
}

export function generateSubtraction(completed = 0) {
    const max = getMaxForLevel(completed);
    const a = rand(2, max);
    const b = rand(1, a);

    return {
        type: 'subtraction',
        question: `${a} - ${b} = ?`,
        answer: a - b,
        visual: {
            type: 'groups',
            groupA: Array(a).fill('🍪'),
            crossed: b,
            operator: '-',
        },
        inputType: 'number-buttons',
        maxInput: 20,
    };
}

export function generateComparison(completed = 0) {
    const max = getMaxForLevel(completed);
    let a = rand(1, max);
    let b = rand(1, max);
    // Ensure they're not always equal
    if (a === b && Math.random() > 0.3) {
        b = a + (Math.random() > 0.5 ? 1 : -1);
        b = Math.max(1, Math.min(max, b));
    }
    const correctAnswer = a > b ? '>' : a < b ? '<' : '=';

    return {
        type: 'comparison',
        question: `${a}  __  ${b}`,
        questionParts: { left: a, right: b },
        answer: correctAnswer,
        visual: {
            type: 'comparison',
            leftCount: a,
            rightCount: b,
        },
        inputType: 'comparison-buttons',
    };
}

export function generateProblem(type, completed = 0) {
    switch (type) {
        case 'counting': return generateCounting(completed);
        case 'addition': return generateAddition(completed);
        case 'subtraction': return generateSubtraction(completed);
        case 'comparison': return generateComparison(completed);
        default: return generateAddition(completed);
    }
}
