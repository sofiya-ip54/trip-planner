// Практикум 6–9: Планувальник подорожей (варіант 10)
// Практикум 6: змінні, умови, цикли, функції; практикум 7: маніпуляція DOM;
// практикум 8: обробка подій, форма, клієнтська валідація; практикум 9: fetch/async/await, REST Countries
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

// Практикум 8: «розумний» мінімум бюджету на день (USD); нижче — показуємо попередження
const MIN_DAILY_BUDGET = 50;

// ===== Практикум 7, крок 3: вибираємо контейнер списку та елемент-підсумок =====
const listContainer = document.querySelector('#trips-list');
const tripsCount = document.querySelector('#trips-count');

// ===== Практикум 8, крок 2: вибираємо форму, її поля та елементи для виводу =====
const form = document.querySelector('#trip-form');
const destinationInput = document.querySelector('#destination');
const daysInput = document.querySelector('#days');
const budgetInput = document.querySelector('#budget');
const costHint = document.querySelector('#cost-hint');
const detailsPlaceholder = document.querySelector('#details-placeholder');
const tripInfo = document.querySelector('#trip-info');

// Індекс обраної подорожі (null — нічого не обрано); потрібен, щоб виділення не зникало після перемальовування
let selectedIndex = null;

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
// Практикум 9: функція стала універсальною — другим параметром приймає контейнер
// (за замовчуванням список подорожей), тому її повторно використовує і клієнт API країн
// Очищає контейнер і для кожної подорожі створює article: зображення (якщо є), h3 (напрямок), мітка статусу,
// дати, p (дні й бюджет) і кнопка; ставить data-cost-per-day, data-index, клас budget/expensive
// (і selected для обраної картки) та додає картку в контейнер
function renderTrips(list, container = listContainer) {
    container.innerHTML = '';

    for (const [index, trip] of list.entries()) {
        const card = document.createElement('article');
        card.classList.add('card');

        // Практикум 8: номер запису в масиві — за ним обробник кліку знаходить подорож
        card.dataset.index = index;

        // Зображення: атрибути src і alt (у нових подорожей картинки немає — тоді блок пропускаємо)
        if (trip.image) {
            const img = document.createElement('img');
            img.src = trip.image;
            img.alt = trip.alt;
            card.append(img);
        }

        const content = document.createElement('div');
        content.classList.add('card-content');

        const title = document.createElement('h3');
        title.textContent = trip.destination;

        // Рядок з описом: для країн (практикум 9) він приходить готовим у trip.details
        const details = document.createElement('p');
        details.textContent = trip.details ?? `${trip.days} днів, ${trip.budget} USD`;

        content.append(title);

        // Блоки статусу, дат і кнопки є лише в подорожей (у країн цих полів немає)
        if (trip.status) {
            // Мітка статусу з практикуму 5 (іконка додається в CSS)
            const statusWrap = document.createElement('p');
            statusWrap.classList.add('status-wrap');
            const status = document.createElement('span');
            status.classList.add('status', `status-${trip.status}`);
            status.textContent = trip.statusText;
            statusWrap.append(status);

            const dates = document.createElement('p');
            dates.textContent = `Дати: ${trip.dates}`;

            content.append(statusWrap, dates);
        }

        content.append(details);

        if (trip.status) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Деталі';
            content.append(button);
        }

        // Атрибут data-cost-per-day і класи budget/expensive — лише для записів з бюджетом
        if (trip.budget !== undefined) {
            // Атрибут data-cost-per-day зі значенням costPerDay(trip) з практикуму 6
            card.dataset.costPerDay = costPerDay(trip);

            // Умовний клас: budget або expensive
            if (trip.budget <= BUDGET_LIMIT) {
                card.classList.add('budget');
            } else {
                card.classList.add('expensive');
            }
        }

        // Виділяємо обрану подорож (лише в основному списку)
        if (container === listContainer && index === selectedIndex) {
            card.classList.add('selected');
        }

        card.append(content);
        container.append(card);
    }
}

// Оновлює підсумок «Подорожей: N» під списком
function updateTripsCount() {
    tripsCount.textContent = `Подорожей: ${trips.length}`;
}

// Крок 8 (практикум 7): викликаємо рендер одразу після оголошення функції
renderTrips(trips);

// Крок 9 (практикум 7): оновлюємо підсумковий елемент (уже наявний у HTML)
updateTripsCount();

