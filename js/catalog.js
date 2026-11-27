// Каталог курсов: вывод карточек через DOM, поиск, фильтр, сортировка.
// Функции обработки данных лежат в utils.js, сами курсы в data.js.
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
const cartCounter = document.querySelector('.cart-counter');

// Названия категорий для карточек
const categoryNames = {
    beginner: 'Для новичков',
    skipper: 'Шкипер',
    kids: 'Детская группа',
    regatta: 'Регатный курс'
};

// Размеры картинки в карточке для srcset (как в КР №3)
const cardSizes = '(min-width: 1200px) 260px, (min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw';

// Состояние каталога: что сейчас введено в поиске и выбрано в фильтрах
const catalogState = {
    query: '',
    category: 'all',
    sort: 'default',
    onlyAvailable: false
};

// Мини-корзина из практики 17: просто список выбранных курсов в памяти
const cartItems = [];

// Картинка карточки: WebP с запасным JPG и два размера, 480px и 800px
function createProductPicture(product, isLazy) {
    const picture = makeElement('picture', 'product-card__picture');
    const source = document.createElement('source');
    const image = makeElement('img', 'product-card__image');

    source.type = 'image/webp';
    source.srcset = `images/${product.image}-480.webp 480w, images/${product.image}.webp 800w`;
    source.sizes = cardSizes;

    image.src = `images/${product.image}.jpg`;
    image.srcset = `images/${product.image}-480.jpg 480w, images/${product.image}.jpg 800w`;
    image.sizes = cardSizes;
    image.width = 800;
    image.height = 600;
    image.alt = product.imageAlt;

    if (isLazy) {
        image.loading = 'lazy';
    }

    picture.append(source, image);

    return picture;
}

// Одна карточка курса. Все тексты идут через textContent.
function createProductCard(product, isLazy) {
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
    meta.append(durationItem, statusItem);

    const ratingItem = makeElement('li', '', `Оценка учеников: ${String(product.rating).replace('.', ',')}`);
    meta.append(ratingItem);

    if (product.discountPercent > 0) {
        const discountItem = makeElement('li');
        discountItem.append(makeElement('span', 'badge badge--ok', `Скидка ${product.discountPercent}%`));
        meta.append(discountItem);
    }

    const price = makeElement('p', 'product-card__price');
    const finalPrice = calculateFinalPrice(product.price, product.discountPercent);

    if (product.discountPercent > 0) {
        const oldPrice = makeElement('s', 'product-card__old-price', formatPrice(product.price));
        price.append(oldPrice, ` ${formatPrice(finalPrice)}`);
    } else {
        price.textContent = formatPrice(finalPrice);
    }

    const actions = makeElement('div', 'product-card__actions');
    const moreLink = makeElement('a', 'button button--secondary button--small', 'Подробнее');
    moreLink.href = `course.html?id=${product.id}`;
    actions.append(moreLink);

    if (product.isAvailable) {
        const button = makeElement('button', 'button button--primary button--small', 'В мои записи');
        button.type = 'button';
        button.dataset.action = 'add-to-cart';
        button.dataset.productId = String(product.id);
        actions.append(button);
    } else {
        const waitLink = makeElement('a', 'button button--secondary button--small', 'В лист ожидания');
        waitLink.href = `order.html?course=${product.id}`;
        actions.append(waitLink);
    }

    body.append(category, title, description, meta, price, actions);
    card.append(createProductPicture(product, isLazy), body);

    return card;
}

// Рендер: очищаем контейнер, пишем счётчик и пустое состояние, добавляем карточки
function renderProducts(productsToRender) {
    productsContainer.textContent = '';

    if (catalogCount) {
        catalogCount.textContent = `Найдено курсов: ${productsToRender.length}`;
    }

    if (catalogEmpty) {
        catalogEmpty.hidden = productsToRender.length > 0;
    }

    productsToRender.forEach((product, index) => {
        productsContainer.append(createProductCard(product, index > 1));
    });
}

// Берём данные, применяем поиск, фильтр, сортировку и рисуем заново
function updateCatalog() {
    const preparedProducts = getPreparedProducts(products, catalogState);

    renderProducts(preparedProducts);
}

function updateCartCounter() {
    if (cartCounter) {
        cartCounter.textContent = `В корзине: ${cartItems.length}`;
    }
}

if (productsContainer) {
    // Enter в поле поиска не должен перезагружать страницу
    if (catalogForm) {
        catalogForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });
    }

    // Поиск реагирует на каждый введённый символ
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            catalogState.query = event.target.value;
            updateCatalog();
        });
    }

    // Фильтр категории и сортировка реагируют на выбор значения
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
            catalogState.category = event.target.value;
            updateCatalog();
        });
    }

    if (availableFilter) {
        availableFilter.addEventListener('change', (event) => {
            catalogState.onlyAvailable = event.target.checked;
            updateCatalog();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            catalogState.sort = event.target.value;
            updateCatalog();
        });
    }

    // Кнопка "Сбросить": возвращаем поля и состояние к началу
    if (resetButton) {
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
    }

    // Делегирование: один обработчик на контейнер вместо обработчика на каждую кнопку
    productsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action="add-to-cart"]');

        if (!button) {
            return;
        }

        const productId = Number(button.dataset.productId);
        const selectedProduct = findProductById(products, productId);

        if (!selectedProduct) {
            console.warn('Курс не найден:', productId);
            return;
        }

        cartItems.push(selectedProduct);
        updateCartCounter();
        console.log(`Курс добавлен в мои записи: ${selectedProduct.title}`);
    });

    updateCatalog();
    updateCartCounter();
}
