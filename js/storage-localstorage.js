// Версія для кроків 1-4: ті самі функції, але дані лежать лише в localStorage.
// Щоб її перевірити, в index.html підключіть цей файл замість storage.js.
const STORAGE_KEY = 'tripStops';

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

async function getAllItems() {
    return loadFromLocalStorage();
}

async function addItem(item) {
    const items = loadFromLocalStorage();
    items.push(item);
    saveToLocalStorage(items);
}

async function deleteItem(id) {
    saveToLocalStorage(loadFromLocalStorage().filter(item => item.id !== id));
}

// у цій версії переносити нічого не треба
async function migrateFromLocalStorage() {}