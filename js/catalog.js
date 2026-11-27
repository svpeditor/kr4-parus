// Курсы на страницах: каталог с поиском, фильтром и сортировкой, популярные курсы на главной,
// страница одного курса. Функции обработки данных лежат в utils.js, сами курсы в data.js.
// Скрипт подключён на нескольких страницах, поэтому элементы ищем и проверяем перед работой.

const productsContainer = document.querySelector('[data-products-container]');
const catalogForm = document.querySelector('#catalog-form');
const searchInput = document.querySelector('#filter-search');
const categoryFilter = document.querySelector('#filter-category');
const availableFilter = document.querySelector('#filter-available');
const sortSelect = document.querySelector('#filter-sort');
const resetButton = document.querySelector('#filter-reset');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');

const popularContainer = document.querySelector('[data-popular-courses]');
const otherContainer = document.querySelector('[data-other-courses]');
const courseArticle = document.querySelector('#course');
const courseMessage = document.querySelector('#course-message');

// Названия категорий для карточек
const categoryNames = {
    beginner: 'Для новичков',
    skipper: 'Шкипер',
    kids: 'Детская группа',
    regatta: 'Регатный курс'
};

// Размеры картинки для srcset (как в КР №3): в каталоге, в обычной сетке, на странице курса
const catalogSizes = '(min-width: 1200px) 260px, (min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw';
const gridSizes = '(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw';
const courseSizes = '(min-width: 768px) 520px, 100vw';

// Какие курсы показывать на главной
const popularIds = [1, 4, 7];

// Состояние каталога: что сейчас введено в поиске и выбрано в фильтрах
const catalogState = {
    query: '',
    category: 'all',
    sort: 'default',
    onlyAvailable: false
};

// Картинка: WebP с запасным JPG и два размера, 480px и 800px
function createProductPicture(product, pictureClass, imageClass, sizes, isLazy) {
    const picture = makeElement('picture', pictureClass);
    const source = document.createElement('source');
    const image = makeElement('img', imageClass);

    source.type = 'image/webp';
    source.srcset = `images/${product.image}-480.webp 480w, images/${product.image}.webp 800w`;
    source.sizes = sizes;

    image.src = `images/${product.image}.jpg`;
    image.srcset = `images/${product.image}-480.jpg 480w, images/${product.image}.jpg 800w`;
    image.sizes = sizes;
    image.width = 800;
    image.height = 600;
    image.alt = product.imageAlt;

    if (isLazy) {
        image.loading = 'lazy';
    }

    picture.append(source, image);

    return picture;
}

// Цена: если есть скидка, рядом зачёркнута старая цена
function createProductPrice(product) {
    const price = makeElement('p', 'product-card__price');
    const finalPrice = calculateFinalPrice(product.price, product.discountPercent);

    if (product.discountPercent > 0) {
        const oldPrice = makeElement('s', 'product-card__old-price', formatPrice(product.price));
        price.append(oldPrice, ` ${formatPrice(finalPrice)}`);
    } else {
        price.textContent = formatPrice(finalPrice);
    }

    return price;
}

