// Общие функции без привязки к странице: расчёты цен, поиск, фильтры, сортировка.
// Здесь нет работы со страницей, поэтому файл можно подключать где угодно.
// В методических указаниях эти функции лежат в catalog.js, но они нужны не только каталогу.

// Цена в виде строки, например "12 900 руб."
function formatPrice(price) {
    return `${price.toLocaleString('ru-RU')} руб.`;
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

// Сортировка. Сортируем копию массива, чтобы не менять исходный порядок.
// Цены сравниваем уже со скидкой, потому что покупатель видит именно их.
function sortProducts(products, sortType) {
    const productsCopy = [...products];

    if (sortType === 'price-asc') {
        return productsCopy.sort((a, b) => {
            return calculateFinalPrice(a.price, a.discountPercent) - calculateFinalPrice(b.price, b.discountPercent);
        });
    }

    if (sortType === 'price-desc') {
        return productsCopy.sort((a, b) => {
            return calculateFinalPrice(b.price, b.discountPercent) - calculateFinalPrice(a.price, a.discountPercent);
        });
    }

    if (sortType === 'title-asc') {
        return productsCopy.sort((a, b) => a.title.localeCompare(b.title));
    }

    return productsCopy;
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

// Поиск, фильтр и сортировка вместе. state - это объект catalogState из catalog.js.
function getPreparedProducts(products, state) {
    let result = [...products];

    result = searchProducts(result, state.query);
    result = filterProductsByCategory(result, state.category);

    if (state.onlyAvailable) {
        result = getAvailableProducts(result);
    }

    result = sortProducts(result, state.sort);

    return result;
}

// Создаёт элемент: тег, классы через пробел и текст. Текст кладём через textContent,
// поэтому любая строка выводится как обычный текст, а не как разметка.
function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.classList.add(...className.split(' '));
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}
