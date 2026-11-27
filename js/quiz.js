// Тест "Какой курс мне подходит": три вопроса и подбор курса по правилам.
// Правила записаны в функции pickCourses, сами курсы берутся из data.js.

const quizForm = document.querySelector('#quiz-form');

// Правила подбора. Возвращает id подходящих курсов (первый главный) и причину.
function pickCourses(experience, who, goal) {
    if (who === 'child7') {
        return { ids: [7], reason: 'Для детей 7-10 лет подходит детская группа: занятия на лодках Оптимист в жилетах, рядом катер инструктора.' };
    }

    if (who === 'child11') {
        return { ids: [8], reason: 'Детям 11-14 лет подходит группа "Юный капитан": ребёнок учится управлять лодкой сам и участвует в клубных гонках.' };
    }

    if (goal === 'try') {
        return { ids: [3, 2], reason: 'Чтобы попробовать, хватит одного занятия на лодке Лазер, а если хочется больше, есть интенсив на выходные.' };
    }

    if (goal === 'skipper') {
        if (experience === 'helm') {
            return { ids: [4, 6], reason: 'Вы уже управляли лодкой, поэтому можно сразу идти на курс шкипера, а швартовку и мотор отработать отдельно.' };
        }

        return { ids: [1, 4], reason: 'Сначала нужны основы: курс для новичков, после него можно идти на курс шкипера.' };
    }

    if (experience === 'helm') {
        return { ids: [9, 10], reason: 'Вы уже управляли лодкой, поэтому можно готовиться к клубной регате.' };
    }

    return { ids: [1, 9], reason: 'Для гонок нужны основы управления: сначала курс для новичков, потом подготовка к регате.' };
}

// Карточка с рекомендованным курсом
function createRecommendation(product, isMain) {
    const box = makeElement('div', 'quiz__answer');
    const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
    const title = makeElement('h3', '', isMain ? `Вам подойдёт: ${product.title}` : `Также можно: ${product.title}`);
    const info = makeElement('p', '', `${product.duration}. ${formatPrice(finalPrice)}. ${getProductStatus(product)}.`);
    const actions = makeElement('div', 'form__actions');
    const moreLink = makeElement('a', 'button button--secondary button--small', 'Подробнее');

    moreLink.href = `course.html?id=${product.id}`;
    actions.append(moreLink);

    if (product.isAvailable) {
        const button = makeElement('button', 'button button--primary button--small', 'В мои записи');

        button.type = 'button';
        button.dataset.action = 'add-to-cart';
        button.dataset.kind = 'course';
        button.dataset.itemId = String(product.id);
        actions.append(button);
    } else {
        const waitLink = makeElement('a', 'button button--secondary button--small', 'В лист ожидания');

        waitLink.href = `order.html?course=${product.id}`;
        actions.append(waitLink);
    }

    box.append(title, info, actions);

    return box;
}

if (quizForm) {
    const quizResult = quizForm.querySelector('#quiz-result');

    // Выбранное значение вопроса или пустая строка, если ответа нет
    function getAnswer(name) {
        const checked = quizForm.querySelector(`input[name="${name}"]:checked`);

        return checked ? checked.value : '';
    }

    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const experience = getAnswer('quiz1');
        const who = getAnswer('quiz2');
        const goal = getAnswer('quiz3');

        quizResult.textContent = '';

        if (experience === '' || who === '' || goal === '') {
            quizResult.textContent = 'Ответьте на все три вопроса.';
            quizResult.classList.add('form__result--error');
            notify('error', 'Ответьте на все три вопроса, чтобы подобрать курс.');
            return;
        }

        const choice = pickCourses(experience, who, goal);

        quizResult.classList.remove('form__result--error');
        quizResult.append(makeElement('p', '', choice.reason));

        choice.ids.forEach((id, index) => {
            quizResult.append(createRecommendation(findProductById(products, id), index === 0));
        });

        notify('info', 'Курс подобран, смотрите под кнопкой.');
    });

    quizForm.addEventListener('reset', () => {
        quizResult.textContent = '';
        quizResult.classList.remove('form__result--error');
    });
}