// Одна карточка курса. Все тексты идут через textContent.
function createProductCard(product, sizes, isLazy) {
    const card = makeElement('article', 'product-card');
    const body = makeElement('div', 'product-card__body');

    card.dataset.id = String(product.id);
    card.dataset.category = product.category;
    card.dataset.available = String(product.isAvailable);

    const category = makeElement('p', 'product-card__category', categoryNames[product.category]);

    const title = makeElement('h3', 'product-card__title');
    const link = makeElement('a', 'product-card__link', product.title);
    link.href = `course.html?id=${product.id}`;
    title.append(link);

    const description = makeElement('p', 'product-card__description', product.description);

    const meta = makeElement('ul', 'product-card__meta');
    const durationItem = makeElement('li', '', product.duration);
    const statusItem = makeElement('li');
    const status = makeElement('span', 'badge', getProductStatus(product));
    status.classList.add(product.isAvailable ? 'badge--ok' : 'badge--closed');
    statusItem.append(status);
    const ratingItem = makeElement('li', '', `Оценка учеников: ${String(product.rating).replace('.', ',')}`);
    meta.append(durationItem, statusItem, ratingItem);

    if (product.discountPercent > 0) {
        const discountItem = makeElement('li');
        discountItem.append(makeElement('span', 'badge badge--ok', `Скидка ${product.discountPercent}%`));
        meta.append(discountItem);
    }

    const actions = makeElement('div', 'product-card__actions');
    const moreLink = makeElement('a', 'button button--secondary button--small', 'Подробнее');
    moreLink.href = `course.html?id=${product.id}`;
    actions.append(moreLink);

    if (product.isAvailable) {
        const button = makeElement('button', 'button button--primary button--small', 'В мои записи');
        button.type = 'button';
        button.dataset.action = 'add-to-cart';
        button.dataset.kind = 'course';
        button.dataset.itemId = String(product.id);
        actions.append(button);
    } else {
        const waitLink = makeElement('a', 'button button--secondary button--small', 'В лист ожидания');
        waitLink.href = `order.html?course=${product.id}`;
        actions.append(waitLink);
    }

    body.append(category, title, description, meta, createProductPrice(product), actions);
    card.append(createProductPicture(product, 'product-card__picture', 'product-card__image', sizes, isLazy), body);

    return card;
}

// Выводит список карточек в контейнер: сначала очищаем, потом добавляем
function renderCardList(container, productsToRender, sizes) {
    container.textContent = '';

    productsToRender.forEach((product, index) => {
        container.append(createProductCard(product, sizes, index > 1));
    });
}

// Каталог: карточки, счётчик найденных и пустое состояние
function renderProducts(productsToRender) {
    renderCardList(productsContainer, productsToRender, catalogSizes);

    if (catalogCount) {
        catalogCount.textContent = `Найдено курсов: ${productsToRender.length}`;
    }

    if (catalogEmpty) {
        catalogEmpty.hidden = productsToRender.length > 0;
    }
}

// Берём данные, применяем поиск, фильтр, сортировку и рисуем заново
function updateCatalog() {
    const preparedProducts = getPreparedProducts(products, catalogState);

    renderProducts(preparedProducts);
}

// Страница одного курса: номер берём из адреса course.html?id=3
function renderCoursePage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.has('id') ? Number(params.get('id')) : products[0].id;
    const product = findProductById(products, id);

    if (!product) {
        courseArticle.hidden = true;
        courseMessage.textContent = 'Такого курса нет. ';
        const catalogLink = makeElement('a', '', 'Выберите курс в каталоге.');
        catalogLink.href = 'courses.html';
        courseMessage.append(catalogLink);
        courseMessage.hidden = false;
        document.title = 'Курс не найден | Парус';
    } else {
        fillCoursePage(product);
    }

    // Внизу страницы другие курсы: сначала той же категории, потом остальные
    const category = product ? product.category : '';
    const sameCategory = products.filter((item) => item.id !== id && item.category === category);
    const otherCategories = products.filter((item) => item.id !== id && item.category !== category);
    const otherProducts = [...sameCategory, ...otherCategories].slice(0, 3);

    renderCardList(otherContainer, otherProducts, gridSizes);
}

