// shop.js — Shop screen
import { getState, spendCoins, purchaseItem, subscribe } from '../state.js';
import { playClick, playPurchase } from '../audio.js';

export const SHOP_CATALOG = [
    { id: 'oven',       name: 'תנור',          price: 5,  emoji: '🔥', category: 'bakery',     slot: 'kitchen' },
    { id: 'cake',       name: 'עוגה',          price: 3,  emoji: '🎂', category: 'bakery',     slot: 'counter' },
    { id: 'cookies',    name: 'עוגיות',        price: 4,  emoji: '🍪', category: 'bakery',     slot: 'counter' },
    { id: 'mixer',      name: 'מיקסר',         price: 7,  emoji: '🍰', category: 'bakery',     slot: 'counter' },
    { id: 'table',      name: 'שולחן',         price: 8,  emoji: '🪑', category: 'furniture',  slot: 'dining' },
    { id: 'chair',      name: 'כיסא',          price: 6,  emoji: '💺', category: 'furniture',  slot: 'dining' },
    { id: 'lamp',       name: 'מנורה',         price: 5,  emoji: '💡', category: 'decoration', slot: 'living' },
    { id: 'flowers',    name: 'פרחים',         price: 4,  emoji: '💐', category: 'decoration', slot: 'window' },
    { id: 'painting',   name: 'תמונה',         price: 10, emoji: '🖼️', category: 'decoration', slot: 'wall' },
    { id: 'cushion',    name: 'כרית חיפושית',  price: 12, emoji: '❤️', category: 'decoration', slot: 'sofa' },
    { id: 'curtains',   name: 'וילונות',       price: 10, emoji: '🪟', category: 'decoration', slot: 'window' },
    { id: 'rug',        name: 'שטיח',          price: 15, emoji: '🟥', category: 'decoration', slot: 'floor' },
];

let showScreenFn = null;

export function initShop(showScreen) {
    showScreenFn = showScreen;

    document.getElementById('shop-back-btn').addEventListener('click', () => {
        playClick();
        showScreen('screen-map');
    });

    subscribe(renderShop);
    renderShop(getState());
}

function renderShop(state) {
    const grid = document.getElementById('shop-grid');
    const coinDisplay = document.getElementById('shop-coins');
    if (coinDisplay) coinDisplay.textContent = state.player.coins;

    grid.innerHTML = SHOP_CATALOG.map(item => {
        const owned = state.shop.purchasedItems.includes(item.id);
        const canAfford = state.player.coins >= item.price;

        return `
            <div class="shop-item ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'too-expensive' : ''}"
                 data-id="${item.id}">
                <div class="shop-item-emoji">${item.emoji}</div>
                <div class="shop-item-name">${item.name}</div>
                ${owned
                    ? '<div class="shop-item-owned">✓ יש לך!</div>'
                    : `<div class="shop-item-price">
                        <span class="coin-icon">🪙</span> ${item.price}
                       </div>
                       <button class="shop-buy-btn" ${!canAfford ? 'disabled' : ''}>
                           ${canAfford ? 'קנה!' : `חסר ${item.price - state.player.coins} 🪙`}
                       </button>`
                }
            </div>
        `;
    }).join('');

    // Attach buy handlers
    grid.querySelectorAll('.shop-buy-btn:not([disabled])').forEach(btn => {
        const itemEl = btn.closest('.shop-item');
        const itemId = itemEl.dataset.id;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            buyItem(itemId);
        });
    });
}

function buyItem(itemId) {
    const item = SHOP_CATALOG.find(i => i.id === itemId);
    if (!item) return;

    // Show confirmation modal
    const modal = document.getElementById('shop-modal');
    const modalContent = document.getElementById('shop-modal-content');

    modalContent.innerHTML = `
        <div class="modal-emoji">${item.emoji}</div>
        <h3>?לקנות ${item.name}</h3>
        <p class="modal-price"><span class="coin-icon">🪙</span> ${item.price} מטבעות</p>
        <div class="modal-buttons">
            <button class="btn-primary" id="confirm-buy">!כן, קנה</button>
            <button class="btn-secondary" id="cancel-buy">לא, תודה</button>
        </div>
    `;

    modal.classList.add('active');

    document.getElementById('confirm-buy').onclick = () => {
        if (spendCoins(item.price)) {
            purchaseItem(item.id);
            playPurchase();
            modal.classList.remove('active');
            // Show success animation
            showPurchaseSuccess(item);
        }
    };

    document.getElementById('cancel-buy').onclick = () => {
        playClick();
        modal.classList.remove('active');
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

function showPurchaseSuccess(item) {
    const toast = document.createElement('div');
    toast.className = 'purchase-toast';
    toast.innerHTML = `<span>${item.emoji}</span> !${item.name} נוסף לבית`;
    document.getElementById('screen-shop').appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
