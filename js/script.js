// Обрала Vue 3: шаблони пишуться прямо в HTML, а для React ще треба підключати Babel заради JSX

const BUDGET_LIMIT = 1000;
const MIN_DAILY_BUDGET = 50;

// API: REST Countries v5 (https://restcountries.com), ключ передається параметром api-key
const COUNTRIES_API_URL = 'https://api.restcountries.com/countries/v5/name';
const COUNTRIES_API_KEY = 'rc_live_b01fd96c16ac4a27aec2507f434a6f33';

function classifyTrip(trip) {
    if (trip.budget <= BUDGET_LIMIT) {
        return 'бюджетна';
    } else {
        return 'дорога';
    }
}

const costPerDay = trip => Math.round(trip.budget / trip.days);

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

class CountryNotFoundError extends Error {
    constructor(name) {
        super(`Країну «${name}» не знайдено`);
        this.name = 'CountryNotFoundError';
    }
}

// відповідь API -> об'єкт для CountryCard
function countryToItem(country, index) {
    const name = country.names?.common ?? 'Без назви';
    const capital = Array.isArray(country.capitals) && country.capitals.length > 0
        ? country.capitals.map(c => c.name).join(', ')
        : 'немає даних';
    const population = typeof country.population === 'number'
        ? `${country.population.toLocaleString('uk-UA')} осіб`
        : 'немає даних';
    return {
        id: `${name}-${index}`,
        name,
        flag: country.flag?.url_png ?? '',
        capital,
        population
    };
}

// Функцію renderTrips з практикуму 7 видалила: список тепер малює компонент TripCard (v-for в index.html)
const TripCard = {
    props: {
        destination: String,
        days: Number,
        budget: Number,
        image: String,
        alt: String,
        status: String,
        statusText: String,
        dates: String,
        selected: Boolean
    },
    emits: ['select'],
    computed: {
        costPerDay() {
            return Math.round(this.budget / this.days);
        },
        isBudget() {
            return this.budget <= BUDGET_LIMIT;
        }
    },
    template: `
        <article class="card" :class="[isBudget ? 'budget' : 'expensive', { selected }]"
                 :data-cost-per-day="costPerDay" @click="$emit('select')">
            <img v-if="image" :src="image" :alt="alt">
            <div class="card-content">
                <h3>{{ destination }}</h3>
                <p class="status-wrap">
                    <span class="status" :class="'status-' + status">{{ statusText }}</span>
                </p>
                <p>Дати: {{ dates }}</p>
                <p>{{ days }} днів, {{ budget }} USD</p>
                <p class="cost-per-day">Вартість дня: {{ costPerDay }} USD</p>
                <button type="button">Деталі</button>
            </div>
        </article>`
};

const CountryCard = {
    props: ['name', 'flag', 'capital', 'population'],
    template: `
        <article class="card">
            <img v-if="flag" :src="flag" :alt="'Прапор: ' + name">
            <div class="card-content">
                <h3>{{ name }}</h3>
                <p>Столиця: {{ capital }}. Населення: {{ population }}</p>
            </div>
        </article>`
};

