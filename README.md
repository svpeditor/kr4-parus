# kr4-parus

## Контрольная работа №4

Тема: "JavaScript: интерактивность, DOM, события, формы и валидация".

Студент: Климашевский Даниил Александрович, группа ЭФБО-07-25.

## Ссылки

- репозиторий: https://github.com/svpeditor/kr4-parus
- проект КР №3, который взят за основу: https://github.com/svpeditor/kr3-parus

## Основа проекта

Проект `kr4-parus` создан на основе проекта `kr3-parus`.

В качестве основы используется адаптивная версия HTML/CSS-сайта из контрольной работы №3: парусная школа и яхт-клуб "Парус" на Клязьминском водохранилище. Страницы, стили, картинки и `js/main.js` скопированы из КР №3, папка `lighthouse/` с отчётами КР №3 не переносилась.

Сайт учебный, школа, адрес, телефон и почта вымышленные. В коде курс называется `product` (товар), как в методических указаниях.

## Практическая работа №15

Выполнено:

- создан отдельный репозиторий `kr4-parus`;
- перенесена основа сайта из КР №3;
- создана папка `js`;
- создан файл `js/data.js`;
- создан файл `js/main.js`;
- JavaScript подключён через `defer`;
- создан объект курса `product`;
- написаны функции форматирования цены, расчёта скидки, определения статуса и краткого описания;
- результат выведен в консоль;
- результат выведен на страницу через `textContent`.

Папка `js` и файл `main.js` уже были в КР №3 (модальное окно, меню, фильтры), этот код остался в конце `main.js`. В начало файла добавлены объект из `data.js`, функции `formatPrice`, `calculateDiscount`, `calculateFinalPrice`, `getProductStatus` и `createProductSummary`, а также примеры типов данных и операторов.

## Принцип безопасного вывода данных

Для вывода пользовательских данных и данных, которые в будущем могут прийти из формы, `localStorage` или API, используется `textContent`, а не `innerHTML`.

`innerHTML` воспринимает строку как HTML-разметку, и если в ней окажется тег с обработчиком события, он выполнится. `textContent` выводит строку как обычный текст, поэтому тег останется просто текстом на странице.

## Структура проекта

```text
kr4-parus/
├── index.html
├── courses.html
├── course.html
├── fleet.html
├── schedule.html
├── order.html
├── account.html
├── contacts.html
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── data.js
│   └── main.js
├── images/
├── README.md
└── .gitignore
```

## Фотографии

Все фотографии свободные, взяты со Wikimedia Commons. Фото обрезаны и уменьшены до 800x600 и 480x360 (главное фото ещё и до 800x450), других изменений нет. Большинство снимков сделано не на Клязьминском водохранилище, они показывают лодки и яхты вообще; фото "club-training" и "klyazma-sunset" сняты на Клязьминском водохранилище.

| Файл на сайте | Что на фото | Автор | Лицензия | Источник |
| --- | --- | --- | --- | --- |
| `hero-desktop.jpg, hero-mobile.jpg` | Яхта на Боденском озере, главная | Matti Blume | CC BY-SA 4.0 | [Sailing on Lake Constance (1X7A0009).jpg](https://commons.wikimedia.org/wiki/File:Sailing_on_Lake_Constance_%281X7A0009%29.jpg) |
| `laser.jpg` | Одиночная лодка Лазер | Andy Fogg | CC BY 2.0 | [Laser dinghy pilot.jpg](https://commons.wikimedia.org/wiki/File:Laser_dinghy_pilot.jpg) |
| `optimist-beach.jpg` | Детские лодки на берегу | Hapebalf | CC BY-SA 3.0 | [2011-06 Niendorf Jollenstation - Auftakeln der Optimisten.jpg](https://commons.wikimedia.org/wiki/File:2011-06_Niendorf_Jollenstation_-_Auftakeln_der_Optimisten.jpg) |
| `optimist-group.jpg` | Группа детских лодок на воде | Nino barbieri | CC BY-SA 2.5 | [- Ammersee - Sailboats -.jpg](https://commons.wikimedia.org/wiki/File:-_Ammersee_-_Sailboats_-.jpg) |
| `optimist-pair.jpg` | Две детские лодки | Jacek Halicki | CC BY-SA 4.0 | [2014 Żaglówki szkółki żeglarskej w Gdyni 01.jpg](https://commons.wikimedia.org/wiki/File:2014_%C5%BBagl%C3%B3wki_szk%C3%B3%C5%82ki_%C5%BCeglarskej_w_Gdyni_01.jpg) |
| `cruiser-a.jpg` | Килевая яхта | Matti Blume | CC BY-SA 4.0 | [Sailing on Lake Constance (1X7A0062).jpg](https://commons.wikimedia.org/wiki/File:Sailing_on_Lake_Constance_%281X7A0062%29.jpg) |
| `cruiser-b.jpg` | Прогулочная яхта | Matti Blume | CC BY-SA 4.0 | [Sailing on Lake Constance (1X7A0008).jpg](https://commons.wikimedia.org/wiki/File:Sailing_on_Lake_Constance_%281X7A0008%29.jpg) |
| `cruiser-c.jpg` | Яхта на спокойной воде | Matti Blume | CC BY-SA 4.0 | [Sailing on Lake Constance, (1X7A9987).jpg](https://commons.wikimedia.org/wiki/File:Sailing_on_Lake_Constance,_%281X7A9987%29.jpg) |
| `regatta-fd.jpg` | Гоночные лодки Летучий голландец | Bill Blevins (flickr sailorbill) | CC BY 2.0 | [Flying Dutchman NY 2008 regatta.jpg](https://commons.wikimedia.org/wiki/File:Flying_Dutchman_NY_2008_regatta.jpg) |
| `racer-red.jpg` | Гоночная яхта со спинакером | Sailbeebe | CC BY-SA 3.0 | [Nitemare.JPG](https://commons.wikimedia.org/wiki/File:Nitemare.JPG) |
| `club-training.jpg` | Яхты на водохранилище, тренировка яхт-клуба | Iluha81 | CC BY 3.0 | [Тренировка участников яхтклуба - panoramio.jpg](https://commons.wikimedia.org/wiki/File:%D0%A2%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D1%83%D1%87%D0%B0%D1%81%D1%82%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2_%D1%8F%D1%85%D1%82%D0%BA%D0%BB%D1%83%D0%B1%D0%B0_-_panoramio.jpg) |
| `klyazma-sunset.jpg` | Закат на Клязьминском водохранилище | Sergey A. | CC BY 4.0 | [20220813 Klyazma reservoir sunset 01.jpg](https://commons.wikimedia.org/wiki/File:20220813_Klyazma_reservoir_sunset_01.jpg) |
| `harbour-masts.jpg` | Яхты у причала | Faldrian | CC BY 3.0 | [Bodenseewoche (215290741).jpeg](https://commons.wikimedia.org/wiki/File:Bodenseewoche_%28215290741%29.jpeg) |
| `small-sloop.jpg` | Малая яхта | mattbuck | CC BY-SA 3.0 | [Lake Windermere MMB A1 Bowness-on-Windermere.jpg](https://commons.wikimedia.org/wiki/File:Lake_Windermere_MMB_A1_Bowness-on-Windermere.jpg) |
| `bow-view.jpg` | Вид с носа яхты на паруса | Alexey Komarov | CC BY-SA 4.0 | [Sailing in Gulf of Finland, Russia-1.jpg](https://commons.wikimedia.org/wiki/File:Sailing_in_Gulf_of_Finland,_Russia-1.jpg) |