// ===== Практикум 8: показ деталей обраної подорожі в окремому блоці =====
// Заповнює #trip-info даними подорожі з масиву за її індексом і показує блок
function showTripDetails(index) {
    const trip = trips[index];

    tripInfo.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = trip.destination;

    const info = document.createElement('ul');
    const rows = [
        `Статус: ${trip.statusText}`,
        `Дати: ${trip.dates}`,
        `Тривалість: ${trip.days} днів`,
        `Бюджет: ${trip.budget} USD (${classifyTrip(trip)})`,
        `Вартість дня: ${costPerDay(trip)} USD`
    ];
    for (const text of rows) {
        const li = document.createElement('li');
        li.textContent = text;
        info.append(li);
    }

    tripInfo.append(title, info);
    tripInfo.hidden = false;
    detailsPlaceholder.hidden = true;
}

// ===== Практикум 8: делегування подій — ОДИН обробник кліку на контейнері списку =====
// e.target — елемент, по якому клікнули (картинка, заголовок, кнопка...),
// closest('.card') знаходить картку, якій він належить; обробник працює і для карток,
// створених пізніше формою, тому не треба навішувати його після кожного рендеру
listContainer.addEventListener('click', event => {
    const card = event.target.closest('.card');
    if (!card) {
        return; // клік по порожньому місцю контейнера
    }

    selectedIndex = Number(card.dataset.index);
    renderTrips(trips);              // перемальовуємо, щоб виділити обрану картку
    showTripDetails(selectedIndex);  // виводимо деталі в блок #trip-details
});

// ===== Практикум 8: додаткова валідація days/budget — перерахунок costPerDay «на льоту» =====
// Спрацьовує на кожну зміну days або budget: рахує вартість дня й показує попередження,
// якщо бюджет на день менший за MIN_DAILY_BUDGET; для некоректних днів ставить власне повідомлення
function updateCostHint() {
    const days = Number(daysInput.value);
    const budget = Number(budgetInput.value);

    // Власні повідомлення про помилки (setCustomValidity('') повертає поле в коректний стан)
    if (daysInput.value !== '' && !Number.isInteger(days)) {
        daysInput.setCustomValidity('Кількість днів має бути цілим числом');
    } else if (daysInput.value !== '' && days < 1) {
        daysInput.setCustomValidity('Подорож має тривати щонайменше 1 день');
    } else {
        daysInput.setCustomValidity('');
    }

    if (budgetInput.value !== '' && budget < 0) {
        budgetInput.setCustomValidity('Бюджет не може бути від’ємним');
    } else {
        budgetInput.setCustomValidity('');
    }

    // Перерахунок можливий, лише коли обидва поля заповнені коректно
    costHint.classList.remove('warning');
    if (daysInput.value === '' || budgetInput.value === '' || days < 1 || budget < 0) {
        costHint.textContent = 'Вартість дня: —';
        return;
    }

    const perDay = costPerDay({ budget, days });
    if (perDay < MIN_DAILY_BUDGET) {
        costHint.textContent =
            `Вартість дня: ${perDay} USD. Попередження: менше ${MIN_DAILY_BUDGET} USD на день — бюджет замалий.`;
        costHint.classList.add('warning');
    } else {
        costHint.textContent = `Вартість дня: ${perDay} USD`;
    }
}

daysInput.addEventListener('input', updateCostHint);
budgetInput.addEventListener('input', updateCostHint);

// ===== Практикум 8: обробка надсилання форми без перезавантаження сторінки =====
// 1) preventDefault — скасовує стандартне перезавантаження; 2) зчитуємо поля;
// 3) збираємо новий об'єкт тієї ж форми, що й елементи масиву trips; 4) push і повторний рендер;
// 5) form.reset() і скидання підказки. Порожні обов'язкові поля блокує сам браузер (required)
form.addEventListener('submit', event => {
    event.preventDefault();

    const destination = destinationInput.value.trim();
    const days = Number(daysInput.value);
    const budget = Number(budgetInput.value);

    // Пробіли в required-полі проходять перевірку браузера, тому перевіряємо вручну
    if (destination === '') {
        destinationInput.setCustomValidity('Вкажіть напрямок подорожі');
        destinationInput.reportValidity();
        return;
    }

    const newTrip = {
        destination: destination,
        days: days,
        budget: budget,
        image: '',
        alt: destination,
        status: 'planned',
        statusText: 'Заплановано',
        dates: 'Дати уточнюються'
    };

    trips.push(newTrip);
    renderTrips(trips);
    updateTripsCount();

    form.reset();
    updateCostHint();

    console.log(`Додано подорож: ${newTrip.destination}, ${costPerDay(newTrip)} USD/день`);
});

// Коли користувач виправляє напрямок — прибираємо власне повідомлення про помилку
destinationInput.addEventListener('input', () => {
    destinationInput.setCustomValidity('');
});

