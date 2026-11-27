// Данные сайта "Парус".
// Каталог хранится массивом объектов. У всех курсов одинаковые свойства.
// В коде курс назван product (товар), как в методических указаниях.
// category: beginner - для новичков, skipper - шкипер, kids - детская группа, regatta - регатный курс.
const products = [
    {
        id: 1,
        title: 'Азы парусного спорта',
        category: 'beginner',
        price: 12900,
        discountPercent: 10,
        rating: 4.7,
        isAvailable: true
    },
    {
        id: 2,
        title: 'Интенсив на выходные',
        category: 'beginner',
        price: 8500,
        discountPercent: 0,
        rating: 4.6,
        isAvailable: true
    },
    {
        id: 3,
        title: 'Занятие на лодке Лазер',
        category: 'beginner',
        price: 3200,
        discountPercent: 0,
        rating: 4.5,
        isAvailable: true
    },
    {
        id: 4,
        title: 'Шкипер-прибрежник',
        category: 'skipper',
        price: 36000,
        discountPercent: 5,
        rating: 4.9,
        isAvailable: true
    },
    {
        id: 5,
        title: 'Навигация и работа с картой',
        category: 'skipper',
        price: 14500,
        discountPercent: 0,
        rating: 4.4,
        isAvailable: false
    },
    {
        id: 6,
        title: 'Швартовка и управление под мотором',
        category: 'skipper',
        price: 9800,
        discountPercent: 0,
        rating: 4.6,
        isAvailable: true
    },
    {
        id: 7,
        title: 'Детская группа 7-10 лет',
        category: 'kids',
        price: 9500,
        discountPercent: 10,
        rating: 4.8,
        isAvailable: true
    },
    {
        id: 8,
        title: 'Юный капитан 11-14 лет',
        category: 'kids',
        price: 11000,
        discountPercent: 0,
        rating: 4.7,
        isAvailable: true
    },
    {
        id: 9,
        title: 'Подготовка к клубной регате',
        category: 'regatta',
        price: 15000,
        discountPercent: 5,
        rating: 4.7,
        isAvailable: true
    },
    {
        id: 10,
        title: 'Тактика гонки и работа экипажа',
        category: 'regatta',
        price: 17500,
        discountPercent: 0,
        rating: 4.5,
        isAvailable: false
    }
];
