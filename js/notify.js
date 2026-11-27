// Всплывающие уведомления четырёх типов: success (успех), error (ошибка),
// warning (предупреждение) и info (информация). Вызов: notify('success', 'Текст').
// Текст кладётся через textContent. Уведомление исчезает само или по кнопке.

const notifyTitles = {
    success: 'Готово',
    error: 'Ошибка',
    warning: 'Внимание',
    info: 'Информация'
};

const NOTIFY_LIFETIME = 5000;
const NOTIFY_MAX = 4;

// Контейнер для уведомлений создаётся при первом вызове
function getToastContainer() {
    let container = document.querySelector('.toasts');

    if (!container) {
        container = makeElement('div', 'toasts');
        document.body.append(container);
    }

    return container;
}

function notify(type, text) {
    const container = getToastContainer();
    const toast = makeElement('div', `toast toast--${type}`);
    const title = makeElement('strong', 'toast__title', notifyTitles[type]);
    const message = makeElement('span', 'toast__text', text);
    const closeButton = makeElement('button', 'toast__close', '\u00d7');

    // Ошибки и предупреждения программа чтения с экрана произносит сразу
    toast.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');

    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Закрыть уведомление');
    closeButton.addEventListener('click', () => {
        toast.remove();
    });

    toast.append(title, message, closeButton);
    container.append(toast);

    // На экране не больше четырёх уведомлений, самое старое убираем
    while (container.children.length > NOTIFY_MAX) {
        container.firstElementChild.remove();
    }

    setTimeout(() => {
        toast.remove();
    }, NOTIFY_LIFETIME);
}
