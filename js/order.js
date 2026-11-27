// Страница заявки: список записей из data.js, предварительный расчёт суммы,
// способы оплаты (карта, СБП, на месте) и создание заявки.
// Правила проверки полей лежат в validation.js, заявки сохраняет account.js.

const orderForm = document.querySelector('#order-form');

if (orderForm) {
    const itemSelect = orderForm.querySelector('#order-item');
    const dateInput = orderForm.querySelector('#order-date');
    const peopleInput = orderForm.querySelector('#order-people');
    const daysInput = orderForm.querySelector('#order-days');
    const captainInput = orderForm.querySelector('#order-captain');
    const nameInput = orderForm.querySelector('#order-name');
    const phoneInput = orderForm.querySelector('#order-phone');
    const emailInput = orderForm.querySelector('#order-email');
    const commentInput = orderForm.querySelector('#order-comment');
    const agreeInput = orderForm.querySelector('#order-agree');
    const totalElement = orderForm.querySelector('#order-total');
    const noteElement = orderForm.querySelector('#order-note');
    const statusLink = orderForm.querySelector('#order-status-link');

    const paymentFieldset = orderForm.querySelector('#payment');
    const paymentBlocks = orderForm.querySelectorAll('.payment-block');
    const cardNumberInput = orderForm.querySelector('#pay-card-number');
    const cardExpiryInput = orderForm.querySelector('#pay-card-expiry');
    const cardCvcInput = orderForm.querySelector('#pay-card-cvc');
    const cardHolderInput = orderForm.querySelector('#pay-card-holder');
    const sbpPhoneInput = orderForm.querySelector('#pay-sbp-phone');

    // ----- Список записей в выпадающем списке -----

    function createOption(value, text) {
        const option = makeElement('option', '', text);

        option.value = value;

        return option;
    }

    function createGroup(label, options) {
        const group = makeElement('optgroup');

        group.label = label;
        options.forEach((option) => group.append(option));

        return group;
    }

    function fillItemSelect() {
        const cart = getCart();

        if (cart.length > 0) {
            itemSelect.append(createOption('cart', `Всё из корзины, записей: ${cart.length}, ${formatPrice(calculateCartTotal(cart))}`));
        }

        itemSelect.append(createGroup('Курсы', products.map((product) => {
            const price = formatPrice(calculateFinalPrice(product.price, product.discountPercent));
            const closed = product.isAvailable ? '' : ' (набор закрыт)';

            return createOption(`course-${product.id}`, `${product.title}, ${price}${closed}`);
        })));

        itemSelect.append(createGroup('Выходы', outings.map((outing) => {
            const full = outing.free > 0 ? '' : ' (мест нет)';

            return createOption(`trip-${outing.id}`, `${formatOutingDate(outing)}, ${outing.title}, ${formatPrice(outing.price)}${full}`);
        })));

        itemSelect.append(createGroup('Аренда яхты', boats.filter((boat) => boat.rentFree > 0).map((boat) => {
            return createOption(`rent-${boat.id}`, `${boat.name}, от ${formatPrice(boat.rentFree)} в день`);
        })));
    }

    // ----- Выбранная запись -----

    // Выбранная в форме запись в виде позиции корзины. Для "Всё из корзины" и пустого выбора null.
    function getFormItem() {
        if (itemSelect.value === '' || itemSelect.value === 'cart') {
            return null;
        }

        const [kind, id] = itemSelect.value.split('-');
        const people = Number(peopleInput.value) || 1;

        if (kind === 'rent') {
            return { kind: kind, id: Number(id), qty: Number(daysInput.value) || 1, people: people, captain: captainInput.checked, options: [] };
        }

        return { kind: kind, id: Number(id), qty: people, people: people, captain: false, options: [] };
    }

    function isCartSelected() {
        return itemSelect.value === 'cart';
    }

    // Лист ожидания: набор на курс закрыт или на выходе нет мест
    function isWaitlistItem(item) {
        if (item.kind === 'course') {
            return !getItemSource(item).isAvailable;
        }

        return item.kind === 'trip' && getItemSource(item).free === 0;
    }

    // Сколько человек можно записать: на яхте не больше, чем в экипаже, на выходе не больше свободных мест
    function getPeopleLimit() {
        const item = getFormItem();

        if (item === null) {
            return MAX_QTY;
        }

        if (item.kind === 'rent') {
            return getItemSource(item).crew;
        }

        return isWaitlistItem(item) ? MAX_QTY : Math.min(getItemMaxQty(item), MAX_QTY);
    }

    function getPaymentMethod() {
        return orderForm.querySelector('input[name="pay"]:checked').value;
    }

    // ----- Способ оплаты -----

    // Показываем только блок выбранного способа, ошибки в скрытых блоках убираем
    function showPaymentBlock() {
        const method = getPaymentMethod();

        paymentBlocks.forEach((block) => {
            block.hidden = block.dataset.payment !== method;

            if (block.hidden) {
                block.querySelectorAll('input').forEach((input) => clearError(input));
            }
        });
    }

    function isPaymentActive(method) {
        return !paymentFieldset.hidden && getPaymentMethod() === method;
    }

    // Что сохранить о способе оплаты. Номер карты целиком и код не сохраняем, только последние 4 цифры.
    function getPaymentNote(method) {
        if (method === 'card') {
            return `**** ${cardNumberInput.value.replace(/\s/g, '').slice(-4)}`;
        }

        return method === 'sbp' ? sbpPhoneInput.value.trim() : '';
    }

    // Подсказки при вводе карты: пробелы в номере, слэш в сроке, только цифры в коде
    cardNumberInput.addEventListener('input', () => {
        cardNumberInput.value = cardNumberInput.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    cardExpiryInput.addEventListener('input', () => {
        const digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);

        cardExpiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });

    cardCvcInput.addEventListener('input', () => {
        cardCvcInput.value = cardCvcInput.value.replace(/\D/g, '').slice(0, 3);
    });

    cardHolderInput.addEventListener('input', () => {
        cardHolderInput.value = cardHolderInput.value.toUpperCase();
    });

    orderForm.querySelectorAll('input[name="pay"]').forEach((radio) => {
        radio.addEventListener('change', showPaymentBlock);
    });

    // ----- Предварительный расчёт и доступность полей -----

    function updateOrderForm() {
        const item = getFormItem();
        const isRent = item !== null && item.kind === 'rent';
        const waitlist = item !== null && isWaitlistItem(item);
        let note = '';

        daysInput.disabled = !isRent;
        captainInput.disabled = !isRent;
        peopleInput.disabled = isCartSelected();
        peopleInput.max = String(getPeopleLimit());

        if (isCartSelected()) {
            totalElement.textContent = `Итого: ${formatPrice(calculateCartTotal(getCart()))}`;
            note = 'В заявку войдут все записи из корзины, число человек и дней берётся из неё.';
        } else if (item === null) {
            totalElement.textContent = '';
        } else {
            totalElement.textContent = `Итого: ${formatPrice(calculateItemTotal(item))}`;
        }

        if (waitlist) {
            note = 'Набор закрыт или мест нет. Заявка попадёт в лист ожидания, платить сейчас не нужно.';
        }

        if (isRent && !item.captain) {
            note = 'Без капитана яхту сдаём после проверки опыта, администратор уточнит это по телефону.';
        }

        noteElement.textContent = note;
        paymentFieldset.hidden = waitlist;
    }

    [itemSelect, peopleInput, daysInput, captainInput].forEach((field) => {
        field.addEventListener('input', updateOrderForm);
        field.addEventListener('change', updateOrderForm);
    });

    // reset возвращает поля к начальным значениям после события, поэтому обновляем с задержкой 0
    orderForm.addEventListener('reset', () => {
        setTimeout(() => {
            updateOrderForm();
            showPaymentBlock();
        }, 0);
    });

    // ----- Проверка и отправка -----

    const checks = [
        createCheck(itemSelect, checkItem),
        createCheck(dateInput, checkDate),
        createConditionalCheck(() => !isCartSelected(), peopleInput, (value) => checkPeople(value, getPeopleLimit())),
        createConditionalCheck(() => getFormItem() !== null && getFormItem().kind === 'rent', daysInput, checkDays),
        createCheck(nameInput, checkName),
        createCheck(phoneInput, checkPhone),
        createCheck(emailInput, checkEmail),
        createConditionalCheck(() => isPaymentActive('card'), cardNumberInput, checkCardNumber),
        createConditionalCheck(() => isPaymentActive('card'), cardExpiryInput, checkCardExpiry),
        createConditionalCheck(() => isPaymentActive('card'), cardCvcInput, checkCardCvc),
        createConditionalCheck(() => isPaymentActive('card'), cardHolderInput, checkCardHolder),
        createConditionalCheck(() => isPaymentActive('sbp'), sbpPhoneInput, checkPhone),
        createAgreeCheck(agreeInput)
    ];

    setupForm(orderForm, checks, orderForm.querySelector('#order-result'), () => {
        const items = isCartSelected() ? getCart() : [getFormItem()];
        const waitlist = !isCartSelected() && isWaitlistItem(items[0]);
        const method = waitlist ? '' : getPaymentMethod();
        const total = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

        const order = createOrder({
            title: items.length === 1 ? getItemTitle(items[0]) : `Записи из корзины: ${items.length}`,
            items: items,
            total: total,
            payment: method,
            paymentNote: getPaymentNote(method),
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            date: dateInput.value,
            comment: commentInput.value.trim(),
            waitlist: waitlist
        });

        if (isCartSelected()) {
            clearCart();
        }

        statusLink.href = `account.html?number=${order.id}#status`;
        statusLink.hidden = false;

        if (!getCurrentUser()) {
            notify('info', 'Войдите в личный кабинет, чтобы заявки были в списке. Статус можно узнать и по номеру.');
        }

        if (waitlist) {
            notify('warning', `Заявка №${order.id} в листе ожидания.`);

            return `Заявка №${order.id} принята в лист ожидания: ${order.title}. Оплата не нужна, мы позвоним, когда освободится место.`;
        }

        notify('success', `Заявка №${order.id} принята.`);

        const paymentText = method === 'cash' ? 'оплата на месте' : `${getPaymentText(order)}, платёж отправлен в банк (это имитация)`;

        return `Заявка №${order.id} принята: ${order.title}. Сумма ${formatPrice(total)}, ${paymentText}. Статус заявки можно узнать по номеру в личном кабинете.`;
    });

    // ----- Начальное состояние -----

    fillItemSelect();

    // Если пришли с кнопки "Записаться" или из корзины, в адресе есть ?course=3, ?trip=5, ?rent=2 или ?cart=1
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

    if (params.has('cart')) {
        if (getCart().length > 0) {
            itemSelect.value = 'cart';
        } else {
            notify('info', 'В корзине пока ничего нет, выберите курс, выход или аренду в списке.');
        }
    }

    const currentUser = getCurrentUser();

    if (currentUser) {
        emailInput.value = currentUser.email;
    }

    updateOrderForm();
    showPaymentBlock();

    if (getFormItem() !== null && isWaitlistItem(getFormItem())) {
        notify('warning', 'Набор закрыт или мест нет: можно встать в лист ожидания.');
    }
}
