// Корзина "Мои записи" и расчёт стоимости записей. Список хранится в localStorage,
// суммы считаются через reduce. Файл подключён на всех страницах, потому что счётчик
// записей стоит в меню, а таблица корзины есть только в личном кабинете.

const CART_KEY = 'parus_cart';
const MAX_QTY = 8;
const MAX_DAYS = 14;

// Позиция корзины и заявки:
// { kind: 'course', id: 1, qty: 2, people: 2, captain: false, options: ['gear'] }
// kind - вид записи: course (курс), trip (выход) или rent (аренда яхты);
// qty - сколько: человек для курса и выхода, дней для аренды;
// people и captain - число человек и капитан для аренды, options - ключи из extraOptions.

// Запись из data.js, на которую ссылается позиция: курс, выход или лодка
function getItemSource(item) {
    if (item.kind === 'course') {
        return findProductById(products, item.id);
    }

    if (item.kind === 'trip') {
        return findProductById(outings, item.id);
    }

    return findProductById(boats, item.id);
}

function getItemTitle(item) {
    const source = getItemSource(item);

    if (item.kind === 'course') {
        return source.title;
    }

    if (item.kind === 'trip') {
        return `${source.title}, ${formatOutingDate(source)}`;
    }

    return `Аренда яхты ${source.name}, ${item.captain ? 'с капитаном' : 'без капитана'}`;
}

function getItemTypeName(item) {
    const names = { course: 'Курс', trip: 'Выход', rent: 'Аренда' };

    return names[item.kind];
}

// Единица измерения для количества
function getItemUnit(item) {
    const units = { course: 'чел.', trip: 'мест', rent: 'дн.' };

    return units[item.kind];
}

// Цена за единицу: курс со скидкой, место на выходе или день аренды
function getItemUnitPrice(item) {
    const source = getItemSource(item);

    if (item.kind === 'course') {
        return calculateFinalPrice(source.price, source.discountPercent);
    }

    if (item.kind === 'trip') {
        return source.price;
    }

    return item.captain ? source.rentCapt : source.rentFree;
}

// Сколько единиц можно взять: на выходе не больше свободных мест
function getItemMaxQty(item) {
    if (item.kind === 'trip') {
        return Math.max(getItemSource(item).free, 1);
    }

    return item.kind === 'rent' ? MAX_DAYS : MAX_QTY;
}

function getItemPeople(item) {
    return item.kind === 'rent' ? item.people : item.qty;
}

// Дней для услуги "за день": дни аренды, число занятий курса или один день выхода
function getItemDays(item) {
    if (item.kind === 'rent') {
        return item.qty;
    }

    return item.kind === 'course' ? getItemSource(item).lessons : 1;
}

// Сумма дополнительных услуг: за день, за человека или один раз
function calculateOptionsSum(item) {
    return extraOptions
        .filter((option) => item.options.includes(option.key))
        .reduce((sum, option) => {
            if (option.per === 'day') {
                return sum + option.price * getItemDays(item);
            }

            if (option.per === 'person') {
                return sum + option.price * getItemPeople(item);
            }

            return sum + option.price;
        }, 0);
}

function calculateItemTotal(item) {
    return getItemUnitPrice(item) * item.qty + calculateOptionsSum(item);
}

