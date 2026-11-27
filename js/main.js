// Практика 16. Массив товаров, поиск, фильтрация, сортировка и расчёты.
// Массив products создан в data.js, поэтому data.js подключён на страницах раньше main.js.
console.log('Файл main.js подключён');
console.table(products);

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

// Названия всех курсов
function getProductTitles(products) {
    return products.map((product) => product.title);
}

// Курсы с открытым набором
function getAvailableProducts(products) {
    return products.filter((product) => product.isAvailable);
}

// Поиск по названию: пробелы по краям убираем, регистр не важен
function searchProducts(products, query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === '') {
        return products;
    }

    return products.filter((product) => {
        return product.title.toLowerCase().includes(normalizedQuery);
    });
}

// Фильтр по категории, значение all показывает все курсы
function filterProductsByCategory(products, category) {
    if (category === 'all') {
        return products;
    }

    return products.filter((product) => {
        return product.category === category;
    });
}

// Сортировка по цене. Сортируем копию массива, чтобы не менять исходный порядок.
function sortProductsByPrice(products, direction = 'asc') {
    const productsCopy = [...products];

    if (direction === 'desc') {
        return productsCopy.sort((a, b) => b.price - a.price);
    }

    return productsCopy.sort((a, b) => a.price - b.price);
}

// Поиск курса по id. Если курса нет, find вернёт undefined.
function findProductById(products, id) {
    return products.find((product) => product.id === id);
}

// Сумма цен всех курсов из списка
function calculateTotalPrice(products) {
    return products.reduce((sum, product) => {
        return sum + product.price;
    }, 0);
}

function countAvailableProducts(products) {
    return products.filter((product) => product.isAvailable).length;
}

function calculateAveragePrice(products) {
    if (products.length === 0) {
        return 0;
    }

    const totalPrice = calculateTotalPrice(products);

    return Math.round(totalPrice / products.length);
}

// Поиск, фильтр и сортировка вместе
function getPreparedProducts(products, query, category, sortDirection) {
    let result = [...products];

    result = searchProducts(result, query);
    result = filterProductsByCategory(result, category);
    result = sortProductsByPrice(result, sortDirection);

    return result;
}

// Проверка функций в консоли
const firstProduct = products[0];

console.log(createProductSummary(firstProduct));
console.log(getProductTitles(products));
console.table(getAvailableProducts(products));
console.table(searchProducts(products, 'шкипер'));
console.table(filterProductsByCategory(products, 'kids'));
console.table(sortProductsByPrice(products, 'asc'));
console.table(sortProductsByPrice(products, 'desc'));

const selectedProduct = findProductById(products, 3);

if (selectedProduct) {
    console.log(`Найден курс: ${selectedProduct.title}`);
} else {
    console.log('Курс не найден');
}

console.log(calculateTotalPrice(products));
console.log(countAvailableProducts(products));
console.log(calculateAveragePrice(products));
console.table(getPreparedProducts(products, 'ш', 'skipper', 'asc'));

// Вывод на страницу через textContent. Блок "Проверка JavaScript" есть только
// на главной, на других страницах элементов нет, поэтому сначала проверяем их.
const messageElement = document.querySelector('.js-message');
const productOutputElement = document.querySelector('.product-output');

if (messageElement) {
    messageElement.textContent = 'Массив курсов и функции обработки данных подключены.';
}

if (productOutputElement) {
    productOutputElement.textContent = [
        `Всего курсов: ${products.length}`,
        `Курсов с открытым набором: ${countAvailableProducts(products)}`,
        `Средняя цена: ${calculateAveragePrice(products)} руб.`,
        `Результатов поиска "шкипер": ${searchProducts(products, 'шкипер').length}`
    ].join('\n');
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