function fillCoursePage(product) {
    const facts = [
        ['Для кого', product.audience],
        ['Длительность', product.duration],
        ['Группа', product.group],
        ['Ближайшее занятие', product.nextLesson],
        ['Что взять с собой', 'Сменную одежду, кроссовки, головной убор и крем от солнца']
    ];

    document.title = `${product.title} | Парус`;
    courseArticle.dataset.id = String(product.id);
    courseArticle.dataset.category = product.category;

    document.querySelector('#course-picture').append(createProductPicture(product, '', 'split__image', courseSizes, false));
    document.querySelector('#course-category').textContent = categoryNames[product.category];
    document.querySelector('#course-title').textContent = product.title;
    document.querySelector('#course-description').textContent = product.description;

    const factsList = document.querySelector('#course-facts');
    facts.forEach(([name, value]) => {
        factsList.append(makeElement('dt', '', name), makeElement('dd', '', value));
    });

    const priceElement = createProductPrice(product);
    priceElement.id = 'course-price';
    document.querySelector('#course-price').replaceWith(priceElement);

    const actions = document.querySelector('#course-actions');

    if (product.isAvailable) {
        const orderLink = makeElement('a', 'button button--primary', 'Записаться на курс');
        orderLink.href = `order.html?course=${product.id}`;
        const cartButton = makeElement('button', 'button button--secondary', 'В мои записи');
        cartButton.type = 'button';
        cartButton.dataset.action = 'add-to-cart';
        cartButton.dataset.kind = 'course';
        cartButton.dataset.itemId = String(product.id);
        actions.append(orderLink, cartButton);
    } else {
        const waitLink = makeElement('a', 'button button--secondary', 'В лист ожидания');
        waitLink.href = `order.html?course=${product.id}`;
        actions.append(waitLink);
    }

    // Программа по занятиям
    const programList = document.querySelector('#course-program');
    product.program.forEach(([title, text]) => {
        const item = makeElement('li', 'program__item');
        item.append(makeElement('h3', 'program__title', title), makeElement('p', '', text));
        programList.append(item);
    });

    // Таблица цен: цена за группу и расчётные цены для мини-группы и индивидуальных занятий
    const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
    const priceRows = [
        [`Группа, ${product.group.toLowerCase()}`, `${product.duration}, яхта, спасательный жилет, инструктор`, finalPrice],
        ['Мини-группа до 3 человек', 'То же самое, но больше практики у руля', Math.round(finalPrice * 1.4 / 100) * 100],
        ['Индивидуально', 'Занятия в удобные для вас дни', Math.round(finalPrice * 2 / 100) * 100]
    ];

    if (product.trialPrice > 0) {
        priceRows.push(['Пробное занятие', 'Одно занятие на 2 часа, потом можно записаться на курс', product.trialPrice]);
    }

    const pricesBody = document.querySelector('#course-prices');
    priceRows.forEach(([name, details, price]) => {
        const row = makeElement('tr');
        const nameCell = makeElement('th', '', name);
        nameCell.scope = 'row';
        row.append(nameCell, makeElement('td', '', details), makeElement('td', '', formatPrice(price)));
        pricesBody.append(row);
    });
}

// Каталог: события
if (productsContainer) {
    // Enter в поле поиска не должен перезагружать страницу
    catalogForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    // Поиск реагирует на каждый введённый символ
    searchInput.addEventListener('input', (event) => {
        catalogState.query = event.target.value;
        updateCatalog();
    });

    // Фильтры и сортировка реагируют на выбор значения
    categoryFilter.addEventListener('change', (event) => {
        catalogState.category = event.target.value;
        updateCatalog();
    });

    availableFilter.addEventListener('change', (event) => {
        catalogState.onlyAvailable = event.target.checked;
        updateCatalog();
    });

    sortSelect.addEventListener('change', (event) => {
        catalogState.sort = event.target.value;
        updateCatalog();
    });

    // Кнопка "Сбросить": возвращаем поля и состояние к началу
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = 'all';
        sortSelect.value = 'default';
        availableFilter.checked = false;

        catalogState.query = '';
        catalogState.category = 'all';
        catalogState.sort = 'default';
        catalogState.onlyAvailable = false;

        updateCatalog();
    });

    updateCatalog();
}

// Главная: популярные курсы
if (popularContainer) {
    const popularProducts = popularIds.map((id) => findProductById(products, id));

    renderCardList(popularContainer, popularProducts, gridSizes);
}

// Страница курса
if (courseArticle) {
    renderCoursePage();
}
