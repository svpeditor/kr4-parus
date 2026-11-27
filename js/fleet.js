// Флот: карточки лодок и таблица аренды создаются из массива boats (data.js),
// на странице есть сравнение яхт: отмечаем две или три лодки и получаем таблицу.

const fleetList = document.querySelector('#fleet-list');
const rentBody = document.querySelector('#rent-body');
const compareForm = document.querySelector('#compare-form');
const compareResult = document.querySelector('#compare-result');

const MAX_COMPARE = 3;

const boatSizes = '(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw';

// Строка "Название, значение" в описании характеристик лодки
function addSpec(list, name, value) {
    list.append(makeElement('dt', '', name), makeElement('dd', '', value));
}

// Карточка лодки: фото, характеристики, цена, кнопки аренды и флажок "Сравнить"
function createBoatCard(boat) {
    const card = makeElement('article', 'product-card');
    const body = makeElement('div', 'product-card__body');
    const specs = makeElement('dl', 'specs');
    const actions = makeElement('div', 'product-card__actions');

    card.dataset.id = String(boat.id);

    addSpec(specs, 'Длина', formatMeters(boat.length));
    addSpec(specs, 'Экипаж', `до ${boat.crew} чел.`);
    addSpec(specs, 'Парус', `${boat.sail} м²`);

    const price = boat.rentFree > 0 ? `Аренда от ${formatPrice(boat.rentFree)} в день` : 'Только для занятий';

    // Флажок сравнения с подписью
    const compareCheck = makeElement('div', 'form__check');
    const checkbox = makeElement('input');
    const label = makeElement('label', '', `Сравнить ${boat.name}`);

    checkbox.id = `compare-${boat.id}`;
    checkbox.name = 'compare';
    checkbox.type = 'checkbox';
    checkbox.value = String(boat.id);
    checkbox.dataset.compare = '';
    // Флажок стоит в карточке, а не внутри формы, поэтому связываем его с формой атрибутом form
    checkbox.setAttribute('form', 'compare-form');
    label.htmlFor = checkbox.id;
    compareCheck.append(checkbox, label);

    actions.append(compareCheck);

    // Аренда: два варианта, с капитаном и без
    if (boat.rentFree > 0) {
        [[true, 'Аренда с капитаном'], [false, 'Аренда без капитана']].forEach(([withCaptain, text]) => {
            const button = makeElement('button', 'button button--secondary button--small', text);

            button.type = 'button';
            button.dataset.action = 'add-to-cart';
            button.dataset.kind = 'rent';
            button.dataset.itemId = String(boat.id);
            button.dataset.captain = String(withCaptain);
            actions.append(button);
        });
    }

    body.append(
        makeElement('p', 'product-card__category', boat.kind),
        makeElement('h3', 'product-card__title', boat.name),
        makeElement('p', 'product-card__description', boat.description),
        specs,
        makeElement('p', 'product-card__price', price),
        actions
    );

    card.append(createProductPicture(boat, 'product-card__picture', 'product-card__image', boatSizes, true), body);

    return card;
}

// Таблица цен аренды: только лодки, которые сдаются
function renderRentTable() {
    rentBody.textContent = '';

    boats.filter((boat) => boat.rentFree > 0).forEach((boat) => {
        const row = makeElement('tr');
        const nameCell = makeElement('th', '', boat.name);

        nameCell.scope = 'row';
        row.append(
            nameCell,
            makeElement('td', '', formatPrice(boat.rentCapt)),
            makeElement('td', '', formatPrice(boat.rentFree)),
            makeElement('td', '', boat.rentRequirement)
        );
        rentBody.append(row);
    });
}

// Выбранные для сравнения лодки
function getComparedBoats() {
    const checked = document.querySelectorAll('input[name="compare"]:checked');

    return Array.from(checked).map((checkbox) => findProductById(boats, Number(checkbox.value)));
}

// Какая лодка лучше по характеристике: id лодок с лучшим значением
// better: 'max' - чем больше, тем лучше, 'min' - чем меньше, тем лучше
function findBestIds(compared, getValue, better) {
    const values = compared.map(getValue).filter((value) => value > 0);

    if (values.length === 0) {
        return [];
    }

    const best = better === 'max' ? Math.max(...values) : Math.min(...values);

    return compared.filter((boat) => getValue(boat) === best).map((boat) => boat.id);
}

