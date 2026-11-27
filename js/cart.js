// Корзина "Мои записи": список выбранных курсов хранится в localStorage,
// сумма считается через reduce. Файл подключён на всех страницах, потому что
// счётчик записей стоит в меню, а таблица корзины есть только в личном кабинете.

const CART_KEY = 'parus_cart';
const MAX_QTY = 8;

// Позиция корзины: { kind: 'course', id: 1, qty: 2 }.
// kind - вид записи, пока в корзину попадают только курсы.
function getCart() {
    const cart = readStorage(CART_KEY, []);

    // Из хранилища берём только позиции, для которых есть курс в data.js
    return cart.filter((item) => findProductById(products, item.id));
}

function saveCart(cart) {
    writeStorage(CART_KEY, cart);
    updateCartCount();
}

// Что показывать в строке корзины по позиции
function getCartItemInfo(item) {
    const product = findProductById(products, item.id);

    return {
        title: product.title,
        typeName: 'Курс',
        unitPrice: calculateFinalPrice(product.price, product.discountPercent),
        maxQty: MAX_QTY
    };
}

// Добавляет курс. Если курс уже есть, увеличивает количество. false - достигнут максимум.
function addToCart(id) {
    const cart = getCart();
    const item = cart.find((cartItem) => cartItem.id === id);

    if (item) {
        if (item.qty >= MAX_QTY) {
            return false;
        }

        item.qty += 1;
    } else {
        cart.push({ kind: 'course', id: id, qty: 1 });
    }

    saveCart(cart);

    return true;
}

function changeCartQty(id, qty) {
    const cart = getCart();
    const item = cart.find((cartItem) => cartItem.id === id);

    item.qty = qty;
    saveCart(cart);
}

function removeFromCart(id) {
    saveCart(getCart().filter((item) => item.id !== id));
}

function clearCart() {
    saveCart([]);
}

// Сумма корзины: цена с учётом скидки умножается на количество
function calculateCartTotal(cart) {
    return cart.reduce((sum, item) => {
        return sum + getCartItemInfo(item).unitPrice * item.qty;
    }, 0);
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
const cartMessage = document.querySelector('#cart-message');

function showCartMessage(text, isError) {
    cartMessage.textContent = text;
    cartMessage.classList.toggle('form__result--error', isError);
}

function createCartRow(item) {
    const info = getCartItemInfo(item);
    const row = makeElement('tr');
    const titleCell = makeElement('td', '', info.title);
    const typeCell = makeElement('td', '', info.typeName);
    const qtyCell = makeElement('td');
    const priceCell = makeElement('td', '', formatPrice(info.unitPrice));
    const sumCell = makeElement('td', '', formatPrice(info.unitPrice * item.qty));
    const removeCell = makeElement('td', 'info-table__action');

    row.dataset.id = String(item.id);

    const qtyInput = makeElement('input', 'form__input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.max = String(info.maxQty);
    qtyInput.value = String(item.qty);
    qtyInput.id = `cart-qty-${item.id}`;
    qtyInput.setAttribute('aria-label', `Количество человек: ${info.title}`);
    qtyCell.append(qtyInput);

    const removeButton = makeElement('button', 'button button--secondary button--small', 'Удалить');
    removeButton.type = 'button';
    removeButton.dataset.remove = String(item.id);
    removeButton.setAttribute('aria-label', `Удалить из записей: ${info.title}`);
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
    cart.forEach((item) => {
        cartBody.append(createCartRow(item));
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

        const id = Number(input.closest('tr').dataset.id);
        const qty = Number(input.value);

        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
            showCartMessage(`Количество должно быть от 1 до ${MAX_QTY}.`, true);
        } else {
            changeCartQty(id, qty);
            showCartMessage('', false);
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
        showCartMessage('Запись удалена.', false);
        renderCart();
    });

    const clearButton = document.querySelector('[data-clear-cart]');

    clearButton.addEventListener('click', () => {
        clearCart();
        showCartMessage('Записи очищены.', false);
        renderCart();
    });

    renderCart();
}

// Кнопки "В мои записи" в карточках: обработчик на весь документ (делегирование),
// потому что карточки создаются позже, чем загружается страница.
document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="add-to-cart"]');

    if (!button) {
        return;
    }

    const added = addToCart(Number(button.dataset.productId));
    const defaultText = button.dataset.text || button.textContent;

    button.dataset.text = defaultText;
    button.textContent = added ? 'Добавлено' : `Максимум ${MAX_QTY}`;

    setTimeout(() => {
        button.textContent = defaultText;
    }, 1500);
});

updateCartCount();