// ===== Практикум 9: клієнт для REST Countries API (варіант 10) =====
// API: REST Countries v5, https://api.restcountries.com/countries/v5/name?q=<назва країни>
// (версія v3.1 закрита сервісом, v5 потребує API-ключ; для браузера ключ передаємо параметром api-key)
// Поля відповіді: data.objects[].names.common, capitals[].name, population, flag.url_png
const COUNTRIES_API_URL = 'https://api.restcountries.com/countries/v5/name';
const COUNTRIES_API_KEY = 'rc_live_b01fd96c16ac4a27aec2507f434a6f33';

const countryForm = document.querySelector('#country-form');
const countryInput = document.querySelector('#country-name');
const countrySearchBtn = document.querySelector('#country-search-btn');
const countryRefreshBtn = document.querySelector('#country-refresh-btn');
const countryLoading = document.querySelector('#country-loading');
const countryError = document.querySelector('#country-error');
const countryList = document.querySelector('#country-list');

// Остання успішно надіслана назва — за нею працює кнопка «Оновити»
let lastCountryQuery = countryInput.value.trim();

// Вмикає/вимикає стан завантаження: текст «Завантаження…» і заблоковані кнопки
function showLoading(isLoading) {
    countryLoading.hidden = !isLoading;
    countrySearchBtn.disabled = isLoading;
    countryRefreshBtn.disabled = isLoading;
}

// Показує зрозуміле користувачу повідомлення про помилку (без технічних деталей)
function showError(message) {
    countryError.textContent = message;
    countryError.hidden = false;
}

// Ховає повідомлення про помилку
function clearError() {
    countryError.textContent = '';
    countryError.hidden = true;
}

// Адаптер: форма відповіді API -> форма об'єкта, яку розуміє renderTrips
function countryToItem(country) {
    const name = country.names?.common ?? 'Без назви';
    const capital = Array.isArray(country.capitals) && country.capitals.length > 0
        ? country.capitals.map(c => c.name).join(', ')
        : 'немає даних';
    const population = typeof country.population === 'number'
        ? `${country.population.toLocaleString('uk-UA')} осіб`
        : 'немає даних';
    return {
        destination: name,
        image: country.flag?.url_png ?? '',
        alt: `Прапор: ${name}`,
        details: `Столиця: ${capital}. Населення: ${population}`
    };
}

// Запит до REST Countries (https://restcountries.com): async/await + try/catch/finally.
// Помилки: 404 або порожній список (невідома країна), 401/403 (ключ), інший код статусу, мережевий збій
async function loadCountry(name) {
    clearError();
    showLoading(true);

    try {
        const url = `${COUNTRIES_API_URL}?q=${encodeURIComponent(name)}&limit=6&api-key=${COUNTRIES_API_KEY}`;
        const response = await fetch(url);

        // fetch не вважає 404/500 помилкою — перевіряємо статус вручну
        if (response.status === 404) {
            throw new CountryNotFoundError(name);
        }
        if (response.status === 401 || response.status === 403) {
            const accessError = new Error(`Доступ заборонено, код ${response.status}`);
            accessError.userMessage = 'Немає доступу до API: перевірте API-ключ і дозволені адреси сайту.';
            throw accessError;
        }
        if (!response.ok) {
            throw new Error(`Сервер відповів кодом ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // У v5 список країн лежить у data.objects
        const countries = data?.data?.objects;
        if (!Array.isArray(countries) || countries.length === 0) {
            throw new CountryNotFoundError(name);
        }

        // Повторно використовуємо renderTrips з практикуму 7
        renderTrips(countries.map(countryToItem), countryList);
        lastCountryQuery = name;
    } catch (error) {
        countryList.innerHTML = '';
        if (error instanceof CountryNotFoundError) {
            showError('Країну не знайдено, перевірте написання.');
        } else if (error.userMessage) {
            showError(error.userMessage);
        } else {
            showError('Не вдалося завантажити дані. Перевірте з’єднання з інтернетом і спробуйте ще раз.');
        }
        console.error(error); // деталі — для розробника
    } finally {
        showLoading(false);
    }
}

// Власний тип помилки для 404 / порожньої відповіді
class CountryNotFoundError extends Error {
    constructor(name) {
        super(`Країну «${name}» не знайдено`);
        this.name = 'CountryNotFoundError';
    }
}

// Надсилання форми пошуку (preventDefault — без перезавантаження сторінки)
countryForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = countryInput.value.trim();
    if (name === '') {
        showError('Введіть назву країни.');
        return;
    }
    loadCountry(name);
});

// Кнопка «Оновити»: повторює останній запит після збою, без перезавантаження сторінки
countryRefreshBtn.addEventListener('click', () => {
    loadCountry(lastCountryQuery || countryInput.value.trim() || 'Italy');
});

// Перше завантаження при відкритті сторінки
loadCountry(lastCountryQuery);

// ===== Виклики з практикуму 6 =====
printTripsSummary(trips);
console.log(`Вартість дня в Римі: ${costPerDay(trips[2])} USD`);