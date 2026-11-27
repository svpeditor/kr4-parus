// Проверка форм: заявка на order.html, быстрая заявка в окне на главной, вопрос на contacts.html.
// Ошибки выводятся на страницу рядом с полями, всплывающие окна alert не нужны.
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

// Пара "поле и его проверка" для списка проверок формы
function createCheck(input, getMessage) {
    return [input, () => validateInput(input, getMessage)];
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

function checkQuestion(value) {
    if (value.trim().length < 10) {
        return 'Опишите вопрос подробнее, не короче 10 символов.';
    }

    return '';
}

// Чекбокс согласия проверяется отдельно, у него нет value
function createAgreeCheck(input) {
    return [input, () => {
        if (!input.checked) {
            showError(input, 'Нужно согласие на обработку данных.');
            return false;
        }

        clearError(input);
        return true;
    }];
}

// Общая часть для всех форм: проверка по кнопке, сообщения и сброс.
// checks - список пар "поле и проверка", getSuccessText - функция, которая
// вызывается при верных данных и возвращает текст сообщения об успехе.
function setupForm(form, checks, messageElement, getSuccessText) {
    function showMessage(text, isError) {
        messageElement.textContent = text;
        messageElement.classList.toggle('form__result--error', isError);
    }

    form.addEventListener('submit', (event) => {
        // Отменяем стандартную отправку: сервера нет, форму обрабатывает скрипт
        event.preventDefault();

        // Проверяем все поля сразу, чтобы пользователь увидел все ошибки
        const results = checks.map(([, validate]) => validate());
        const isFormValid = results.every((result) => result);

        if (!isFormValid) {
            showMessage('Проверьте поля формы.', true);
            form.querySelector('[aria-invalid="true"]').focus();
            return;
        }

        // Текст читаем до очистки формы, потому что reset стирает и сообщение
        const successText = getSuccessText();

        form.reset();
        showMessage(successText, false);
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

    form.addEventListener('reset', () => {
        checks.forEach(([input]) => clearError(input));
        showMessage('', false);
    });
}

// Заявка на странице order.html
const orderForm = document.querySelector('#order-form');

if (orderForm) {
    const itemSelect = orderForm.querySelector('#order-item');
    const dateInput = orderForm.querySelector('#order-date');
    const peopleInput = orderForm.querySelector('#order-people');
    const nameInput = orderForm.querySelector('#order-name');
    const phoneInput = orderForm.querySelector('#order-phone');
    const emailInput = orderForm.querySelector('#order-email');
    const agreeInput = orderForm.querySelector('#order-agree');

    // Если пришли по кнопке "Записаться", в адресе есть ?course=3, ?trip=5 или ?rent=2
    const params = new URLSearchParams(window.location.search);

    ['course', 'trip', 'rent'].forEach((kind) => {
        if (!params.has(kind)) {
            return;
        }

        const value = `${kind}-${params.get(kind)}`;
        const hasOption = Array.from(itemSelect.options).some((option) => option.value === value);

        if (hasOption) {
            itemSelect.value = value;
        }
    });

    const checks = [
        createCheck(itemSelect, checkItem),
        createCheck(dateInput, checkDate),
        createCheck(peopleInput, checkPeople),
        createCheck(nameInput, checkName),
        createCheck(phoneInput, checkPhone),
        createCheck(emailInput, checkEmail),
        createAgreeCheck(agreeInput)
    ];

    setupForm(orderForm, checks, orderForm.querySelector('#order-result'), () => {
        const itemName = itemSelect.options[itemSelect.selectedIndex].textContent;

        return `Заявка подготовлена: ${itemName}. Мы позвоним по номеру ${phoneInput.value.trim()} и подтвердим дату.`;
    });
}

// Быстрая заявка в модальном окне на главной
const quickForm = document.querySelector('#quick-form');

if (quickForm) {
    const quickName = quickForm.querySelector('#quick-name');
    const quickPhone = quickForm.querySelector('#quick-phone');
    const quickInterest = quickForm.querySelector('#quick-interest');

    const checks = [
        createCheck(quickName, checkName),
        createCheck(quickPhone, checkPhone)
    ];

    setupForm(quickForm, checks, quickForm.querySelector('#quick-result'), () => {
        const interest = quickInterest.options[quickInterest.selectedIndex].textContent.toLowerCase();

        return `Спасибо, ${quickName.value.trim()}. Мы перезвоним по номеру ${quickPhone.value.trim()} Вас интересует: ${interest}.`;
    });
}

// Вопрос инструктору на странице контактов
const questionForm = document.querySelector('#question-form');

if (questionForm) {
    const questionName = questionForm.querySelector('#question-name');
    const questionEmail = questionForm.querySelector('#question-email');
    const questionText = questionForm.querySelector('#question-text');

    const checks = [
        createCheck(questionName, checkName),
        createCheck(questionEmail, checkEmail),
        createCheck(questionText, checkQuestion)
    ];

    setupForm(questionForm, checks, questionForm.querySelector('#question-result'), () => {
        return `Вопрос отправлен. Инструктор ответит на адрес ${questionEmail.value.trim()}.`;
    });
}
