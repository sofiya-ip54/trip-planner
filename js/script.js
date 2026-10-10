// ===== Практикум 6: основи JavaScript (варіант 10, «Планувальник подорожей») =====

// Перевірка підключення файлу до сторінки
console.log('script.js підключено');

// Дані: масив подорожей. const — сам масив не переприсвоюється
const trips = [
    { destination: 'Париж, Франція', days: 6, budget: 900 },
    { destination: 'Кіото, Японія', days: 16, budget: 2200 },
    { destination: 'Рим, Італія', days: 7, budget: 1500 }
];

// Поріг: подорожі з бюджетом до цього значення вважаємо бюджетними
const BUDGET_LIMIT = 1000;

// Стрілкова функція: повертає вартість одного дня подорожі (USD, округлено)
const costPerDay = trip => Math.round(trip.budget / trip.days);

// Класифікує подорож за бюджетом: «бюджетна» або «дорога»
function classifyTrip(trip) {
    if (trip.budget <= BUDGET_LIMIT) {
        return 'бюджетна';
    } else {
        return 'дорога';
    }
}

// Циклом for...of виводить кожну подорож, а лічильником let рахує підсумки
function printTripsSummary(list) {
    let totalBudget = 0;

    for (const trip of list) {
        console.log(
            `${trip.destination}: ${trip.days} дн., бюджет ${trip.budget} USD — ` +
            `${classifyTrip(trip)}, ${costPerDay(trip)} USD/день`
        );
        totalBudget += trip.budget;
    }

    console.log(`Подорожей: ${list.length}`);
    console.log(`Загальний бюджет: ${totalBudget} USD`);
    console.log(`Середній бюджет: ${(totalBudget / list.length).toFixed(2)} USD`);
}

// Запуск: підсумок по всіх подорожах і виклик стрілкової функції з реальними даними
printTripsSummary(trips);
console.log(`Вартість дня в Римі: ${costPerDay(trips[2])} USD`);
