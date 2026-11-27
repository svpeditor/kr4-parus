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
