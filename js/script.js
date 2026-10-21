// Практикум 6–7: Планувальник подорожей (варіант 10)
// Практикум 6: змінні, умови, цикли, функції; практикум 7: маніпуляція DOM
console.log('script.js підключено');

// ===== Практикум 7, крок 2: програмно прибираємо статичні картки-заглушки з HTML =====
document.querySelectorAll('#trips-list .card').forEach(card => card.remove());

// Дані варіанта: масив подорожей (destination, days, budget)
const trips = [
    { destination: 'Париж, Франція', days: 6, budget: 900,
      image: 'assets/img/paris.jpg', alt: 'Ейфелева вежа в Парижі',
      status: 'completed', statusText: 'Завершено', dates: '10.10.2026 - 15.10.2026' },
    { destination: 'Кіото, Японія', days: 16, budget: 2200,
      image: 'assets/img/kyoto.jpg', alt: 'Храм у Кіото восени',
      status: 'planned', statusText: 'Заплановано', dates: '05.11.2026 - 20.11.2026' },
    { destination: 'Рим, Італія', days: 7, budget: 1500,
      image: 'assets/img/rome.jpg', alt: 'Рим, Італія',
      status: 'process', statusText: 'В процесі', dates: '12.12.2026 - 18.12.2026' }
];

// Поріг: подорожі з бюджетом до цього значення вважаємо бюджетними
const BUDGET_LIMIT = 1000;

// ===== Практикум 7, крок 3: вибираємо контейнер списку та елемент-підсумок =====
const listContainer = document.querySelector('#trips-list');
const tripsCount = document.querySelector('#trips-count');

// Класифікує подорож за бюджетом: «бюджетна» або «дорога»
function classifyTrip(trip) {
    if (trip.budget <= BUDGET_LIMIT) {
        return 'бюджетна';
    } else {
        return 'дорога';
    }
}

// Стрілкова функція: повертає вартість одного дня подорожі (USD, округлено)
const costPerDay = trip => Math.round(trip.budget / trip.days);

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

// ===== Практикум 7, кроки 4–7: рендер списку подорожей з масиву =====
// Очищає контейнер і для кожної подорожі створює article: зображення, h3 (напрямок), мітка статусу,
// дати, p (дні й бюджет) і кнопка; ставить data-cost-per-day, клас budget/expensive і додає картку в контейнер
function renderTrips(list) {
    listContainer.innerHTML = '';

    for (const trip of list) {
        const card = document.createElement('article');
        card.classList.add('card');

        // Зображення: атрибути src і alt
        const img = document.createElement('img');
        img.src = trip.image;
        img.alt = trip.alt;

        const content = document.createElement('div');
        content.classList.add('card-content');

        const title = document.createElement('h3');
        title.textContent = trip.destination;

        // Мітка статусу з практикуму 5 (іконка додається в CSS)
        const statusWrap = document.createElement('p');
        statusWrap.classList.add('status-wrap');
        const status = document.createElement('span');
        status.classList.add('status', `status-${trip.status}`);
        status.textContent = trip.statusText;
        statusWrap.append(status);

        const dates = document.createElement('p');
        dates.textContent = `Дати: ${trip.dates}`;

        const details = document.createElement('p');
        details.textContent = `${trip.days} днів, ${trip.budget} USD`;

        const button = document.createElement('button');
        button.textContent = 'Деталі';

        // Атрибут data-cost-per-day зі значенням costPerDay(trip) з практикуму 6
        card.dataset.costPerDay = costPerDay(trip);

        // Умовний клас: budget або expensive
        if (trip.budget <= BUDGET_LIMIT) {
            card.classList.add('budget');
        } else {
            card.classList.add('expensive');
        }

        content.append(title, statusWrap, dates, details, button);
        card.append(img, content);
        listContainer.append(card);
    }
}

// Крок 8: викликаємо рендер одразу після оголошення функції
renderTrips(trips);

// Крок 9: оновлюємо підсумковий елемент (уже наявний у HTML)
tripsCount.textContent = `Подорожей: ${trips.length}`;

// ===== Виклики з практикуму 6 =====
printTripsSummary(trips);
console.log(`Вартість дня в Римі: ${costPerDay(trips[2])} USD`);