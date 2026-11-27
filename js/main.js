// Общая инициализация страниц: меню на телефоне и кнопка фильтров каталога.
// Файл подключён на всех страницах последним. Остальной код лежит в файлах
// data.js, utils.js, catalog.js, cart.js, validation.js и modal.js.

// Меню на телефоне: кнопка "Меню" открывает и закрывает список пунктов.
// aria-expanded сообщает программам чтения с экрана, открыто ли меню.
const menuButton = document.querySelector('.site-header__toggle');
const siteNav = document.querySelector('.site-nav');

function setMenu(isOpen) {
    siteNav.classList.toggle('site-nav--open', isOpen);
    menuButton.setAttribute('aria-expanded', isOpen);
}

if (menuButton && siteNav) {
    menuButton.addEventListener('click', () => {
        setMenu(!siteNav.classList.contains('site-nav--open'));
    });

    // Escape закрывает меню, фокус возвращается на кнопку
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
            setMenu(false);
            menuButton.focus();
        }
    });

    // После выбора пункта меню закрывается (нужно для ссылок на разделы той же страницы)
    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenu(false);
        });
    });
}

// Фильтры каталога на телефоне: кнопка "Поиск и фильтры" раскрывает форму
const filtersBlock = document.querySelector('.catalog-filters');
const filtersButton = document.querySelector('.catalog-filters__toggle');

if (filtersBlock && filtersButton) {
    filtersButton.addEventListener('click', () => {
        const isOpen = filtersBlock.classList.toggle('catalog-filters--open');

        filtersButton.setAttribute('aria-expanded', isOpen);
    });
}
