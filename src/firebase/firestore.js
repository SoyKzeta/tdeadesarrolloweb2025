import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';


const GAMES_COLLECTION = 'games';
const CATEGORIES_COLLECTION = 'categories';
const PLATFORMS_COLLECTION = 'platforms';
const REVIEWS_COLLECTION = 'reviews';
const USER_PROFILES_COLLECTION = 'userProfiles';
const ORDERS_COLLECTION = 'orders';


let categoriesCache = null;
let categoriesCacheTime = null;
const CACHE_DURATION = 60000; 



/**
 * Agrega un nuevo juego a la base de datos
 * @param {Object} gameData - Datos del juego
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<string>} - ID del documento creado
 */
export const addGame = async (gameData, imageFile) => {
  try {
    
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `games/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    const docRef = await addDoc(collection(db, GAMES_COLLECTION), {
      ...gameData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al agregar juego:', error);
    throw error;
  }
};

/**
 * Obtiene todos los juegos de la base de datos
 * @param {Object} options - Opciones de filtrado y ordenamiento
 * @returns {Promise<Array>} - Array de juegos
 */
export const getGames = async (options = {}) => {
  try {
    const { 
      categoryId = null, 
      platformId = null, 
      sortBy = 'createdAt', 
      sortDirection = 'desc', 
      itemLimit = 100 
    } = options;

    let gamesQuery = collection(db, GAMES_COLLECTION);
    const filters = [];

    
    if (categoryId) {
      
      filters.push(where('categoryIds', 'array-contains', categoryId));
    }

    if (platformId) {
      filters.push(where('platformId', '==', platformId));
    }

    
    if (filters.length > 0) {
      
      gamesQuery = query(gamesQuery, ...filters);
      
      
      const querySnapshot = await getDocs(gamesQuery);
      
      
      let games = [];
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      
      games.sort((a, b) => {
        
        const valueA = a[sortBy] !== undefined ? a[sortBy] : 0;
        const valueB = b[sortBy] !== undefined ? b[sortBy] : 0;
        
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
      
      
      games = games.slice(0, itemLimit);
      
      return games;
    } else {
      
      gamesQuery = query(
        gamesQuery,
        orderBy(sortBy, sortDirection),
        limit(itemLimit)
      );
      
      const querySnapshot = await getDocs(gamesQuery);
      
      const games = [];
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return games;
    }
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    throw error;
  }
};

/**
 * Obtiene un juego por su ID
 * @param {string} gameId - ID del juego
 * @returns {Promise<Object>} - Datos del juego
 */
export const getGameById = async (gameId) => {
  try {
    const docRef = doc(db, GAMES_COLLECTION, gameId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('El juego no existe');
    }
  } catch (error) {
    console.error('Error al obtener juego por ID:', error);
    throw error;
  }
};

/**
 * Actualiza un juego existente
 * @param {string} gameId - ID del juego
 * @param {Object} gameData - Nuevos datos del juego
 * @param {File} newImageFile - Nueva imagen (opcional)
 * @returns {Promise<void>}
 */
export const updateGame = async (gameId, gameData, newImageFile = null) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('El juego no existe');
    }

    const currentData = gameDoc.data();
    let imageUrl = currentData.imageUrl;

    
    if (newImageFile) {
      
      if (currentData.imageUrl) {
        try {
          const oldImageRef = ref(storage, currentData.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        }
      }

      
      const storageRef = ref(storage, `games/${Date.now()}_${newImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, newImageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    await updateDoc(gameRef, {
      ...gameData,
      imageUrl,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar juego:', error);
    throw error;
  }
};

/**
 * Elimina un juego y su imagen asociada
 * @param {string} gameId - ID del juego
 * @returns {Promise<void>}
 */
export const deleteGame = async (gameId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('El juego no existe');
    }

    
    const data = gameDoc.data();
    if (data.imageUrl) {
      try {
        const imageRef = ref(storage, data.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('No se pudo eliminar la imagen:', error);
      }
    }

    
    await deleteDoc(gameRef);
  } catch (error) {
    console.error('Error al eliminar juego:', error);
    throw error;
  }
};



/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>} - Array de categorías
 */
export const getCategories = async () => {
  try {
    
    const now = Date.now();
    if (categoriesCache && categoriesCacheTime && (now - categoriesCacheTime < CACHE_DURATION)) {
      console.log('Usando categorías de caché');
      return categoriesCache;
    }

    console.log('Cargando categorías desde Firestore');
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex(c => c.slug === category.slug)
    );
    
    console.log(`Categorías totales: ${categories.length}, Categorías únicas: ${uniqueCategories.length}`);
    
    
    categoriesCache = uniqueCategories;
    categoriesCacheTime = now;
    
    return uniqueCategories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Agrega una nueva categoría
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<string>} - ID de la categoría creada
 */
export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar categoría:', error);
    throw error;
  }
};



