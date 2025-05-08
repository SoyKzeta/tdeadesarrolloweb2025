import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

// Colecciones
const CATEGORIES_COLLECTION = 'categories';
const PLATFORMS_COLLECTION = 'platforms';
const GAMES_COLLECTION = 'games';
const ACCESSORIES_COLLECTION = 'accessories';
const GIFT_CARDS_COLLECTION = 'giftCards';

/**
 * Datos iniciales para categorías
 */
const initialCategories = [
  {
    name: 'Acción',
    slug: 'accion',
    icon: 'fas fa-running',
    color: '#F4A300',
    description: 'Juegos llenos de acción y adrenalina'
  },
  {
    name: 'Aventura',
    slug: 'aventura',
    icon: 'fas fa-map-marked-alt',
    color: '#3CE35B',
    description: 'Juegos con narrativas inmersivas y exploración'
  },
  {
    name: 'RPG',
    slug: 'rpg',
    icon: 'fas fa-scroll',
    color: '#3C9AE3',
    description: 'Juegos de rol con personajes y progresión'
  },
  {
    name: 'Deportes',
    slug: 'deportes',
    icon: 'fas fa-futbol',
    color: '#FF4B4B',
    description: 'Juegos de fútbol, baloncesto y más deportes'
  },
  {
    name: 'Estrategia',
    slug: 'estrategia',
    icon: 'fas fa-chess',
    color: '#9B59B6',
    description: 'Juegos que requieren planificación y pensamiento estratégico'
  },
  {
    name: 'Carreras',
    slug: 'carreras',
    icon: 'fas fa-car',
    color: '#E74C3C',
    description: 'Juegos de velocidad y competición'
  },
  {
    name: 'Shooter',
    slug: 'shooter',
    icon: 'fas fa-crosshairs',
    color: '#7F8C8D',
    description: 'Juegos de disparos en primera o tercera persona'
  },
  {
    name: 'Simulación',
    slug: 'simulacion',
    icon: 'fas fa-tractor',
    color: '#27AE60',
    description: 'Juegos que simulan actividades de la vida real'
  }
];

/**
 * Datos iniciales para plataformas
 */
const initialPlatforms = [
  {
    name: 'PlayStation 5',
    slug: 'ps5',
    logo: 'ps5_logo',
    color: '#0070D1',
    order: 1
  },
  {
    name: 'PlayStation 4',
    slug: 'ps4',
    logo: 'ps4_logo',
    color: '#003087',
    order: 2
  },
  {
    name: 'Xbox Series X|S',
    slug: 'xbox',
    logo: 'xbox_series_logo',
    color: '#107C10',
    order: 3
  },
  {
    name: 'Xbox One',
    slug: 'xbox-one',
    logo: 'xbox_one_logo',
    color: '#5DC21E',
    order: 4
  },
  {
    name: 'Nintendo Switch',
    slug: 'switch',
    logo: 'switch_logo',
    color: '#E60012',
    order: 5
  },
  {
    name: 'PC',
    slug: 'pc',
    logo: 'pc_logo',
    color: '#00ADEF',
    order: 6
  }
];

/**
 * Inicializa las categorías en Firestore
 * @returns {Promise<Array>} - Array de IDs de categorías
 */
export const initializeCategories = async () => {
  try {
    // Verificar si ya existen categorías
    const categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (!categoriesSnapshot.empty) {
      console.log('Las categorías ya están inicializadas');
      const existingCategories = [];
      categoriesSnapshot.forEach(doc => {
        existingCategories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return existingCategories;
    }

    // Si no existen, crear las categorías iniciales
    const categoryIds = [];
    for (const category of initialCategories) {
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...category,
        createdAt: serverTimestamp()
      });
      categoryIds.push({
        id: docRef.id,
        ...category
      });
    }

    console.log('Categorías inicializadas con éxito');
    return categoryIds;
  } catch (error) {
    console.error('Error al inicializar categorías:', error);
    throw error;
  }
};

/**
 * Inicializa las plataformas en Firestore
 * @returns {Promise<Array>} - Array de IDs de plataformas
 */
