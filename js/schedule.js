// Расписание выходов: таблица создаётся из массива outings (data.js).
// На странице расписания работает фильтр по типу и по свободным местам,
// на главной показываются четыре ближайших выхода.

const scheduleBody = document.querySelector('#schedule-body');
const tripsBody = document.querySelector('#trips-body');
const scheduleForm = document.querySelector('#schedule-form');
const scheduleType = document.querySelector('#schedule-type');
const scheduleFree = document.querySelector('#schedule-free');
const scheduleReset = document.querySelector('#schedule-reset');
const scheduleCount = document.querySelector('#schedule-count');
const scheduleEmpty = document.querySelector('#schedule-empty');

// Состояние фильтра расписания
const scheduleState = {
    type: 'all',
    onlyFree: false
};

// Фильтр: тип события и только события со свободными местами
function filterOutings(outings, state) {
    return outings.filter((outing) => {
        const isTypeMatch = state.type === 'all' || outing.type === state.type;
        const isFreeMatch = !state.onlyFree || outing.free > 0;

        return isTypeMatch && isFreeMatch;
    });
}

// Ячейка таблицы с подписью столбца для карточек на телефоне
function createCell(label, content, className) {
    const cell = makeElement('td', className || '', typeof content === 'string' ? content : undefined);

    cell.dataset.label = label;

    if (typeof content !== 'string') {
        cell.append(content);
    }

    return cell;
}

// Кнопки в строке: если места есть, "Записаться" и "В мои записи", если нет, "Лист ожидания"
function createOutingActions(outing) {
    const actions = document.createDocumentFragment();

    if (outing.free > 0) {
        const orderLink = makeElement('a', 'button button--primary button--small', 'Записаться');
        orderLink.href = `order.html?trip=${outing.id}`;

        const cartButton = makeElement('button', 'button button--secondary button--small', 'В мои записи');
        cartButton.type = 'button';
        cartButton.dataset.action = 'add-to-cart';
        cartButton.dataset.kind = 'trip';
        cartButton.dataset.itemId = String(outing.id);

        actions.append(orderLink, cartButton);
    } else {
        const waitLink = makeElement('a', 'button button--secondary button--small', 'Лист ожидания');
        waitLink.href = `order.html?trip=${outing.id}`;

        actions.append(waitLink);
    }

    return actions;
}

function createOutingRow(outing, withType) {
    const row = makeElement('tr');
    const seats = outing.free > 0 ? `${outing.free} из ${outing.seats}` : 'Мест нет';

    row.dataset.id = String(outing.id);
    row.dataset.type = outing.type;
    row.dataset.free = String(outing.free);

    row.append(createCell('Дата и время', formatOutingDate(outing)));

    if (withType) {
        row.append(createCell('Тип', outingTypeNames[outing.type]));
    }

    row.append(
        createCell('Название', outing.title),
        createCell('Лодка', outing.boat),
        createCell('Свободно мест', seats),
        createCell('Цена', formatPrice(outing.price)),
        createCell('Запись', createOutingActions(outing), 'info-table__action')
    );

    return row;
}

function renderOutings(body, outingsToRender, withType) {
    body.textContent = '';

    outingsToRender.forEach((outing) => {
        body.append(createOutingRow(outing, withType));
    });
}

// Расписание: перерисовываем таблицу, счётчик и пустое состояние
function updateSchedule() {
    const filteredOutings = filterOutings(outings, scheduleState);

    renderOutings(scheduleBody, filteredOutings, true);
    scheduleCount.textContent = `Найдено событий: ${filteredOutings.length}`;
    scheduleEmpty.hidden = filteredOutings.length > 0;
}

if (scheduleBody) {
    scheduleForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    scheduleType.addEventListener('change', (event) => {
        scheduleState.type = event.target.value;
        updateSchedule();
    });

    scheduleFree.addEventListener('change', (event) => {
        scheduleState.onlyFree = event.target.checked;
        updateSchedule();
    });

    scheduleReset.addEventListener('click', () => {
        scheduleType.value = 'all';
        scheduleFree.checked = false;
        scheduleState.type = 'all';
        scheduleState.onlyFree = false;
        updateSchedule();
    });

    updateSchedule();
}

// Главная: ближайшие четыре выхода
if (tripsBody) {
    renderOutings(tripsBody, outings.slice(0, 4), false);
}
