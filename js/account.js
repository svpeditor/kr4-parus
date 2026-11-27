// Личный кабинет: регистрация, вход, заявки и статус заявки по номеру.
// Сервера нет, поэтому пользователи и заявки лежат в localStorage этого браузера.
// Файл подключён на страницах, где создаётся заявка (главная, заявка) и на странице кабинета.

const USERS_KEY = 'parus_users';
const SESSION_KEY = 'parus_session';
const ORDERS_KEY = 'parus_orders';

// Хеш пароля, чтобы в хранилище не лежал пароль открытым текстом.
// Это учебный вариант: в настоящем проекте пароли хешируют на сервере.
function hashPassword(login, password) {
    const text = `${login}:${password}`;
    let hash = 5381;

    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 33 + text.charCodeAt(i)) % 4294967296;
    }

    return String(hash);
}

// При первом запуске кладём в хранилище пользователя demo и примеры заявок из data.js
function seedDemoData() {
    if (localStorage.getItem(USERS_KEY) === null) {
        writeStorage(USERS_KEY, [{
            login: demoUser.login,
            email: demoUser.email,
            passwordHash: hashPassword(demoUser.login, demoUser.password)
        }]);
    }

    if (localStorage.getItem(ORDERS_KEY) === null) {
        writeStorage(ORDERS_KEY, demoOrders);
    }
}

function getUsers() {
    return readStorage(USERS_KEY, []);
}

// Вошедший пользователь или undefined, если никто не вошёл
function getCurrentUser() {
    const login = readStorage(SESSION_KEY, '');

    return getUsers().find((user) => user.login === login);
}

function findUser(login) {
    return getUsers().find((user) => user.login.toLowerCase() === login.toLowerCase());
}

function registerUser(login, email, password) {
    const users = getUsers();

    users.push({ login: login, email: email, passwordHash: hashPassword(login, password) });
    writeStorage(USERS_KEY, users);
    writeStorage(SESSION_KEY, login);
}

// Вход: логин и хеш пароля должны совпасть с сохранёнными
function loginUser(login, password) {
    const user = findUser(login);

    if (!user || user.passwordHash !== hashPassword(user.login, password)) {
        return false;
    }

    writeStorage(SESSION_KEY, user.login);

    return true;
}

function logoutUser() {
    writeStorage(SESSION_KEY, '');
}

function getOrders() {
    return readStorage(ORDERS_KEY, []);
}

function findOrder(id) {
    return getOrders().find((order) => order.id === id);
}

// Создаёт заявку с новым номером. Номер на единицу больше самого большого из сохранённых.
function createOrder(data) {
    const orders = getOrders();
    const user = getCurrentUser();
    const lastNumber = orders.reduce((max, order) => Math.max(max, order.id), 1024);
    const order = {
        id: lastNumber + 1,
        login: user ? user.login : '',
        createdAt: Date.now(),
        ...data
    };

    if (order.waitlist) {
        order.status = 'В листе ожидания';
    }

    orders.push(order);
    writeStorage(ORDERS_KEY, orders);

    return order;
}

// Статус заявки. У заявок из data.js, отменённых и в листе ожидания статус записан в заявке.
// У остальных он зависит от времени: через 20 секунд "Подтверждена", а оплаченная
// картой или через СБП ещё через 20 секунд "Оплачена".
function getOrderStatus(order) {
    if (order.status) {
        return order.status;
    }

    const seconds = (Date.now() - order.createdAt) / 1000;
    const isOnline = order.payment === 'card' || order.payment === 'sbp';

    if (seconds < statusDelays.confirm) {
        return 'Принята';
    }

    if (!isOnline || seconds < statusDelays.pay) {
        return 'Подтверждена';
    }

    return 'Оплачена';
}

function canCancelOrder(order) {
    return ['Принята', 'Подтверждена', 'В листе ожидания'].includes(getOrderStatus(order));
}

function cancelOrder(id) {
    const orders = getOrders();
    const order = orders.find((item) => item.id === id);

    order.status = 'Отменена';
    writeStorage(ORDERS_KEY, orders);
}

function getStatusBadgeClass(status) {
    if (status === 'Оплачена' || status === 'Выполнена') {
        return 'badge--ok';
    }

    if (status === 'Отменена') {
        return 'badge--closed';
    }

    if (status === 'Подтверждена' || status === 'В листе ожидания') {
        return 'badge--wait';
    }

    return '';
}