export const initializePlatforms = async () => {
  try {
    // Verificar si ya existen plataformas
    const platformsSnapshot = await getDocs(collection(db, PLATFORMS_COLLECTION));
    
    // Actualizar plataformas existentes o crear nuevas si no existen
    if (!platformsSnapshot.empty) {
      console.log('Actualizando plataformas con nuevos slugs...');
      
      // Obtener las plataformas existentes para referencia
      const existingPlatforms = [];
      platformsSnapshot.forEach(doc => {
        existingPlatforms.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Plataformas existentes:', JSON.stringify(existingPlatforms.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug
      })), null, 2));
      
      // Actualizar todas las plataformas existentes y/o crear nuevas
      const platformIds = [];
      
      // Primero, actualizar todas las plataformas existentes
      for (const existingPlatform of existingPlatforms) {
        // Buscar la versión actualizada en initialPlatforms
        const updatedPlatform = initialPlatforms.find(p => p.name === existingPlatform.name);
        
        if (updatedPlatform) {
          console.log(`Actualizando plataforma: ${existingPlatform.name} con nuevo slug: ${updatedPlatform.slug}`);
          console.log(`ID del documento: ${existingPlatform.id}`);
          console.log(`Slug anterior: ${existingPlatform.slug || 'ninguno'}`);
          
          try {
            // Actualizar el documento
            const platformRef = doc(db, PLATFORMS_COLLECTION, existingPlatform.id);
            await updateDoc(platformRef, {
              ...updatedPlatform,
              updatedAt: serverTimestamp()
            });
            
            platformIds.push({
              id: existingPlatform.id,
              ...updatedPlatform
            });
            console.log(`Plataforma ${existingPlatform.name} actualizada correctamente`);
          } catch (updateError) {
            console.error(`Error al actualizar plataforma ${existingPlatform.name}:`, updateError);
            throw updateError;
          }
        }
      }
      
      // Luego, crear las plataformas que no existen
      for (const platform of initialPlatforms) {
        // Verificar si ya existe
        const exists = existingPlatforms.some(p => p.name === platform.name);
        
        if (!exists) {
          console.log(`Creando nueva plataforma: ${platform.name} con slug: ${platform.slug}`);
          try {
            const docRef = await addDoc(collection(db, PLATFORMS_COLLECTION), {
              ...platform,
              createdAt: serverTimestamp()
            });
            
            platformIds.push({
              id: docRef.id,
              ...platform
            });
            console.log(`Plataforma ${platform.name} creada correctamente con ID: ${docRef.id}`);
          } catch (addError) {
            console.error(`Error al crear nueva plataforma ${platform.name}:`, addError);
            throw addError;
          }
        }
      }

      console.log('Plataformas actualizadas con éxito. Resultado final:', JSON.stringify(platformIds.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug
      })), null, 2));
      
      return platformIds;
    }

    // Si no existen, crear las plataformas iniciales
    console.log('No hay plataformas, creando todas las iniciales');
    const platformIds = [];
    for (const platform of initialPlatforms) {
      try {
        const docRef = await addDoc(collection(db, PLATFORMS_COLLECTION), {
          ...platform,
          createdAt: serverTimestamp()
        });
        platformIds.push({
          id: docRef.id,
          ...platform
        });
        console.log(`Plataforma ${platform.name} creada correctamente con ID: ${docRef.id}`);
      } catch (addError) {
        console.error(`Error al crear plataforma ${platform.name}:`, addError);
        throw addError;
      }
    }

    console.log('Plataformas inicializadas con éxito');
    return platformIds;
  } catch (error) {
    console.error('Error al inicializar plataformas:', error);
    throw error;
  }
};

/**
 * Inicializa algunos juegos de ejemplo
 * @param {Array} categories - Categorías disponibles
 * @param {Array} platforms - Plataformas disponibles
 * @returns {Promise<void>}
 */