// Сумма всех позиций: reduce складывает суммы позиций
function calculateCartTotal(cart) {
    return cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

function getOptionTitles(item) {
    return extraOptions
        .filter((option) => item.options.includes(option.key))
        .map((option) => option.title.toLowerCase());
}

// Целое число больше нуля или 1
function toPositiveInteger(value) {
    return Number.isInteger(value) && value > 0 ? value : 1;
}

// Достаём корзину из хранилища. Данные в localStorage можно изменить вручную в DevTools,
// поэтому берём только позиции, для которых есть запись в data.js, и приводим поля к нормальному виду.
function getCart() {
    return readStorage(CART_KEY, [])
        .filter((item) => ['course', 'trip', 'rent'].includes(item.kind) && getItemSource(item))
        .map((item) => {
            const cartItem = {
                kind: item.kind,
                id: item.id,
                qty: toPositiveInteger(item.qty),
                people: toPositiveInteger(item.people),
                captain: Boolean(item.captain),
                options: Array.isArray(item.options) ? item.options.filter((key) => extraOptions.some((option) => option.key === key)) : []
            };

            cartItem.qty = Math.min(cartItem.qty, getItemMaxQty(cartItem));

            return cartItem;
        });
}

function saveCart(cart) {
    writeStorage(CART_KEY, cart);
    updateCartCount();
}

function isSameItem(first, second) {
    return first.kind === second.kind
        && first.id === second.id
        && first.captain === second.captain
        && first.options.length === second.options.length
        && first.options.every((key) => second.options.includes(key));
}

// Добавляет запись. Если такая уже есть, увеличивает количество.
// Возвращает false, если количество вышло бы за максимум.
function addToCart(kind, id, details = {}) {
    const newItem = {
        kind: kind,
        id: id,
        qty: details.qty || 1,
        people: details.people || 1,
        captain: Boolean(details.captain),
        options: details.options || []
    };
    const cart = getCart();
    const sameItem = cart.find((item) => isSameItem(item, newItem));
    const maxQty = getItemMaxQty(newItem);

    if (sameItem) {
        if (sameItem.qty + newItem.qty > maxQty) {
            return false;
        }

        sameItem.qty += newItem.qty;
    } else {
        if (newItem.qty > maxQty) {
            return false;
        }

        cart.push(newItem);
    }

    saveCart(cart);

    return true;
}

function changeCartQty(index, qty) {
    const cart = getCart();

    cart[index].qty = qty;
    saveCart(cart);
}

function removeFromCart(index) {
    saveCart(getCart().filter((item, itemIndex) => itemIndex !== index));
}

function clearCart() {
    saveCart([]);
}

// Число записей в меню
function updateCartCount() {
    const count = getCart().length;

    document.querySelectorAll('[data-cart-count]').forEach((element) => {
        element.textContent = `(${count})`;
    });
}

// Таблица корзины на странице личного кабинета
const cartBody = document.querySelector('#cart-body');
const cartContent = document.querySelector('#cart-content');
const cartEmpty = document.querySelector('#cart-empty');
const cartTotal = document.querySelector('#cart-total');

function createCartRow(item, index) {
    const row = makeElement('tr');
    const title = getItemTitle(item);
    const titleCell = makeElement('td', '', title);
    const typeCell = makeElement('td', '', getItemTypeName(item));
    const qtyCell = makeElement('td');
    const priceCell = makeElement('td', '', formatPrice(getItemUnitPrice(item)));
    const sumCell = makeElement('td', '', formatPrice(calculateItemTotal(item)));
    const removeCell = makeElement('td', 'info-table__action');

    row.dataset.index = String(index);

    // Под названием: дополнительные услуги и число человек при аренде
    const details = [];

    if (item.kind === 'rent') {
        details.push(`человек: ${item.people}`);
    }

    if (item.options.length > 0) {
        details.push(`дополнительно: ${getOptionTitles(item).join(', ')}`);
    }

    if (details.length > 0) {
        titleCell.append(makeElement('br'), makeElement('span', 'muted', details.join(', ')));
    }

    const qtyInput = makeElement('input', 'form__input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.max = String(getItemMaxQty(item));
    qtyInput.value = String(item.qty);
    qtyInput.id = `cart-qty-${index}`;
    qtyInput.setAttribute('aria-label', `Количество, ${getItemUnit(item)}: ${title}`);
    qtyCell.append(qtyInput, ` ${getItemUnit(item)}`);

    const removeButton = makeElement('button', 'button button--secondary button--small', 'Удалить');
    removeButton.type = 'button';
    removeButton.dataset.remove = String(index);
    removeButton.setAttribute('aria-label', `Удалить из записей: ${title}`);
    removeCell.append(removeButton);

    // Подписи столбцов для карточек на телефоне
    titleCell.dataset.label = 'Название';
    typeCell.dataset.label = 'Тип';
    qtyCell.dataset.label = 'Количество';
    priceCell.dataset.label = 'Цена';
    sumCell.dataset.label = 'Сумма';
    removeCell.dataset.label = 'Удалить';

    row.append(titleCell, typeCell, qtyCell, priceCell, sumCell, removeCell);

    return row;
}

function renderCart() {
    const cart = getCart();

    cartBody.textContent = '';
    cart.forEach((item, index) => {
        cartBody.append(createCartRow(item, index));
    });

    cartContent.hidden = cart.length === 0;
    cartEmpty.hidden = cart.length > 0;
    cartTotal.textContent = `Итого: ${formatPrice(calculateCartTotal(cart))}`;
}

if (cartBody) {
    // Количество меняется в поле: проверяем число и пересчитываем сумму
    cartBody.addEventListener('change', (event) => {
        const input = event.target.closest('input');

        if (!input) {
            return;
        }

        const index = Number(input.closest('tr').dataset.index);
        const qty = Number(input.value);
        const maxQty = getItemMaxQty(getCart()[index]);

        if (!Number.isInteger(qty) || qty < 1 || qty > maxQty) {
            notify('error', `Количество должно быть от 1 до ${maxQty}.`);
        } else {
            changeCartQty(index, qty);
        }

        renderCart();
    });

    // Удаление строки: одна кнопка на строку, обработчик один на таблицу
    cartBody.addEventListener('click', (event) => {
        const button = event.target.closest('[data-remove]');

        if (!button) {
            return;
        }

        removeFromCart(Number(button.dataset.remove));
        notify('info', 'Запись удалена из корзины.');
        renderCart();
    });

    document.querySelector('[data-clear-cart]').addEventListener('click', () => {
        clearCart();
        notify('info', 'Корзина очищена.');
        renderCart();
    });

    renderCart();
}

// Кнопки "В мои записи" в карточках и таблицах: обработчик на весь документ (делегирование),
// потому что карточки создаются позже, чем загружается страница.
document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="add-to-cart"]');

    if (!button) {
        return;
    }

    const kind = button.dataset.kind;
    const id = Number(button.dataset.itemId);
    const details = { captain: button.dataset.captain === 'true' };
    const title = getItemTitle({ kind: kind, id: id, qty: 1, people: 1, captain: details.captain, options: [] });

    if (addToCart(kind, id, details)) {
        notify('success', `Добавлено в мои записи: ${title}.`);
    } else {
        notify('warning', `Больше добавить нельзя: ${title}. Максимум для этой записи уже выбран.`);
    }
});

updateCartCount();