Vue.createApp({
    components: { TripCard, CountryCard },

    data() {
        return {
            trips: [
                { id: 1, destination: 'Париж, Франція', days: 6, budget: 900,
                  image: 'assets/img/paris.jpg', alt: 'Ейфелева вежа в Парижі',
                  status: 'completed', statusText: 'Завершено', dates: '10.10.2026 - 15.10.2026' },
                { id: 2, destination: 'Кіото, Японія', days: 16, budget: 2200,
                  image: 'assets/img/kyoto.jpg', alt: 'Храм у Кіото восени',
                  status: 'planned', statusText: 'Заплановано', dates: '05.11.2026 - 20.11.2026' },
                { id: 3, destination: 'Рим, Італія', days: 7, budget: 1500,
                  image: 'assets/img/rome.jpg', alt: 'Рим, Італія',
                  status: 'process', statusText: 'В процесі', dates: '12.12.2026 - 18.12.2026' }
            ],
            nextId: 4,
            selectedId: null,
            form: { destination: '', days: '', budget: '' },

            countryQuery: 'Italy',
            lastCountryQuery: 'Italy',
            countries: [],
            isLoading: false,
            countryError: ''
        };
    },

    computed: {
        selectedTrip() {
            return this.trips.find(trip => trip.id === this.selectedId) ?? null;
        },

        costHint() {
            const { days, budget } = this.form;
            if (days === '' || budget === '' || days < 1 || budget < 0) {
                return { text: 'Вартість дня: —', warning: false };
            }
            const perDay = costPerDay({ budget, days });
            if (perDay < MIN_DAILY_BUDGET) {
                return {
                    text: `Вартість дня: ${perDay} USD. Попередження: менше ${MIN_DAILY_BUDGET} USD на день — бюджет замалий.`,
                    warning: true
                };
            }
            return { text: `Вартість дня: ${perDay} USD`, warning: false };
        }
    },

    watch: {
        'form.days': 'validateNumbers',
        'form.budget': 'validateNumbers',
        'form.destination'() {
            this.$refs.destinationInput.setCustomValidity('');
        }
    },

    methods: {
        classifyTrip,
        costPerDay,

        validateNumbers() {
            const { days, budget } = this.form;

            if (days !== '' && !Number.isInteger(days)) {
                this.$refs.daysInput.setCustomValidity('Кількість днів має бути цілим числом');
            } else if (days !== '' && days < 1) {
                this.$refs.daysInput.setCustomValidity('Подорож має тривати щонайменше 1 день');
            } else {
                this.$refs.daysInput.setCustomValidity('');
            }

            if (budget !== '' && budget < 0) {
                this.$refs.budgetInput.setCustomValidity('Бюджет не може бути від’ємним');
            } else {
                this.$refs.budgetInput.setCustomValidity('');
            }
        },

        addTrip() {
            const destination = this.form.destination.trim();

            // пробіли в required-полі браузер пропускає, тому перевіряємо самі
            if (destination === '') {
                this.$refs.destinationInput.setCustomValidity('Вкажіть напрямок подорожі');
                this.$refs.destinationInput.reportValidity();
                return;
            }

            this.trips.push({
                id: this.nextId++,
                destination,
                days: this.form.days,
                budget: this.form.budget,
                image: '',
                alt: destination,
                status: 'planned',
                statusText: 'Заплановано',
                dates: 'Дати уточнюються'
            });

            this.form = { destination: '', days: '', budget: '' };
        },

        async loadCountry(name) {
            this.countryError = '';
            this.isLoading = true;

            try {
                const url = `${COUNTRIES_API_URL}?q=${encodeURIComponent(name)}&limit=6&api-key=${COUNTRIES_API_KEY}`;
                const response = await fetch(url);

                // fetch не вважає 404/500 помилкою, тому статус перевіряємо вручну
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

                const list = data?.data?.objects;
                if (!Array.isArray(list) || list.length === 0) {
                    throw new CountryNotFoundError(name);
                }

                this.countries = list.map(countryToItem);
                this.lastCountryQuery = name;
            } catch (error) {
                this.countries = [];
                if (error instanceof CountryNotFoundError) {
                    this.countryError = 'Країну не знайдено, перевірте написання.';
                } else if (error.userMessage) {
                    this.countryError = error.userMessage;
                } else {
                    this.countryError = 'Не вдалося завантажити дані. Перевірте з’єднання з інтернетом і спробуйте ще раз.';
                }
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },

        searchCountry() {
            const name = this.countryQuery.trim();
            if (name === '') {
                this.countryError = 'Введіть назву країни.';
                return;
            }
            this.loadCountry(name);
        },

        refreshCountry() {
            this.loadCountry(this.lastCountryQuery || this.countryQuery.trim() || 'Italy');
        }
    },

    mounted() {
        printTripsSummary(this.trips);
        console.log(`Вартість дня в Римі: ${costPerDay(this.trips[2])} USD`);
        this.loadCountry(this.lastCountryQuery);
    }
}).mount('#app');