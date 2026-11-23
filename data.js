/* ILU QUEST — demo dataset for Elista.
   Coordinates left null; map module geocodes via Yandex Maps. */

window.PLACE_QUEST_PLACES = [
  {
    id: 'marko-polo',
    name: 'Марко Поло',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'квартал Сити-Чесс, 24',
    hours: '12:00–23:00',
    price: 1500,
    priceLabel: '1 500 ₽',
    rating: 4.7,
    tags: ['веранда', 'парковка', 'живая музыка'],
    image: 'https://avatars.mds.yandex.net/get-altay/18144645/2a0000019dc90a9249f41e2afc7eb1e46f2e/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/5100737/2a0000017c510c3b4ea77432e292c4bd5e76/XXXL',
      'https://avatars.mds.yandex.net/get-altay/10845257/2a0000018acaf7fd3dd6081cf0760effebc9/XXXL'
    ],
    description: 'Атмосферное место для особенного вечера в Сити-Чесс. Пространство для встреч, красивых ужинов и небольших праздников.',
    features: ['Веранда', 'Музыкальные вечера', 'Парковка'],
    lat: null,
    lon: null
  },
  {
    id: 'ice',
    name: 'Айс',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. А.С. Пушкина, 22',
    hours: '09:00–22:00',
    price: 450,
    priceLabel: '450 ₽',
    rating: 4.1,
    tags: ['вай-фай', 'детские кресла', 'бизнес-ланч'],
    image: 'https://avatars.mds.yandex.net/get-altay/15437010/2a00000198cf83e76f645f119edb01ed662e/XXXL',
    gallery: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1000&q=85'
    ],
    description: 'Небольшое кафе для завтрака, кофе и короткой паузы в течение дня. Удобный вариант, когда хочется перекусить без долгих планов.',
    features: ['Доступный средний чек', 'Детские кресла', 'Бизнес-ланч'],
    lat: null,
    lon: null
  },
  {
    id: 'tulpan',
    name: 'Тюльпан',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. Джангара, 44',
    hours: '11:00–00:00',
    price: 1200,
    priceLabel: '1 200 ₽',
    rating: 4.4,
    tags: ['вай-фай', 'живая музыка', 'парковка'],
    image: 'https://avatars.mds.yandex.net/get-altay/16413591/2a000001992d2aec3b1169e23fa480764055/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/4344240/2a0000017758e5a764738009aeaa93ff69fd/XXXL',
      'https://avatars.mds.yandex.net/get-altay/16792294/2a00000199d366d8c5a321a843bb351cac62/XXXL'
    ],
    description: 'Ресторан для тёплых встреч и вечеров с музыкой. Подойдёт для ужина, свидания или встречи небольшой компанией.',
    features: ['Живая музыка', 'Wi-Fi для гостей', 'Парковка рядом'],
    lat: null,
    lon: null
  },
  {
    id: 'kochevnik',
    name: 'Этно-кафе «Кочевник»',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. Петра Бураева',
    hours: '10:00–23:00',
    price: 800,
    priceLabel: '800 ₽',
    rating: 4.5,
    tags: ['калмыцкая кухня', 'чай', 'борцоги'],
    image: 'https://avatars.mds.yandex.net/get-altay/9916116/2a0000018a133506ae549c2515e35a1757a8/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/9954022/2a00000187e14f7782056a6e34408cc16016/XXXL',
      'https://avatars.mds.yandex.net/get-altay/17753003/2a0000019ea7e544f83e2b4c6afce8a057d0/XXXL'
    ],
    description: 'Этнографическое кафе с аутентичной калмыцкой кухней. Место, где можно попробовать борцоги и калмыцкий чай в атмосфере национального колорита.',
    features: ['Калмыцкая кухня', 'Национальный колорит', 'Чайная церемония'],
    lat: null,
    lon: null
  },
  {
    id: 'uralan',
    name: 'Главная Калмыцкая кухня',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. Н. Очирова, 9',
    hours: '11:00–00:00',
    price: 1000,
    priceLabel: '1 000 ₽',
    rating: 4.6,
    tags: ['калмыцкая кухня', 'борцоги', 'чай'],
    image: 'https://avatars.mds.yandex.net/get-altay/6213366/2a0000018db3a32ccd39bfc7bb847f8b54b8/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/11047345/2a0000018dc55f8023f1b2399359b0da8bf2/XXXL',
      'https://avatars.mds.yandex.net/get-altay/10578166/2a0000018da6eb638e052825e7a970d4fc51/XXXL'
    ],
    description: 'Ресторан традиционной калмыцкой кухни. Подойдёт для знакомства с национальными блюдами и неспешного обеда.',
    features: ['Калмыцкая кухня', 'Борцоги', 'Калмыцкий чай'],
    lat: null,
    lon: null
  },
  {
    id: 'kalmytskaya-1',
    name: 'Калмыцкая кухня №1',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. Ленина, 200',
    hours: '10:00–22:00',
    price: 700,
    priceLabel: '700 ₽',
    rating: 4.3,
    tags: ['калмыцкая кухня', 'бизнес-ланч'],
    image: 'https://avatars.mds.yandex.net/get-altay/17649278/2a00000199d41bfa8e21b97a061c4a6e5ae2/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/14393272/2a000001930348601e57b0d358c04985cc63/XXXL',
      'https://avatars.mds.yandex.net/get-altay/15386900/2a0000019748dc7496a37b3b696baeb968d3/XXXL'
    ],
    description: 'Ресторан калмыцкой кухни в центре города. Удобен для обеда и знакомства с местными вкусами.',
    features: ['Калмыцкая кухня', 'Бизнес-ланч', 'Центр города'],
    lat: null,
    lon: null
  },
  {
    id: 'blackberry',
    name: 'Кафе-бар «Блекберри»',
    category: 'fun',
    categoryLabel: 'Развлечения',
    address: 'ул. Кирова, 155',
    hours: '12:00–00:00',
    price: 900,
    priceLabel: '900 ₽',
    rating: 4.2,
    tags: ['бар', 'вечерний формат', 'коктейли'],
    image: 'https://avatars.mds.yandex.net/get-altay/10812438/2a00000189cf49f8d4ec46159559603e85ae/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/11487452/2a000001915b4e7390c4c957a2cc7dcdae18/XXXL',
      'https://avatars.mds.yandex.net/get-altay/9749133/2a00000189fa988c49a47cad82f7d9bde8ab/XXXL'
    ],
    description: 'Кафе-бар для вечерних встреч и отдыха с друзьями. Подходит для тех, кто ищет расслабленную атмосферу.',
    features: ['Барная карта', 'Вечерний формат', 'Компания'],
    lat: null,
    lon: null
  },
  {
    id: 'kinza',
    name: 'Кафе «Кинза»',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'просп. имени Петра Анацкого, 10, стр. 1',
    hours: '10:00–22:00',
    price: 600,
    priceLabel: '600 ₽',
    rating: 4.3,
    tags: ['бизнес-ланч', 'вай-фай'],
    image: 'https://avatars.mds.yandex.net/get-altay/10175550/2a0000018c545faacfb3d6a41959f962e42c/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/11564583/2a0000018dac10c1cf995be2ff2058fe3943/XXXL',
      'https://avatars.mds.yandex.net/get-altay/11564583/2a0000018dac10d222e5c3dbb2f05ad90783/XXXL'
    ],
    description: 'Кафе с понятным меню и доступными ценами. Хороший вариант для обеда в будний день.',
    features: ['Бизнес-ланч', 'Wi-Fi', 'Доступные цены'],
    lat: null,
    lon: null
  },
  {
    id: 'nomad',
    name: 'Кафе «Номад»',
    category: 'food',
    categoryLabel: 'Еда',
    address: 'ул. Ленина, 315Г',
    hours: '10:00–22:00',
    price: 650,
    priceLabel: '650 ₽',
    rating: 4.2,
    tags: ['кофе', 'перекус', 'вай-фай'],
    image: 'https://avatars.mds.yandex.net/get-altay/15038851/2a000001973ad05f6d63fe05008cdff72a22/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/15344916/2a000001973ad0646d7b8ea1a64b542f3490/XXXL',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1000&q=85'
    ],
    description: 'Кафе для короткой паузы, кофе и перекуса. Подходит для тех, кто в пути.',
    features: ['Кофе', 'Перекус', 'Wi-Fi'],
    lat: null,
    lon: null
  },
  {
    id: 'park-druzhba',
    name: 'Парк «Дружба»',
    category: 'walk',
    categoryLabel: 'Прогулки',
    address: 'парк «Дружба» (ориентир: ул. Ленина / ул. Номто Очирова)',
    hours: 'Круглосуточно',
    price: null,
    priceLabel: 'Бесплатно',
    rating: 4.8,
    tags: ['парк', 'прогулки', 'памятники'],
    image: 'https://avatars.mds.yandex.net/get-altay/19582126/2a0000019df944d6b9e6e2cd62d826ca774d/XXXL',
    gallery: [
      'https://avatars.mds.yandex.net/get-altay/17735792/2a0000019d4fbbbd9564bc2e02339f46469d/XXXL',
      'https://avatars.mds.yandex.net/get-altay/10766931/2a00000192be122fcaddc2a1f885d6f5d98e/XXXL'
    ],
    description: 'Большой зелёный парк в центре Элисты. Здесь есть памятники (Белый старец, Виктор Цой), аттракционы, музыкальный фонтан и стадион «Уралан». Отличное место для прогулки и отдыха на свежем воздухе [citation:2].',
    features: ['Прогулки', 'Памятники', 'Фонтан', 'Детские площадки'],
    lat: null,
    lon: null
  },
  {
    id: 'gorodskoy-skver',
    name: 'Городской сквер',
    category: 'walk',
    categoryLabel: 'Прогулки',
    address: 'пл. Ленина',
    hours: 'Круглосуточно',
    price: null,
    priceLabel: 'Бесплатно',
    rating: 4.2,
    tags: ['сквер', 'центр города', 'прогулки'],
    image: 'https://avatars.mds.yandex.net/get-altay/10267222/2a00000191e7ba68f174a4bd1e84e92d92d3/XXXL',
    gallery: [
      'https://core-pht-proxy.maps.yandex.ru/v1/photos/download?photo_id=Hi-dRqrwn36nL4Sy0wf6sQ&image_size=X5L',
      'https://avatars.mds.yandex.net/get-altay/13444254/2a000001917f51c2a3a03fb17061ecc507b5/XXXL'
    ],
    description: 'Небольшое городское пространство в центре. Удобно для короткой прогулки или встречи.',
    features: ['В центре города', 'Короткая прогулка', 'Открытая территория'],
    lat: null,
    lon: null
  }
];

window.PLACE_QUEST_DEMO_REVIEWS = [
  {
    id: 'demo-1',
    placeId: 'marko-polo',
    author: 'Анна П.',
    date: '12 марта 2025',
    rating: 5,
    text: 'Очень атмосферное место! Особенно понравилась веранда и уютная обстановка.',
    demo: true
  },
  {
    id: 'demo-2',
    placeId: 'tulpan',
    author: 'Даня К.',
    date: '10 января 2025',
    rating: 4,
    text: 'Хорошее место для встречи с друзьями. Вечером особенно приятно.',
    demo: true
  },
  {
    id: 'demo-3',
    placeId: 'park-druzhba',
    author: 'Лера С.',
    date: '5 апреля 2025',
    rating: 5,
    text: 'Отличное место, чтобы прогуляться и немного перезагрузиться.',
    demo: true
  }
];