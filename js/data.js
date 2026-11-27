// Данные сайта "Парус".
// Каталог хранится массивом объектов. У всех курсов одинаковые свойства.
// В коде курс назван product (товар), как в методических указаниях.
// category: beginner - для новичков, skipper - шкипер, kids - детская группа, regatta - регатный курс.
// image - имя файла картинки в папке images без расширения, imageAlt - описание картинки для alt.
const products = [
    {
        id: 1,
        title: 'Азы парусного спорта',
        category: 'beginner',
        price: 12900,
        discountPercent: 10,
        rating: 4.7,
        isAvailable: true,
        image: 'small-sloop',
        imageAlt: 'Небольшая белая яхта на воде у берега',
        duration: '4 занятия по 4 часа',
        description: 'Устройство яхты, повороты, работа с парусами и безопасность на воде. Практика на учебной яхте.'
    },
    {
        id: 2,
        title: 'Интенсив на выходные',
        category: 'beginner',
        price: 8500,
        discountPercent: 0,
        rating: 4.6,
        isAvailable: true,
        image: 'bow-view',
        imageAlt: 'Вид с борта на паруса и воду',
        duration: '2 дня по 6 часов',
        description: 'Два дня на воде: основы управления и первый самостоятельный выход вместе с инструктором.'
    },
    {
        id: 3,
        title: 'Занятие на лодке Лазер',
        category: 'beginner',
        price: 3200,
        discountPercent: 0,
        rating: 4.5,
        isAvailable: true,
        image: 'laser',
        imageAlt: 'Спортсмен на одиночной лодке с красным парусом',
        duration: '1 занятие, 2 часа',
        description: 'Одно занятие с инструктором на одиночной спортивной лодке. Подходит, чтобы попробовать.'
    },
    {
        id: 4,
        title: 'Шкипер-прибрежник',
        category: 'skipper',
        price: 36000,
        discountPercent: 5,
        rating: 4.9,
        isAvailable: true,
        image: 'cruiser-a',
        imageAlt: 'Килевая яхта под парусами на озере',
        duration: '8 занятий и экзамен',
        description: 'Управление яхтой в прибрежной зоне, расчёт курса, швартовка. В конце теоретический и практический экзамен.'
    },
    {
        id: 5,
        title: 'Навигация и работа с картой',
        category: 'skipper',
        price: 14500,
        discountPercent: 0,
        rating: 4.4,
        isAvailable: false,
        image: 'cruiser-c',
        imageAlt: 'Яхта с белыми парусами идёт по спокойной воде',
        duration: '3 занятия по 3 часа',
        description: 'Прокладка курса, ориентиры, огни и знаки на воде. Для тех, кто уже ходит на яхте.'
    },
    {
        id: 6,
        title: 'Швартовка и управление под мотором',
        category: 'skipper',
        price: 9800,
        discountPercent: 0,
        rating: 4.6,
        isAvailable: true,
        image: 'cruiser-b',
        imageAlt: 'Прогулочная яхта идёт под парусами',
        duration: '2 занятия по 3 часа',
        description: 'Подход к причалу, стоянка в тесноте, работа с мотором и кранцами.'
    },
    {
        id: 7,
        title: 'Детская группа 7-10 лет',
        category: 'kids',
        price: 9500,
        discountPercent: 10,
        rating: 4.8,
        isAvailable: true,
        image: 'optimist-beach',
        imageAlt: 'Детские лодки с разноцветными парусами на песчаном берегу',
        duration: '8 занятий по 2 часа',
        description: 'Занятия на детских лодках Оптимист в спасательных жилетах. В группе до 8 детей, рядом катер инструктора.'
    },
    {
        id: 8,
        title: 'Юный капитан 11-14 лет',
        category: 'kids',
        price: 11000,
        discountPercent: 0,
        rating: 4.7,
        isAvailable: true,
        image: 'optimist-group',
        imageAlt: 'Группа маленьких парусных лодок на воде',
        duration: '10 занятий по 3 часа',
        description: 'Дети учатся управлять лодкой сами, ходят короткие маршруты и участвуют в клубных гонках.'
    },
    {
        id: 9,
        title: 'Подготовка к клубной регате',
        category: 'regatta',
        price: 15000,
        discountPercent: 5,
        rating: 4.7,
        isAvailable: true,
        image: 'regatta-fd',
        imageAlt: 'Три гоночные лодки с белыми парусами идут по дистанции',
        duration: '6 занятий по 4 часа',
        description: 'Старт, повороты, тактика на дистанции. В конце участие в клубной регате.'
    },
    {
        id: 10,
        title: 'Тактика гонки и работа экипажа',
        category: 'regatta',
        price: 17500,
        discountPercent: 0,
        rating: 4.5,
        isAvailable: false,
        image: 'racer-red',
        imageAlt: 'Гоночная яхта с красным спинакером',
        duration: '5 занятий по 4 часа',
        description: 'Работа экипажа на гоночной яхте со спинакером, распределение ролей, разбор стартов.'
    }
];