/**
 * Obtiene todas las plataformas
 * @returns {Promise<Array>} - Array de plataformas
 */
export const getPlatforms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PLATFORMS_COLLECTION));
    const platforms = [];
    
    querySnapshot.forEach((doc) => {
      platforms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return platforms;
  } catch (error) {
    console.error('Error al obtener plataformas:', error);
    throw error;
  }
};



/**
 * Agrega una reseña a un juego
 * @param {string} gameId - ID del juego
 * @param {Object} reviewData - Datos de la reseña
 * @returns {Promise<string>} - ID de la reseña creada
 */
export const addReview = async (gameId, reviewData) => {
  try {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      gameId,
      ...reviewData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar reseña:', error);
    throw error;
  }
};

/**
 * Obtiene las reseñas de un juego
 * @param {string} gameId - ID del juego
 * @returns {Promise<Array>} - Array de reseñas
 */
export const getGameReviews = async (gameId) => {
  try {
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('gameId', '==', gameId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    throw error;
  }
};


export const getAccessories = async (options = {}) => {
  try {
    const { 
      categoryId = null, 
      platformId = null, 
      sortBy = 'createdAt', 
      sortDirection = 'desc', 
      itemLimit = 100 
    } = options;

    let accessoriesQuery = collection(db, 'accessories');
    const filters = [];

    
    if (categoryId) {
      filters.push(where('categoryId', '==', categoryId));
    }

    if (platformId) {
      filters.push(where('platformId', '==', platformId));
    }

    
    if (filters.length > 0) {
      accessoriesQuery = query(
        accessoriesQuery, 
        ...filters,
        orderBy(sortBy, sortDirection),
        limit(itemLimit)
      );
    } else {
      accessoriesQuery = query(
        accessoriesQuery,
        orderBy(sortBy, sortDirection),
        limit(itemLimit)
      );
    }

    
    const querySnapshot = await getDocs(accessoriesQuery);
    
    
    const accessories = [];
    querySnapshot.forEach((doc) => {
      accessories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return accessories;
  } catch (error) {
    console.error('Error al obtener accesorios:', error);
    throw error;
  }
};

/**
 * Agrega un nuevo accesorio a la base de datos
 * @param {Object} accessoryData - Datos del accesorio
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<string>} - ID del documento creado
 */
export const addAccessory = async (accessoryData, imageFile) => {
  try {
    
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `accessories/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    const docRef = await addDoc(collection(db, 'accessories'), {
      ...accessoryData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al agregar accesorio:', error);
    throw error;
  }
};

/**
 * Obtiene un accesorio por su ID
 * @param {string} accessoryId - ID del accesorio
 * @returns {Promise<Object>} - Datos del accesorio
 */
export const getAccessoryById = async (accessoryId) => {
  try {
    const docRef = doc(db, 'accessories', accessoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('El accesorio no existe');
    }
  } catch (error) {
    console.error('Error al obtener accesorio por ID:', error);
    throw error;
  }
};

/**
 * Actualiza un accesorio existente
 * @param {string} accessoryId - ID del accesorio
 * @param {Object} accessoryData - Nuevos datos del accesorio
 * @param {File} newImageFile - Nueva imagen (opcional)
 * @returns {Promise<void>}
 */
export const updateAccessory = async (accessoryId, accessoryData, newImageFile = null) => {
  try {
    const accessoryRef = doc(db, 'accessories', accessoryId);
    const accessoryDoc = await getDoc(accessoryRef);
    
    if (!accessoryDoc.exists()) {
      throw new Error('El accesorio no existe');
    }

    const currentData = accessoryDoc.data();
    let imageUrl = currentData.imageUrl;

    
    if (newImageFile) {
      
      if (currentData.imageUrl) {
        try {
          const oldImageRef = ref(storage, currentData.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        }
      }

      
      const storageRef = ref(storage, `accessories/${Date.now()}_${newImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, newImageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    await updateDoc(accessoryRef, {
      ...accessoryData,
      imageUrl,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar accesorio:', error);
    throw error;
  }
};

/**
 * Elimina un accesorio y su imagen asociada
 * @param {string} accessoryId - ID del accesorio
 * @returns {Promise<void>}
 */
export const deleteAccessory = async (accessoryId) => {
  try {
    const accessoryRef = doc(db, 'accessories', accessoryId);
    const accessoryDoc = await getDoc(accessoryRef);
    
    if (!accessoryDoc.exists()) {
      throw new Error('El accesorio no existe');
    }

    
    const data = accessoryDoc.data();
    if (data.imageUrl) {
      try {
        const imageRef = ref(storage, data.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('No se pudo eliminar la imagen:', error);
      }
    }

    
    await deleteDoc(accessoryRef);
  } catch (error) {
    console.error('Error al eliminar accesorio:', error);
    throw error;
  }
};


export const getGiftCards = async (options = {}) => {
  try {
    const { 
      platformId = null, 
      sortBy = 'price', 
      sortDirection = 'asc', 
      itemLimit = 100 
    } = options;

    let giftCardsQuery = collection(db, 'giftCards');
    const filters = [];

    
    if (platformId) {
      filters.push(where('platformId', '==', platformId));
    }

    
    if (filters.length > 0) {
      giftCardsQuery = query(
        giftCardsQuery, 
        ...filters,
        orderBy(sortBy, sortDirection),
        limit(itemLimit)
      );
    } else {
      giftCardsQuery = query(
        giftCardsQuery,
        orderBy(sortBy, sortDirection),
        limit(itemLimit)
      );
    }

    
    const querySnapshot = await getDocs(giftCardsQuery);
    
    
    const giftCards = [];
    querySnapshot.forEach((doc) => {
      giftCards.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return giftCards;
  } catch (error) {
    console.error('Error al obtener tarjetas de regalo:', error);
    throw error;
  }
};

/**
 * Obtiene una tarjeta de regalo por su ID
 * @param {string} giftCardId - ID de la tarjeta de regalo
 * @returns {Promise<Object>} - Datos de la tarjeta de regalo
 */
export const getGiftCardById = async (giftCardId) => {
  try {
    const docRef = doc(db, 'giftCards', giftCardId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('La tarjeta de regalo no existe');
    }
  } catch (error) {
    console.error('Error al obtener tarjeta de regalo por ID:', error);
    throw error;
  }
};

/**
 * Agrega una nueva tarjeta de regalo a la base de datos
 * @param {Object} giftCardData - Datos de la tarjeta de regalo
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<string>} - ID del documento creado
 */
export const addGiftCard = async (giftCardData, imageFile) => {
  try {
    
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `giftCards/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    const docRef = await addDoc(collection(db, 'giftCards'), {
      ...giftCardData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al agregar tarjeta de regalo:', error);
    throw error;
  }
};

/**
 * Actualiza una tarjeta de regalo existente
 * @param {string} giftCardId - ID de la tarjeta de regalo
 * @param {Object} giftCardData - Nuevos datos de la tarjeta de regalo
 * @param {File} newImageFile - Nueva imagen (opcional)
 * @returns {Promise<void>}
 */
export const updateGiftCard = async (giftCardId, giftCardData, newImageFile = null) => {
  try {
    const giftCardRef = doc(db, 'giftCards', giftCardId);
    const giftCardDoc = await getDoc(giftCardRef);
    
    if (!giftCardDoc.exists()) {
      throw new Error('La tarjeta de regalo no existe');
    }

    const currentData = giftCardDoc.data();
    let imageUrl = currentData.imageUrl;

    
    if (newImageFile) {
      
      if (currentData.imageUrl) {
        try {
          const oldImageRef = ref(storage, currentData.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        }
      }

      
      const storageRef = ref(storage, `giftCards/${Date.now()}_${newImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, newImageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    
    await updateDoc(giftCardRef, {
      ...giftCardData,
      imageUrl,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar tarjeta de regalo:', error);
    throw error;
  }
};

/**
 * Elimina una tarjeta de regalo y su imagen asociada
 * @param {string} giftCardId - ID de la tarjeta de regalo
 * @returns {Promise<void>}
 */
export const deleteGiftCard = async (giftCardId) => {
  try {
    const giftCardRef = doc(db, 'giftCards', giftCardId);
    const giftCardDoc = await getDoc(giftCardRef);
    
    if (!giftCardDoc.exists()) {
      throw new Error('La tarjeta de regalo no existe');
    }

    
    const data = giftCardDoc.data();
    if (data.imageUrl) {
      try {
        const imageRef = ref(storage, data.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('No se pudo eliminar la imagen:', error);
      }
    }

    
    await deleteDoc(giftCardRef);
  } catch (error) {
    console.error('Error al eliminar tarjeta de regalo:', error);
    throw error;
  }
};

/**
 * Obtiene todos los juegos sin aplicar filtros
 * @returns {Promise<Array>} - Array de todos los juegos
 */
export const getAllGames = async () => {
  try {
    const gamesQuery = query(
      collection(db, GAMES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(gamesQuery);
    const games = [];
    
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return games;
  } catch (error) {
    console.error('Error al obtener todos los juegos:', error);
    throw error;
  }
};


export const searchProducts = async (query) => {
  try {
    
    const gamesQuery = collection(db, 'games');
    const gamesSnapshot = await getDocs(gamesQuery);
    const allGames = gamesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    
    const accessoriesQuery = collection(db, 'accessories');
    const accessoriesSnapshot = await getDocs(accessoriesQuery);
    const allAccessories = accessoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    
    const giftCardsQuery = collection(db, 'giftCards');
    const giftCardsSnapshot = await getDocs(giftCardsQuery);
    const allGiftCards = giftCardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    
    const platformsQuery = collection(db, 'platforms');
    const platformsSnapshot = await getDocs(platformsQuery);
    const platforms = platformsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    
    const normalizedQuery = query.toLowerCase().trim();
    
    
    const games = allGames.filter(game => {
      const titleMatch = game.title.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = game.description?.toLowerCase().includes(normalizedQuery);
      
      
      const platform = platforms.find(p => p.id === game.platformId);
      game.platformName = platform ? platform.name : 'Desconocido';
      
      return titleMatch || descriptionMatch;
    });
    
    
    const accessories = allAccessories.filter(accessory => {
      const nameMatch = accessory.name.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = accessory.description?.toLowerCase().includes(normalizedQuery);
      
      
      const platform = platforms.find(p => p.id === accessory.platformId);
      accessory.platformName = platform ? platform.name : 'Universal';
      
      return nameMatch || descriptionMatch;
    });
    
    
    const giftCards = allGiftCards.filter(giftCard => {
      
      const platform = platforms.find(p => p.id === giftCard.platformId);
      giftCard.platformName = platform ? platform.name : 'Desconocido';
      
      const platformMatch = platform?.name.toLowerCase().includes(normalizedQuery);
      
      return platformMatch || normalizedQuery.includes('tarjeta') || normalizedQuery.includes('gift');
    });
    
    return {
      games,
      accessories,
      giftCards
    };
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};



/**
 * Obtiene el perfil de un usuario por su ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Datos del perfil
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      
      return {
        id: userId,
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        shippingAddresses: []
      };
    }
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
};

/**
 * Crea o actualiza el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} profileData - Datos del perfil
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
    
    
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw error;
  }
};

/**
 * Añade una dirección de envío al perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} addressData - Datos de la dirección
 * @returns {Promise<string>} - ID de la dirección
 */
export const addShippingAddress = async (userId, addressData) => {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    
    const addressId = Date.now().toString();
    const newAddress = {
      id: addressId,
      ...addressData,
      createdAt: new Date().toISOString()
    };
    
    if (userDoc.exists()) {
      
      const userData = userDoc.data();
      const addresses = userData.shippingAddresses || [];
      
      await updateDoc(userRef, {
        shippingAddresses: [...addresses, newAddress],
        updatedAt: serverTimestamp()
      });
    } else {
      
      await setDoc(userRef, {
        shippingAddresses: [newAddress],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return addressId;
  } catch (error) {
    console.error('Error al añadir dirección de envío:', error);
    throw error;
  }
};

/**
 * Elimina una dirección de envío del perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<void>}
 */
export const deleteShippingAddress = async (userId, addressId) => {
  try {
    const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('El perfil de usuario no existe');
    }
    
    const userData = userDoc.data();
    const addresses = userData.shippingAddresses || [];
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    
    await updateDoc(userRef, {
      shippingAddresses: updatedAddresses,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al eliminar dirección de envío:', error);
    throw error;
  }
};



/**
 * Crea un nuevo pedido
 * @param {string} userId - ID del usuario
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<string>} - ID del pedido
 */
export const createOrder = async (userId, orderData) => {
  try {
    
    const enhancedOrderData = {
      ...orderData,
      userId,
      status: 'pending', 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), enhancedOrderData);
    
    
    if (orderData.saveAddress && orderData.shippingAddress) {
      const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        
        const userData = userDoc.data();
        const addresses = userData.shippingAddresses || [];
        
        
        const addressExists = addresses.some(addr => 
          addr.address === orderData.shippingAddress.address &&
          addr.city === orderData.shippingAddress.city &&
          addr.zipCode === orderData.shippingAddress.zipCode
        );
        
        if (!addressExists) {
          
          const addressId = Date.now().toString();
          const newAddress = {
            id: addressId,
            ...orderData.shippingAddress,
            createdAt: new Date().toISOString()
          };
          
          await updateDoc(userRef, {
            shippingAddresses: [...addresses, newAddress],
            updatedAt: serverTimestamp()
          });
        }
      } else {
        
        const addressId = Date.now().toString();
        const newAddress = {
          id: addressId,
          ...orderData.shippingAddress,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(userRef, {
          shippingAddresses: [newAddress],
          name: orderData.shippingAddress.name,
          phone: orderData.shippingAddress.phone,
          email: orderData.shippingAddress.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Obtiene todos los pedidos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de pedidos
 */
export const getUserOrders = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene un pedido por su ID
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} - Datos del pedido
 */
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('El pedido no existe');
    }
  } catch (error) {
    console.error('Error al obtener pedido por ID:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un pedido
 * @param {string} orderId - ID del pedido
 * @param {string} status - Nuevo estado
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
}; 