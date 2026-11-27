// Проверка форм: общая часть для всех форм сайта и правила проверки полей.
// Ошибки выводятся на страницу рядом с полями, всплывающие окна alert не нужны.
// Место для ошибки лежит в элементе с id "<id поля>-error", он уже связан с полем через aria-describedby.
// Сами формы подключаются здесь (быстрая заявка, вопрос), в order.js (заявка) и в account.js (вход, регистрация).

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

// Проверка, которая нужна не всегда: если isActive() возвращает false, поле пропускается
// (например, поля карты при оплате на месте)
function createConditionalCheck(isActive, input, getMessage) {
    return [input, () => {
        if (!isActive()) {
            clearError(input);
            return true;
        }

        return validateInput(input, getMessage);
    }];
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

// Число человек от 1 до max. Предел зависит от выбранной записи, поэтому он параметр.
function checkPeople(value, max) {
    const people = Number(value);

    if (!Number.isInteger(people) || people < 1 || people > max) {
        return `Укажите число человек от 1 до ${max}.`;
    }

    return '';
}

function checkDays(value) {
    const days = Number(value);

    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
        return `Укажите число дней от 1 до ${MAX_DAYS}.`;
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

    // Дату читаем как местную (с временем 00:00), иначе в некоторых часовых поясах день сдвигается
    if (new Date(`${value}T00:00:00`) < today) {
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

// Логин: от 3 до 20 символов, латиница, цифры и подчёркивание
function checkLogin(value) {
    if (!/^[A-Za-z0-9_]{3,20}$/.test(value)) {
        return 'Логин от 3 до 20 символов: латиница, цифры и подчёркивание.';
    }

    return '';
}

function checkPassword(value) {
    if (value.length < 6) {
        return 'Пароль не короче 6 символов.';
    }

    return '';
}

function checkOrderNumber(value) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 1) {
        return 'Введите номер заявки, например 1024.';
    }

    return '';
}

// Номер карты: 16 цифр и проверка по алгоритму Луна (последняя цифра - контрольная)
function checkCardNumber(value) {
    const digits = value.replace(/\s/g, '');

    if (!/^\d{16}$/.test(digits)) {
        return 'Номер карты состоит из 16 цифр.';
    }

    let sum = 0;

    for (let i = 0; i < digits.length; i += 1) {
        let digit = Number(digits[digits.length - 1 - i]);

        // Каждую вторую цифру справа удваиваем, а если вышло больше 9, вычитаем 9
        if (i % 2 === 1) {
            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
    }

    if (sum % 10 !== 0) {
        return 'Номер карты введён с ошибкой, проверьте цифры.';
    }

    return '';
}

// Срок действия в формате ММ/ГГ, месяц от 01 до 12, срок не истёк
function checkCardExpiry(value) {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);

    if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) {
        return 'Срок действия в формате ММ/ГГ, например 08/28.';
    }

    const now = new Date();
    const expiryYear = 2000 + Number(match[2]);
    const expiryMonth = Number(match[1]);

    if (expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
        return 'Срок действия карты истёк.';
    }

    return '';
}

function checkCardCvc(value) {
    if (!/^\d{3}$/.test(value)) {
        return 'Код CVC состоит из 3 цифр.';
    }

    return '';
}

// Имя на карте латиницей, имя и фамилия через пробел
function checkCardHolder(value) {
    if (!/^[A-Za-z]{2,} [A-Za-z]{2,}$/.test(value.trim())) {
        return 'Имя и фамилия латиницей, как на карте, например IVAN IVANOV.';
    }

    return '';
}

// Общая часть для всех форм: проверка по кнопке, сообщения и сброс.
// checks - список пар "поле и проверка".
// onValid - функция, которая вызывается при верных данных. Она возвращает текст сообщения
// об успехе или null, если сама показала ошибку (например, неверный пароль).
// options.resetAfter: false оставляет значения в полях после успеха.
function setupForm(form, checks, messageElement, onValid, options = {}) {
    function showMessage(text, isError) {
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.classList.toggle('form__result--error', isError);
        }
    }

    form.addEventListener('submit', (event) => {
        // Отменяем стандартную отправку: сервера нет, форму обрабатывает скрипт
        event.preventDefault();

        // Проверяем все поля сразу, чтобы пользователь увидел все ошибки
        const results = checks.map(([, validate]) => validate());
        const isFormValid = results.every((result) => result);

        if (!isFormValid) {
            showMessage('Проверьте поля формы.', true);
            notify('error', 'Проверьте поля формы: есть ошибки.');
            form.querySelector('[aria-invalid="true"]').focus();
            return;
        }

        // Текст получаем до очистки формы, потому что reset стирает и сообщение
        const successText = onValid();

        if (successText === null) {
            return;
        }

        if (options.resetAfter !== false) {
            form.reset();
        }

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
        const order = createOrder({
            title: `Быстрая заявка: ${interest}`,
            items: [],
            total: 0,
            payment: '',
            paymentNote: '',
            name: quickName.value.trim(),
            phone: quickPhone.value.trim(),
            date: ''
        });

        notify('success', `Заявка №${order.id} принята, мы перезвоним.`);

        return `Спасибо, ${quickName.value.trim()}. Номер заявки ${order.id}. Мы перезвоним по номеру ${quickPhone.value.trim()}. Вас интересует: ${interest}.`;
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
        notify('success', 'Вопрос отправлен инструктору.');

        return `Вопрос отправлен. Инструктор ответит на адрес ${questionEmail.value.trim()}.`;
    });
}