// Таблица сравнения: строки - характеристики, столбцы - выбранные лодки.
// Лучшие значения выделены жирным и помечены словом "лучше" для программ чтения.
function createCompareTable(compared) {
    const rows = [
        ['Тип', (boat) => boat.kind, null],
        ['Длина', (boat) => boat.length, 'max', formatMeters],
        ['Ширина', (boat) => boat.beam, 'max', formatMeters],
        ['Экипаж, человек', (boat) => boat.crew, 'max'],
        ['Спальных мест', (boat) => boat.berths, 'max'],
        ['Площадь паруса', (boat) => boat.sail, 'max', (value) => `${value} м²`],
        ['Осадка', (boat) => boat.draft, 'min', formatMeters],
        ['Аренда с капитаном за день', (boat) => boat.rentCapt, 'min', formatPrice],
        ['Аренда без капитана за день', (boat) => boat.rentFree, 'min', formatPrice]
    ];

    const wrapper = makeElement('div', 'table-wrapper');
    const table = makeElement('table', 'info-table compare-table');
    const caption = makeElement('caption', '', 'Сравнение выбранных лодок');
    const head = makeElement('tr');
    const body = makeElement('tbody');

    caption.id = 'compare-caption';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-labelledby', 'compare-caption');

    const corner = makeElement('th', '', 'Характеристика');
    corner.scope = 'col';
    head.append(corner);

    compared.forEach((boat) => {
        const heading = makeElement('th', '', boat.name);

        heading.scope = 'col';
        head.append(heading);
    });

    rows.forEach(([name, getValue, better, format]) => {
        const row = makeElement('tr');
        const rowHeading = makeElement('th', '', name);
        const bestIds = better ? findBestIds(compared, getValue, better) : [];

        rowHeading.scope = 'row';
        row.append(rowHeading);

        compared.forEach((boat) => {
            const value = getValue(boat);
            const isEmpty = value === 0 && better !== null;
            const text = isEmpty ? 'нет' : (format ? format(value) : String(value));
            const cell = makeElement('td', '', text);

            if (bestIds.includes(boat.id) && compared.length > 1 && !isEmpty) {
                cell.classList.add('compare-table__best');
                cell.append(makeElement('span', 'visually-hidden', ' (лучше)'));
            }

            row.append(cell);
        });

        body.append(row);
    });

    const thead = makeElement('thead');

    thead.append(head);
    table.append(caption, thead, body);
    wrapper.append(table);

    return wrapper;
}

function showCompareMessage(text) {
    compareResult.textContent = text;
}

if (fleetList) {
    boats.forEach((boat) => {
        fleetList.append(createBoatCard(boat));
    });

    renderRentTable();

    // Нельзя выбрать больше трёх лодок: лишний флажок снимаем и предупреждаем
    fleetList.addEventListener('change', (event) => {
        if (!event.target.matches('input[name="compare"]')) {
            return;
        }

        if (getComparedBoats().length > MAX_COMPARE) {
            event.target.checked = false;
            notify('warning', `Сравнить можно не больше ${MAX_COMPARE} лодок.`);
        }
    });

    compareForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const compared = getComparedBoats();

        if (compared.length < 2) {
            showCompareMessage('Отметьте галочкой две или три лодки в списке выше.');
            compareResult.classList.add('form__result--error');
            notify('error', 'Для сравнения нужно отметить минимум две лодки.');
            return;
        }

        compareResult.classList.remove('form__result--error');
        compareResult.textContent = '';
        compareResult.append(createCompareTable(compared));
        notify('success', `Сравнение готово: ${compared.map((boat) => boat.name).join(', ')}.`);
    });

    // "Снять выбор": браузер снимает флажки сам (они связаны с формой), нам нужно убрать результат
    compareForm.addEventListener('reset', () => {
        compareResult.classList.remove('form__result--error');
        showCompareMessage('');
    });
}
