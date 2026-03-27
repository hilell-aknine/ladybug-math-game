// house.js — House decoration screen (tap-to-place)
import { getState, placeItem, removeItem, subscribe } from '../state.js';
import { playClick, playPurchase } from '../audio.js';
import { SHOP_CATALOG } from './shop.js';

const HOUSE_SLOTS = [
    { id: 'kitchen-1',  label: 'מטבח',  x: 10, y: 25, w: 18, h: 22, accepts: 'bakery' },
    { id: 'counter-1',  label: 'דלפק',  x: 30, y: 30, w: 15, h: 18, accepts: 'bakery' },
    { id: 'counter-2',  label: 'דלפק 2', x: 47, y: 30, w: 15, h: 18, accepts: 'bakery' },
    { id: 'dining-1',   label: 'פינת אוכל', x: 65, y: 35, w: 15, h: 20, accepts: 'furniture' },
    { id: 'dining-2',   label: 'פינת אוכל 2', x: 82, y: 35, w: 12, h: 20, accepts: 'furniture' },
    { id: 'wall-1',     label: 'קיר',   x: 15, y: 5,  w: 14, h: 16, accepts: 'decoration' },
    { id: 'wall-2',     label: 'קיר 2', x: 55, y: 5,  w: 14, h: 16, accepts: 'decoration' },
    { id: 'window-1',   label: 'חלון',  x: 35, y: 3,  w: 16, h: 18, accepts: 'decoration' },
    { id: 'sofa-1',     label: 'ספה',   x: 68, y: 60, w: 20, h: 15, accepts: 'decoration' },
    { id: 'floor-1',    label: 'רצפה',  x: 30, y: 65, w: 25, h: 12, accepts: 'decoration' },
    { id: 'living-1',   label: 'סלון',  x: 75, y: 10, w: 12, h: 16, accepts: 'decoration' },
];

let selectedItem = null;
let showScreenFn = null;

export function initHouse(showScreen) {
    showScreenFn = showScreen;

    document.getElementById('house-back-btn').addEventListener('click', () => {
        playClick();
        selectedItem = null;
        showScreen('screen-map');
    });

    subscribe((state) => renderHouse(state));
    renderHouse(getState());
}

function renderHouse(state) {
    renderSlots(state);
    renderInventory(state);
    updateHouseCoins(state);
}

function updateHouseCoins(state) {
    const coinDisplay = document.getElementById('house-coins');
    if (coinDisplay) coinDisplay.textContent = state.player.coins;
}

function renderSlots(state) {
    const slotsContainer = document.getElementById('house-slots');
    slotsContainer.innerHTML = HOUSE_SLOTS.map(slot => {
        const placedItemId = state.house.placedItems[slot.id];
        const placedItem = placedItemId ? SHOP_CATALOG.find(i => i.id === placedItemId) : null;

        return `
            <div class="house-slot ${placedItem ? 'filled' : 'empty'} ${selectedItem ? 'accepting' : ''}"
                 data-slot="${slot.id}"
                 data-accepts="${slot.accepts}"
                 style="left:${slot.x}%;top:${slot.y}%;width:${slot.w}%;height:${slot.h}%">
                ${placedItem
                    ? `<span class="placed-item-emoji">${placedItem.emoji}</span>
                       <span class="placed-item-name">${placedItem.name}</span>`
                    : `<span class="slot-label">${slot.label}</span>`
                }
            </div>
        `;
    }).join('');

    // Attach click handlers to slots
    slotsContainer.querySelectorAll('.house-slot').forEach(slotEl => {
        slotEl.addEventListener('click', () => handleSlotClick(slotEl));
    });
}

function renderInventory(state) {
    const tray = document.getElementById('house-inventory');
    // Show purchased items that are NOT placed
    const placedIds = Object.values(state.house.placedItems);
    const available = state.shop.purchasedItems
        .filter(id => !placedIds.includes(id))
        .map(id => SHOP_CATALOG.find(i => i.id === id))
        .filter(Boolean);

    if (available.length === 0 && state.shop.purchasedItems.length === 0) {
        tray.innerHTML = `
            <div class="empty-inventory">
                <p>!אין לך עדיין פריטים</p>
                <button class="btn-primary" id="house-to-shop">🛍️ לכו לחנות</button>
            </div>
        `;
        const shopBtn = document.getElementById('house-to-shop');
        if (shopBtn) shopBtn.onclick = () => {
            playClick();
            showScreenFn('screen-shop');
        };
        return;
    }

    if (available.length === 0) {
        tray.innerHTML = '<div class="empty-inventory"><p>!כל הפריטים מוצבים</p></div>';
        return;
    }

    tray.innerHTML = available.map(item => `
        <div class="inventory-item ${selectedItem === item.id ? 'selected' : ''}"
             data-id="${item.id}" data-category="${item.category}">
            <span class="inv-emoji">${item.emoji}</span>
            <span class="inv-name">${item.name}</span>
        </div>
    `).join('');

    // Attach click handlers
    tray.querySelectorAll('.inventory-item').forEach(el => {
        el.addEventListener('click', () => {
            playClick();
            const id = el.dataset.id;
            selectedItem = selectedItem === id ? null : id;
            renderHouse(getState());
        });
    });
}

function handleSlotClick(slotEl) {
    const slotId = slotEl.dataset.slot;
    const state = getState();
    const accepts = slotEl.dataset.accepts;

    // If slot has item, remove it
    if (state.house.placedItems[slotId]) {
        playClick();
        removeItem(slotId);
        selectedItem = null;
        return;
    }

    // If we have a selected item, try to place it
    if (selectedItem) {
        const item = SHOP_CATALOG.find(i => i.id === selectedItem);
        if (item && item.category === accepts) {
            playPurchase();
            placeItem(slotId, selectedItem);
            selectedItem = null;
        } else {
            // Wrong category — shake
            slotEl.classList.add('shake');
            setTimeout(() => slotEl.classList.remove('shake'), 500);
        }
    }
}
