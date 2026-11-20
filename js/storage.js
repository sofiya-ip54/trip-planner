// Пункти маршруту: { id, country, city, dateFrom, dateTo, notes }
const STORAGE_KEY = 'tripStops';
const DB_NAME = 'TripPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tripStops';

function saveToLocalStorage(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}

// відкриває базу; object store створюється лише в onupgradeneeded
let dbPromise = null;

function openDB() {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        // після збою наступний виклик спробує відкрити базу ще раз
        dbPromise.catch(() => { dbPromise = null; });
    }
    return dbPromise;
}

// put і створює запис, і оновлює наявний з таким самим id
async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

const updateItem = addItem;

async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// одноразово переносить старі дані з localStorage; прапорець migrated не дає зробити це вдруге
async function migrateFromLocalStorage() {
    if (localStorage.getItem('migrated') === 'true') {
        return;
    }

    const oldItems = loadFromLocalStorage();
    const current = await getAllItems();

    if (current.length === 0 && oldItems.length > 0) {
        for (const item of oldItems) {
            await addItem(item);
        }
        console.log(`Перенесено з localStorage в IndexedDB: ${oldItems.length}`);
    }

    localStorage.setItem('migrated', 'true');
}