// Способ оплаты словами: "Картой **** 4242", "СБП, +7 999 765-43-21", "На месте"
function getPaymentText(order) {
    if (order.payment === 'card') {
        return `Картой ${order.paymentNote}`;
    }

    if (order.payment === 'sbp') {
        return `СБП, ${order.paymentNote}`;
    }

    return order.payment === 'cash' ? 'На месте, в клубе' : 'Не требуется';
}

function createStatusBadge(status) {
    const badge = makeElement('span', 'badge', status);
    const modifier = getStatusBadgeClass(status);

    if (modifier) {
        badge.classList.add(modifier);
    }

    return badge;
}

seedDemoData();

// ----- Страница личного кабинета -----

const authBlock = document.querySelector('#auth');
const userBox = document.querySelector('#account-user');
const ordersBody = document.querySelector('#orders-body');
const ordersEmpty = document.querySelector('#orders-empty');
const ordersTable = document.querySelector('#orders-table');
const statusResult = document.querySelector('#status-result');

// Номер заявки, статус которой сейчас показан под формой "Статус заявки по номеру"
let shownOrderId = null;

function renderOrders() {
    const user = getCurrentUser();
    const orders = user ? getOrders().filter((order) => order.login === user.login) : [];

    ordersBody.textContent = '';

    orders.sort((a, b) => b.id - a.id).forEach((order) => {
        const row = makeElement('tr');
        const status = getOrderStatus(order);
        const statusCell = makeElement('td');
        const actionCell = makeElement('td', 'info-table__action');

        row.dataset.order = String(order.id);
        statusCell.append(createStatusBadge(status));

        if (canCancelOrder(order)) {
            const cancelButton = makeElement('button', 'button button--secondary button--small', 'Отменить');
            cancelButton.type = 'button';
            cancelButton.dataset.cancel = String(order.id);
            cancelButton.setAttribute('aria-label', `Отменить заявку ${order.id}`);
            actionCell.append(cancelButton);
        }

        const cells = [
            [makeElement('td', '', String(order.id)), 'Номер'],
            [makeElement('td', '', order.title), 'Что'],
            [makeElement('td', '', new Date(order.createdAt).toLocaleDateString('ru-RU')), 'Дата'],
            [makeElement('td', '', order.total > 0 ? formatPrice(order.total) : 'не указана'), 'Сумма'],
            [statusCell, 'Статус'],
            [actionCell, 'Действие']
        ];

        cells.forEach(([cell, label]) => {
            cell.dataset.label = label;
            row.append(cell);
        });

        ordersBody.append(row);
    });

    ordersTable.hidden = orders.length === 0;
    ordersEmpty.hidden = orders.length > 0;
    ordersEmpty.textContent = user
        ? 'Заявок пока нет. Оформите заявку на странице "Заявка", и она появится здесь.'
        : 'Войдите или зарегистрируйтесь, чтобы увидеть свои заявки. Статус любой заявки можно узнать по номеру выше.';
}

// Показывает вход и регистрацию или карточку пользователя
function renderAccount() {
    const user = getCurrentUser();

    authBlock.hidden = Boolean(user);
    userBox.hidden = !user;

    if (user) {
        userBox.querySelector('#account-login').textContent = user.login;
        userBox.querySelector('#account-email').textContent = user.email;
    }

    renderOrders();
}

// Ответ на запрос статуса: данные заявки и шаги "Принята - Подтверждена - Оплачена - Выполнена"
function renderStatus(order) {
    const status = getOrderStatus(order);
    const facts = makeElement('dl', 'course__facts');
    const statusValue = makeElement('dd');

    statusResult.textContent = '';
    shownOrderId = order.id;
    statusValue.append(createStatusBadge(status));

    facts.append(
        makeElement('dt', '', 'Что'), makeElement('dd', '', order.title),
        makeElement('dt', '', 'Дата заявки'), makeElement('dd', '', new Date(order.createdAt).toLocaleDateString('ru-RU')),
        makeElement('dt', '', 'Сумма'), makeElement('dd', '', order.total > 0 ? formatPrice(order.total) : 'не указана'),
        makeElement('dt', '', 'Оплата'), makeElement('dd', '', getPaymentText(order)),
        makeElement('dt', '', 'Статус'), statusValue
    );

    statusResult.append(makeElement('h3', '', `Заявка ${order.id}`), facts);

    // Шаги показываем, пока заявка идёт по обычному пути
    const stepIndex = orderSteps.indexOf(status);

    if (stepIndex >= 0) {
        const steps = makeElement('ol', 'status-steps');

        orderSteps.forEach((step, index) => {
            const item = makeElement('li', 'status-steps__item', step);

            if (index < stepIndex) {
                item.classList.add('status-steps__item--done');
            }

            if (index === stepIndex) {
                item.classList.add('status-steps__item--current');
                item.setAttribute('aria-current', 'step');
            }

            steps.append(item);
        });

        statusResult.append(steps);
    }
}

