// Практика 15. Подключение JavaScript.
// Объект product создан в data.js, поэтому data.js подключён на страницах раньше main.js.
console.log('Файл main.js подключён');
console.log(product);
console.table(product);

// Типы данных: строка, число, логическое значение, объект
console.log(typeof product.title);
console.log(typeof product.price);
console.log(typeof product.isAvailable);
console.log(typeof product);

// Цена в виде строки, например "12900 руб."
function formatPrice(price) {
    return `${price} руб.`;
}

// Размер скидки в рублях
function calculateDiscount(price, discountPercent) {
    return price * discountPercent / 100;
}

// Цена с учётом скидки
function calculateFinalPrice(price, discountPercent) {
    const discountValue = calculateDiscount(price, discountPercent);
    return price - discountValue;
}

// Статус курса: набор открыт или закрыт
function getProductStatus(product) {
    if (product.isAvailable) {
        return 'Набор открыт';
    }

    return 'Набор закрыт';
}

// Краткое описание курса: название, цена со скидкой и статус
function createProductSummary(product) {
    const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
    const status = getProductStatus(product);

    return `${product.title}: ${formatPrice(finalPrice)} Статус: ${status}.`;
}

console.log(formatPrice(product.price));

const discountValue = calculateDiscount(product.price, product.discountPercent);
console.log(discountValue);

const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
console.log(finalPrice);

console.log(getProductStatus(product));

// Арифметические операторы: цена на двоих и цена одного занятия из четырёх
console.log(formatPrice(finalPrice * 2));
console.log(formatPrice(finalPrice / 4));

// Операторы сравнения
console.log(product.price > 10000);
console.log(product.price === 12900);
console.log(product.price !== 0);

// Логические операторы
const hasDiscount = product.discountPercent > 0;
const canBook = product.price > 0 && product.isAvailable;
const needsCheck = !product.isAvailable || product.rating < 4;
console.log(`Есть скидка: ${hasDiscount}, можно записаться: ${canBook}, нужна проверка: ${needsCheck}`);

const productSummary = createProductSummary(product);
console.log(productSummary);

// Вывод на страницу через textContent. Блок "Проверка JavaScript" есть только
// на главной, на других страницах элементов нет, поэтому сначала проверяем их.
const messageElement = document.querySelector('.js-message');
const productOutputElement = document.querySelector('.product-output');

if (messageElement) {
    messageElement.textContent = 'JavaScript подключён корректно.';
}

if (productOutputElement) {
    productOutputElement.textContent = productSummary;
}

// Дальше код из КР №3: модальное окно, меню и фильтры каталога

// Модальное окно быстрой заявки
const modal = document.querySelector('.modal');
const openButtons = document.querySelectorAll('[data-open-modal]');
const closeButtons = document.querySelectorAll('[data-close-modal]');

openButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        modal.showModal();
    });
});

closeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        modal.close();
    });
});

// Клик по затемнению вокруг окна тоже закрывает его
if (modal) {
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.close();
        }
    });
}

// Меню на телефоне: кнопка "Меню" открывает и закрывает список пунктов.
// aria-expanded сообщает программам чтения с экрана, открыто ли меню.
const menuButton = document.querySelector('.site-header__toggle');
const siteNav = document.querySelector('.site-nav');

function setMenu(isOpen) {
    siteNav.classList.toggle('site-nav--open', isOpen);
    menuButton.setAttribute('aria-expanded', isOpen);
}

menuButton.addEventListener('click', function () {
    setMenu(!siteNav.classList.contains('site-nav--open'));
});

// Escape закрывает меню, фокус возвращается на кнопку
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
        setMenu(false);
        menuButton.focus();
    }
});

// После выбора пункта меню закрывается (нужно для ссылок на разделы той же страницы)
siteNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
        setMenu(false);
    });
});

// Фильтры каталога на телефоне
const filtersBlock = document.querySelector('.catalog-filters');
const filtersButton = document.querySelector('.catalog-filters__toggle');

if (filtersButton) {
    filtersButton.addEventListener('click', function () {
        const isOpen = filtersBlock.classList.toggle('catalog-filters--open');
        filtersButton.setAttribute('aria-expanded', isOpen);
    });
}
