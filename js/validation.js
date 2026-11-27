// Проверка формы заявки на странице order.html.
// Ошибки выводятся на страницу рядом с полями, alert() не используется.
// Место для ошибки лежит в элементе с id "<id поля>-error", он уже связан с полем через aria-describedby.

// Показать ошибку у поля: текст под полем и признак aria-invalid
function showError(input, message) {
    const errorElement = document.querySelector(`#${input.id}-error`);

    errorElement.textContent = message;
    input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
    const errorElement = document.querySelector(`#${input.id}-error`);

    errorElement.textContent = '';
    input.removeAttribute('aria-invalid');
}

// Проверка одного поля. getMessage возвращает текст ошибки или пустую строку.
function validateInput(input, getMessage) {
    const message = getMessage(input.value);

    if (message) {
        showError(input, message);
        return false;
    }

    clearError(input);
    return true;
}

function checkName(value) {
    if (value.trim().length < 2) {
        return 'Введите имя не короче 2 символов.';
    }

    return '';
}

// Простая учебная проверка: что-то, @, что-то, точка, что-то
function checkEmail(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value.trim())) {
        return 'Введите корректный e-mail, например name@example.ru.';
    }

    return '';
}

// В телефоне допустимы цифры, плюс, скобки, дефис и пробелы, цифр не меньше 10
function checkPhone(value) {
    const phonePattern = /^[0-9+\-()\s]+$/;
    const digits = value.replace(/\D/g, '');

    if (!phonePattern.test(value) || digits.length < 10) {
        return 'Введите телефон, например +7 999 123-45-67.';
    }

    return '';
}

function checkItem(value) {
    if (value === '') {
        return 'Выберите курс, выход или аренду.';
    }

    return '';
}

function checkPeople(value) {
    const people = Number(value);

    if (!Number.isInteger(people) || people < 1 || people > 8) {
        return 'Укажите число человек от 1 до 8.';
    }

    return '';
}

// Дата необязательная, но если она указана, то не раньше сегодняшнего дня
function checkDate(value) {
    if (value === '') {
        return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(value) < today) {
        return 'Дата не может быть раньше сегодняшней.';
    }

    return '';
}

const orderForm = document.querySelector('#order-form');

if (orderForm) {
    const itemSelect = orderForm.querySelector('#order-item');
    const dateInput = orderForm.querySelector('#order-date');
    const peopleInput = orderForm.querySelector('#order-people');
    const nameInput = orderForm.querySelector('#order-name');
    const phoneInput = orderForm.querySelector('#order-phone');
    const emailInput = orderForm.querySelector('#order-email');
    const agreeInput = orderForm.querySelector('#order-agree');
    const formMessage = orderForm.querySelector('#order-result');

    function validateAgree() {
        if (!agreeInput.checked) {
            showError(agreeInput, 'Нужно согласие на обработку данных.');
            return false;
        }

        clearError(agreeInput);
        return true;
    }

    // Каждая проверка вместе с полем, к которому она относится
    const checks = [
        [itemSelect, () => validateInput(itemSelect, checkItem)],
        [dateInput, () => validateInput(dateInput, checkDate)],
        [peopleInput, () => validateInput(peopleInput, checkPeople)],
        [nameInput, () => validateInput(nameInput, checkName)],
        [phoneInput, () => validateInput(phoneInput, checkPhone)],
        [emailInput, () => validateInput(emailInput, checkEmail)],
        [agreeInput, validateAgree]
    ];

    function showFormMessage(text, isError) {
        formMessage.textContent = text;
        formMessage.classList.toggle('form__result--error', isError);
    }

    orderForm.addEventListener('submit', (event) => {
        // Отменяем стандартную отправку: сервера пока нет
        event.preventDefault();

        // Проверяем все поля сразу, чтобы пользователь увидел все ошибки
        const results = checks.map(([, validate]) => validate());
        const isFormValid = results.every((result) => result);

        if (!isFormValid) {
            showFormMessage('Проверьте поля формы.', true);
            orderForm.querySelector('[aria-invalid="true"]').focus();
            return;
        }

        const requestData = {
            item: itemSelect.value,
            date: dateInput.value,
            people: Number(peopleInput.value),
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim()
        };

        console.table(requestData);

        // Сначала очищаем форму, потом пишем сообщение: reset стирает сообщение
        orderForm.reset();
        showFormMessage('Заявка подготовлена. Данные выведены в консоль.', false);
    });

    // Ошибка пропадает, как только поле исправлено
    checks.forEach(([input, validate]) => {
        input.addEventListener('change', validate);
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') {
                validate();
            }
        });
    });

    orderForm.addEventListener('reset', () => {
        checks.forEach(([input]) => clearError(input));
        showFormMessage('', false);
    });
}