if (authBlock) {
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const statusForm = document.querySelector('#status-form');

    // Вход
    const loginName = loginForm.querySelector('#login-name');
    const loginPassword = loginForm.querySelector('#login-password');

    setupForm(loginForm, [
        createCheck(loginName, (value) => (value.trim() === '' ? 'Введите логин.' : '')),
        createCheck(loginPassword, (value) => (value === '' ? 'Введите пароль.' : ''))
    ], loginForm.querySelector('#login-result'), () => {
        if (!loginUser(loginName.value.trim(), loginPassword.value)) {
            showError(loginPassword, 'Неверный логин или пароль.');
            notify('error', 'Неверный логин или пароль.');
            return null;
        }

        notify('success', `Вы вошли как ${getCurrentUser().login}.`);
        renderAccount();

        return '';
    });

    // Регистрация
    const regLogin = registerForm.querySelector('#reg-name');
    const regEmail = registerForm.querySelector('#reg-email');
    const regPassword = registerForm.querySelector('#reg-password');
    const regPassword2 = registerForm.querySelector('#reg-password2');

    setupForm(registerForm, [
        createCheck(regLogin, checkLogin),
        createCheck(regEmail, checkEmail),
        createCheck(regPassword, checkPassword),
        createCheck(regPassword2, (value) => (value !== regPassword.value ? 'Пароли не совпадают.' : ''))
    ], registerForm.querySelector('#register-result'), () => {
        if (findUser(regLogin.value)) {
            showError(regLogin, 'Такой логин уже занят, выберите другой.');
            notify('error', 'Такой логин уже занят.');
            return null;
        }

        registerUser(regLogin.value, regEmail.value.trim(), regPassword.value);
        notify('success', `Вы зарегистрированы и вошли как ${regLogin.value}.`);
        renderAccount();

        return '';
    });

    // Выход
    document.querySelector('[data-logout]').addEventListener('click', () => {
        logoutUser();
        notify('info', 'Вы вышли из кабинета.');
        renderAccount();
    });

    // Отмена заявки кнопкой в таблице: один обработчик на всю таблицу
    ordersBody.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cancel]');

        if (!button) {
            return;
        }

        const id = Number(button.dataset.cancel);

        cancelOrder(id);
        notify('warning', `Заявка ${id} отменена.`);
        renderOrders();

        if (shownOrderId === id) {
            renderStatus(findOrder(id));
        }
    });

    // Статус по номеру
    const statusNumber = statusForm.querySelector('#status-number');

    function showStatusByNumber() {
        const order = findOrder(Number(statusNumber.value));

        if (!order) {
            statusResult.textContent = '';
            shownOrderId = null;
            showError(statusNumber, 'Заявка с таким номером не найдена.');
            notify('warning', `Заявки ${statusNumber.value} нет.`);
            return null;
        }

        renderStatus(order);

        return '';
    }

    setupForm(statusForm, [createCheck(statusNumber, checkOrderNumber)], null, showStatusByNumber, { resetAfter: false });

    // Номер можно передать в адресе: account.html?number=1025
    const numberFromUrl = new URLSearchParams(window.location.search).get('number');

    if (numberFromUrl) {
        statusNumber.value = numberFromUrl;
        showStatusByNumber();
    }

    renderAccount();

    // Раз в 5 секунд обновляем список и статус, чтобы было видно смену статуса
    setInterval(() => {
        renderOrders();

        if (shownOrderId !== null) {
            renderStatus(findOrder(shownOrderId));
        }
    }, 5000);
}