export const initializeSampleGames = async (categories, platforms) => {
  try {
    console.log('Verificando si ya existen juegos...');
    // Verificar si ya existen juegos
    const gamesSnapshot = await getDocs(collection(db, GAMES_COLLECTION));
    if (!gamesSnapshot.empty) {
      console.log('Ya existen juegos en la base de datos');
      return;
    }

    console.log('Preparando juegos de ejemplo...');
    // Buscar categorías y plataformas por slug
    const findCategoryId = (slug) => {
      const category = categories.find(cat => cat.slug === slug);
      if (!category) console.log(`Categoría no encontrada para slug: ${slug}`);
      return category ? category.id : null;
    };

    const findPlatformId = (slug) => {
      const platform = platforms.find(plat => plat.slug === slug);
      if (!platform) console.log(`Plataforma no encontrada para slug: ${slug}`);
      return platform ? platform.id : null;
    };

    // Juegos de ejemplo
    const sampleGames = [
      {
        title: 'God of War Ragnarök',
        slug: 'god-of-war-ragnarok',
        description: 'La nueva aventura de Kratos y Atreus en los nueve reinos.',
        price: 59.99,
        stock: 100,
        release_date: new Date('2022-11-09'),
        developer: 'Santa Monica Studio',
        publisher: 'Sony Interactive Entertainment',
        categoryIds: [findCategoryId('accion'), findCategoryId('aventura')],
        platformId: findPlatformId('ps5'),
        features: ['Modo historia', 'Alta dificultad', 'Mundo abierto'],
        rating: 9.7,
        discount: 0,
        is_featured: true,
        is_new: false,
        is_upcoming: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg'
      },
      {
        title: 'Zelda: Tears of the Kingdom',
        slug: 'zelda-tears-of-the-kingdom',
        description: 'Explora las islas flotantes de Hyrule en esta nueva aventura.',
        price: 69.99,
        stock: 150,
        release_date: new Date('2023-05-12'),
        developer: 'Nintendo',
        publisher: 'Nintendo',
        categoryIds: [findCategoryId('aventura'), findCategoryId('rpg')],
        platformId: findPlatformId('switch'),
        features: ['Mundo abierto', 'Puzzles', 'Combate'],
        rating: 9.8,
        discount: 0,
        is_featured: true,
        is_new: true,
        is_upcoming: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg'
      },
      {
        title: 'Forza Horizon 5',
        slug: 'forza-horizon-5',
        description: 'Explora un mundo abierto vibrante en México en este simulador de carreras.',
        price: 59.99,
        stock: 80,
        release_date: new Date('2021-11-09'),
        developer: 'Playground Games',
        publisher: 'Xbox Game Studios',
        categoryIds: [findCategoryId('carreras'), findCategoryId('simulacion')],
        platformId: findPlatformId('xbox'),
        features: ['Mundo abierto', 'Multijugador', 'Personalización'],
        rating: 9.5,
        discount: 20,
        is_featured: false,
        is_new: false,
        is_upcoming: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Forza_Horizon_5_cover_art.jpg'
      },
      {
        title: 'Elden Ring',
        slug: 'elden-ring',
        description: 'Un RPG de mundo abierto de FromSoftware con la colaboración de George R.R. Martin.',
        price: 49.99,
        stock: 100,
        release_date: new Date('2022-02-25'),
        developer: 'FromSoftware',
        publisher: 'Bandai Namco',
        categoryIds: [findCategoryId('rpg'), findCategoryId('accion')],
        platformId: findPlatformId('ps4'),
        features: ['Mundo abierto', 'Alta dificultad', 'Jefe épicos'],
        rating: 9.6,
        discount: 15,
        is_featured: true,
        is_new: false,
        is_upcoming: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg'
      }
    ];

    console.log('Creando juegos en Firestore...');
    // Crear los juegos en Firestore
    for (const game of sampleGames) {
      console.log(`Creando juego: ${game.title}`);
      console.log(`Categorías del juego: ${JSON.stringify(game.categoryIds)}`);
      console.log(`Plataforma del juego: ${game.platformId}`);
      
      await addDoc(collection(db, GAMES_COLLECTION), {
        ...game,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Juegos de ejemplo inicializados con éxito');
  } catch (error) {
    console.error('Error al inicializar juegos de ejemplo:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

/**
 * Inicializa accesorios de ejemplo en Firestore
 * @param {Array} categories - Categorías disponibles
 * @param {Array} platforms - Plataformas disponibles
 * @returns {Promise<void>}
 */
export const initializeSampleAccessories = async (categories, platforms) => {
  try {
    console.log('Verificando si ya existen accesorios...');
    // Verificar si ya existen accesorios
    const accessoriesSnapshot = await getDocs(collection(db, ACCESSORIES_COLLECTION));
    if (!accessoriesSnapshot.empty) {
      console.log('Ya existen accesorios en la base de datos');
      return;
    }

    console.log('Preparando accesorios de ejemplo...');
    // Buscar plataformas por slug
    const findPlatformId = (slug) => {
      const platform = platforms.find(plat => plat.slug === slug);
      if (!platform) console.log(`Plataforma no encontrada para slug: ${slug}`);
      return platform ? platform.id : null;
    };

    // Accesorios de ejemplo
    const sampleAccessories = [
      {
        name: 'DualSense Wireless Controller',
        slug: 'dualsense-wireless-controller',
        description: 'El control oficial para PlayStation 5 con retroalimentación háptica y gatillos adaptativos.',
        price: 69.99,
        stock: 50,
        type: 'controllers',
        platformId: findPlatformId('ps5'),
        is_new: true,
        discount: 0,
        imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-thumbnail-ps5-01-en-17jul20?$facebook$'
      },
      {
        name: 'Xbox Elite Wireless Controller Series 2',
        slug: 'xbox-elite-controller-series-2',
        description: 'Control premium para Xbox con componentes intercambiables y mayor duración de batería.',
        price: 179.99,
        stock: 25,
        type: 'controllers',
        platformId: findPlatformId('xbox'),
        is_new: false,
        discount: 10,
        imageUrl: 'https://m.media-amazon.com/images/I/61LfZhhYN8L._AC_SX679_.jpg'
      },
      {
        name: 'Logitech G Pro X Gaming Headset',
        slug: 'logitech-g-pro-x-headset',
        description: 'Auriculares gaming con micrófono desmontable y sonido envolvente 7.1.',
        price: 129.99,
        stock: 30,
        type: 'headsets',
        platformId: findPlatformId('pc'),
        is_new: false,
        discount: 15,
        imageUrl: 'https://resource.logitechg.com/w_695,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x/pro-headset-gallery-1.png?v=1'
      },
      {
        name: 'Razer BlackWidow V3 Pro',
        slug: 'razer-blackwidow-v3-pro',
        description: 'Teclado mecánico inalámbrico con RGB personalizable y switches Razer Green.',
        price: 229.99,
        stock: 20,
        type: 'keyboards',
        platformId: findPlatformId('pc'),
        is_new: true,
        discount: 0,
        imageUrl: 'https://assets3.razerzone.com/GdX7-fR7OL8xMWrB1T0qLgC8qxs=/1500x1000/https%3A%2F%2Fhybrismediaprod.blob.core.windows.net%2Fsys-master-phoenix-images-container%2Fh89%2Fh7d%2F9081444392990%2F211019-blackwidow-v3-pro-black-1500x1000-1.jpg'
      },
      {
        name: 'Nintendo Switch Pro Controller',
        slug: 'nintendo-switch-pro-controller',
        description: 'Control premium para Nintendo Switch con giroscopio y vibración HD.',
        price: 69.99,
        stock: 40,
        type: 'controllers',
        platformId: findPlatformId('switch'),
        is_new: false,
        discount: 5,
        imageUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_700/v1/ncom/en_US/products/accessories/nintendo-switch/controllers/nintendo-switch-pro-controller/110701-nintendo-switch-pro-controller-front'
      }
    ];

    console.log('Creando accesorios en Firestore...');
    // Crear los accesorios en Firestore
    for (const accessory of sampleAccessories) {
      console.log(`Creando accesorio: ${accessory.name}`);
      await addDoc(collection(db, ACCESSORIES_COLLECTION), {
        ...accessory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Accesorios de ejemplo inicializados con éxito');
  } catch (error) {
    console.error('Error al inicializar accesorios de ejemplo:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

/**
 * Inicializa tarjetas de regalo de ejemplo en Firestore
 * @param {Array} platforms - Plataformas disponibles
 * @returns {Promise<void>}
 */
export const initializeSampleGiftCards = async (platforms) => {
  try {
    console.log('Verificando si ya existen tarjetas de regalo...');
    // Verificar si ya existen tarjetas de regalo
    const giftCardsSnapshot = await getDocs(collection(db, GIFT_CARDS_COLLECTION));
    if (!giftCardsSnapshot.empty) {
      console.log('Ya existen tarjetas de regalo en la base de datos');
      return;
    }

    console.log('Preparando tarjetas de regalo de ejemplo...');
    // Buscar plataformas por slug
    const findPlatformId = (slug) => {
      const platform = platforms.find(plat => plat.slug === slug);
      if (!platform) console.log(`Plataforma no encontrada para slug: ${slug}`);
      return platform ? platform.id : null;
    };

    // Tarjetas de regalo de ejemplo
    const sampleGiftCards = [
      {
        name: 'PlayStation Store Gift Card $20',
        slug: 'ps-store-gift-card-20',
        description: 'Tarjeta de regalo para comprar juegos y contenido en PlayStation Store.',
        price: 20.00,
        value: 20.00,
        stock: 100,
        platformId: findPlatformId('ps5'),
        is_digital: true,
        imageUrl: 'https://media.direct.playstation.com/is/image/sierialto/psn-gift-card-20-product-tile-01-us'
      },
      {
        name: 'Xbox Gift Card $50',
        slug: 'xbox-gift-card-50',
        description: 'Tarjeta de regalo para comprar juegos y contenido en Microsoft Store.',
        price: 50.00,
        value: 50.00,
        stock: 100,
        platformId: findPlatformId('xbox'),
        is_digital: true,
        imageUrl: 'https://assets.xboxservices.com/assets/63/57/6357bb4d-f386-4873-becf-14c7bb420976.jpg'
      },
      {
        name: 'Nintendo eShop Card $25',
        slug: 'nintendo-eshop-card-25',
        description: 'Tarjeta de regalo para comprar juegos y contenido en Nintendo eShop.',
        price: 25.00,
        value: 25.00,
        stock: 100,
        platformId: findPlatformId('switch'),
        is_digital: true,
        imageUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_700/v1/ncom/en_US/products/prepaid/nintendo-eshop-funds/115560-nintendo-eshop-25-us-25-digital'
      },
      {
        name: 'Steam Gift Card $100',
        slug: 'steam-gift-card-100',
        description: 'Tarjeta de regalo para comprar juegos y contenido en Steam.',
        price: 100.00,
        value: 100.00,
        stock: 50,
        platformId: findPlatformId('pc'),
        is_digital: true,
        imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/clusters/frontpage/688fe2d0c9ea0baccfd09cc3/page_bg_english.jpg'
      }
    ];

    console.log('Creando tarjetas de regalo en Firestore...');
    // Crear las tarjetas de regalo en Firestore
    for (const giftCard of sampleGiftCards) {
      console.log(`Creando tarjeta de regalo: ${giftCard.name}`);
      await addDoc(collection(db, GIFT_CARDS_COLLECTION), {
        ...giftCard,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Tarjetas de regalo de ejemplo inicializadas con éxito');
  } catch (error) {
    console.error('Error al inicializar tarjetas de regalo de ejemplo:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

/**
 * Inicializa toda la base de datos (categorías, plataformas y juegos)
 */
export const initializeDatabase = async () => {
  console.log('Iniciando inicialización de la base de datos...');
  let categories = [];
  let platforms = [];
  let hasError = false;
  let errorMessage = '';

  // Inicializar categorías con manejo de errores
  try {
    console.log('Inicializando categorías...');
    categories = await initializeCategories();
    console.log(`Categorías inicializadas, total: ${categories.length}`);
  } catch (categoryError) {
    console.error('Error al inicializar categorías:', categoryError);
    hasError = true;
    errorMessage += `Error en categorías: ${categoryError.message}. `;
  }
  
  // Inicializar plataformas con manejo de errores
  try {
    console.log('Inicializando plataformas...');
    platforms = await initializePlatforms();
    console.log(`Plataformas inicializadas, total: ${platforms.length}`);
  } catch (platformError) {
    console.error('Error al inicializar plataformas:', platformError);
    hasError = true;
    errorMessage += `Error en plataformas: ${platformError.message}. `;
  }
  
  // Solo inicializar juegos si tenemos categorías y plataformas
  if (categories.length > 0 && platforms.length > 0) {
    try {
      console.log('Inicializando juegos de ejemplo...');
      await initializeSampleGames(categories, platforms);
      console.log('Juegos inicializados correctamente');
    } catch (gameError) {
      console.error('Error al inicializar juegos:', gameError);
      hasError = true;
      errorMessage += `Error en juegos: ${gameError.message}. `;
    }
    
    // Inicializar accesorios
    try {
      console.log('Inicializando accesorios de ejemplo...');
      await initializeSampleAccessories(categories, platforms);
      console.log('Accesorios inicializados correctamente');
    } catch (accessoryError) {
      console.error('Error al inicializar accesorios:', accessoryError);
      hasError = true;
      errorMessage += `Error en accesorios: ${accessoryError.message}. `;
    }
    
    // Inicializar tarjetas de regalo
    try {
      console.log('Inicializando tarjetas de regalo de ejemplo...');
      await initializeSampleGiftCards(platforms);
      console.log('Tarjetas de regalo inicializadas correctamente');
    } catch (giftCardError) {
      console.error('Error al inicializar tarjetas de regalo:', giftCardError);
      hasError = true;
      errorMessage += `Error en tarjetas de regalo: ${giftCardError.message}. `;
    }
  } else {
    console.log('No se pueden inicializar productos sin categorías y plataformas');
  }
  
  // Devolver resultado adecuado
  if (hasError) {
    if (categories.length > 0 || platforms.length > 0) {
      console.log('Inicialización parcialmente exitosa');
      return { 
        success: true, 
        message: `Inicialización parcial. ${errorMessage}`,
        categories: categories.length,
        platforms: platforms.length
      };
    } else {
      console.error('Fallo completo en la inicialización');
      throw new Error(errorMessage);
    }
  }
  
  console.log('Base de datos inicializada con éxito');
  return { success: true };
}; 