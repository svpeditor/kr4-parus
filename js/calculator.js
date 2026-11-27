// Калькулятор стоимости на странице заявки: курс или аренда яхты, число человек и дней,
// дополнительные услуги. Формулы лежат в cart.js (calculateItemTotal), здесь только форма.

const calcForm = document.querySelector('#calc-form');

if (calcForm) {
    const kindSelect = calcForm.querySelector('#calc-kind');
    const itemSelect = calcForm.querySelector('#calc-item');
    const peopleInput = calcForm.querySelector('#calc-people');
    const daysInput = calcForm.querySelector('#calc-days');
    const captainInput = calcForm.querySelector('#calc-captain');
    const optionInputs = calcForm.querySelectorAll('input[name="option"]');
    const linesList = calcForm.querySelector('#calc-lines');
    const totalElement = calcForm.querySelector('#calc-total');
    const addButton = calcForm.querySelector('#calc-add');

    // Список "Что считаем" зависит от вида: все курсы или лодки, которые сдаются
    function fillCalcItems() {
        const kind = kindSelect.value;
        const sources = kind === 'course' ? products : boats.filter((boat) => boat.rentFree > 0);

        itemSelect.textContent = '';

        sources.forEach((source) => {
            const text = kind === 'course'
                ? `${source.title}, ${formatPrice(calculateFinalPrice(source.price, source.discountPercent))}`
                : `${source.name}, от ${formatPrice(source.rentFree)} в день`;
            const option = makeElement('option', '', text);

            option.value = String(source.id);
            itemSelect.append(option);
        });
    }

    function getCalcItem() {
        const kind = kindSelect.value;
        const id = Number(itemSelect.value);
        const people = Number(peopleInput.value);
        const days = Number(daysInput.value);
        const options = Array.from(optionInputs).filter((input) => input.checked).map((input) => input.value);

        if (kind === 'rent') {
            return { kind: kind, id: id, qty: days, people: people, captain: captainInput.checked, options: options };
        }

        return { kind: kind, id: id, qty: people, people: people, captain: false, options: options };
    }

    // Для курса число дней не вводится: услуги "за день" считаются по числу занятий курса
    function updateCalcFields() {
        const isRent = kindSelect.value === 'rent';

        daysInput.disabled = !isRent;
        captainInput.disabled = !isRent;

        if (!isRent) {
            daysInput.value = String(getItemSource(getCalcItem()).lessons);
        }
    }

    function isCalcValid() {
        const people = Number(peopleInput.value);
        const days = Number(daysInput.value);

        return Number.isInteger(people) && people >= 1 && people <= MAX_QTY
            && Number.isInteger(days) && days >= 1 && days <= MAX_DAYS;
    }

    // Строка расчёта: "Название: 2 чел. x 11 610 руб. = 23 220 руб."
    function addLine(text) {
        linesList.append(makeElement('li', '', text));
    }

    function updateCalc() {
        linesList.textContent = '';

        if (!isCalcValid()) {
            totalElement.textContent = 'проверьте числа';
            return;
        }

        const item = getCalcItem();
        const baseSum = getItemUnitPrice(item) * item.qty;

        addLine(`${getItemTitle(item)}: ${item.qty} ${getItemUnit(item)} x ${formatPrice(getItemUnitPrice(item))} = ${formatPrice(baseSum)}`);

        extraOptions.filter((option) => item.options.includes(option.key)).forEach((option) => {
            const sum = calculateOptionsSum({ ...item, options: [option.key] });

            addLine(`${option.title}: ${formatPrice(sum)}`);
        });

        totalElement.textContent = formatPrice(calculateItemTotal(item));
    }

    const checks = [
        createCheck(peopleInput, (value) => checkPeople(value, MAX_QTY)),
        createConditionalCheck(() => kindSelect.value === 'rent', daysInput, checkDays)
    ];

    kindSelect.addEventListener('change', () => {
        fillCalcItems();
        updateCalcFields();
        updateCalc();
    });

    itemSelect.addEventListener('change', () => {
        updateCalcFields();
        updateCalc();
    });

    [peopleInput, daysInput, captainInput, ...optionInputs].forEach((field) => {
        field.addEventListener('input', updateCalc);
        field.addEventListener('change', updateCalc);
    });

    // Кнопка "Рассчитать" проверяет поля и показывает ошибки, расчёт при этом идёт и так
    setupForm(calcForm, checks, null, () => {
        updateCalc();

        return '';
    }, { resetAfter: false });

    // Кнопка "В мои записи": расчёт попадает в корзину вместе с дополнительными услугами
    addButton.addEventListener('click', () => {
        if (!checks.map(([, validate]) => validate()).every((result) => result)) {
            notify('error', 'Проверьте числа в калькуляторе.');
            return;
        }

        const item = getCalcItem();
        const details = { qty: item.qty, people: item.people, captain: item.captain, options: item.options };

        if (addToCart(item.kind, item.id, details)) {
            notify('success', `Расчёт добавлен в мои записи: ${getItemTitle(item)}.`);
        } else {
            notify('warning', 'Столько добавить нельзя: максимум для этой записи уже выбран.');
        }
    });

    // Курс или аренда можно передать в адресе: order.html?course=3#calc или ?rent=4#calc
    const params = new URLSearchParams(window.location.search);

    if (params.has('rent')) {
        kindSelect.value = 'rent';
    }

    fillCalcItems();

    ['course', 'rent'].forEach((kind) => {
        const hasOption = Array.from(itemSelect.options).some((option) => option.value === params.get(kind));

        if (params.has(kind) && kindSelect.value === kind && hasOption) {
            itemSelect.value = params.get(kind);
        }
    });

    updateCalcFields();
    updateCalc();
}
