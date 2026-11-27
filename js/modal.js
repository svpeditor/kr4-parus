// Модальное окно быстрой заявки на главной странице. Окно сделано на элементе dialog:
// браузер сам закрывает его по Escape и затемняет страницу позади.

const quickDialog = document.querySelector('#quick-dialog');

if (quickDialog) {
    // Кнопки, которые открывают окно: в первом экране и в блоке "Быстрая заявка"
    document.querySelectorAll('[data-open-modal]').forEach((button) => {
        button.addEventListener('click', () => {
            quickDialog.showModal();
        });
    });

    // Кнопки закрытия: крестик и кнопка "Закрыть"
    quickDialog.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => {
            quickDialog.close();
        });
    });

    // Клик по затемнению вокруг окна тоже закрывает его
    quickDialog.addEventListener('click', (event) => {
        if (event.target === quickDialog) {
            quickDialog.close();
        }
    });
}
