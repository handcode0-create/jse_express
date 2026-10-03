const unsplash = (id, width = 1200) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

export const imagesBannieres = [
    unsplash("1546069901-ba9599a7e63c", 1600),
    unsplash("1526367790999-0150786686a2", 1600),
    unsplash("1600891964092-4316c288032e", 1600),
    unsplash("1556910103-1c02745aae4d", 1600),
    unsplash("1498837167922-ddd27525d352", 1600),
];

export const imagesCategories = [
    unsplash("1517248135467-4c7edcad34c4", 800),
    unsplash("1550547660-d9450f859349", 800),
    unsplash("1544145945-f90425340c7e", 800),
    unsplash("1551024506-0bccd828d307", 800),
];

export const imagesRestaurants = [
    unsplash("1601050690597-df0568f70950"),
    unsplash("1552566626-52f8b828add9"),
    unsplash("1515003197210-e0cd71810b5f"),
    unsplash("1559339352-11d035aa65de"),
    unsplash("1555396273-367ea4eb4db5"),
    unsplash("1600565193348-f74bd3c7ccdf"),
    unsplash("1579684947550-8dca3b2a5e0c"),
    unsplash("1571997478779-2adcbbe9ab2f"),
    unsplash("1550966871-3ed3cdb5ed0c"),
    unsplash("1556742049-0cfed4f6a45d"),
    unsplash("1521017432531-fbd92d768814"),
    unsplash("1521017432531-fbd92d768814"),
];

export const imagesProduits = [
    unsplash("1546069901-ba9599a7e63c", 900),
    unsplash("1540189549336-e6e99c3679fe", 900),
    unsplash("1504674900247-0877df9cc836", 900),
    unsplash("1565299624946-b28f40a0ae38", 900),
    unsplash("1565958011703-44f9829ba187", 900),
    unsplash("1498837167922-ddd27525d352", 900),
    unsplash("1505253716362-afaea1d3d1af", 900),
    unsplash("1512621776951-a57141f2eefd", 900),
    unsplash("1544025162-d76694265947", 900),
    unsplash("1513104890138-7c749659a591", 900),
    unsplash("1515003197210-e0cd71810b5f", 900),
    unsplash("1547592180-85f173990554", 900),
    unsplash("1551183053-bf91a1d81141", 900),
    unsplash("1551024601-bec78aea704b", 900),
    unsplash("1572449043416-55c3e7f3d5d5", 900),
    unsplash("1563379926898-05f4575a45d8", 900),
];

export const imagesSecours = [
    unsplash("1551218808-94e220e084d2"),
    unsplash("1517248135467-4c7edcad34c4"),
    unsplash("1498654896293-37aacf113fd9"),
];

export const imageRestaurantFallback = (id = 0) =>
    imagesRestaurants[Math.abs(Number(id) || 0) % imagesRestaurants.length];

export const imageProduitFallback = (id = 0) =>
    imagesProduits[Math.abs(Number(id) || 0) % imagesProduits.length];

export const imageSecours = (id = 0) =>
    imagesSecours[Math.abs(Number(id) || 0) % imagesSecours.length];
