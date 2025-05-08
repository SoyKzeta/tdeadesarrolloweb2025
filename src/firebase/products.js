import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './config';

const productsCollection = 'products';


export const getAllProducts = async () => {
  const querySnapshot = await getDocs(collection(db, productsCollection));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, productsCollection), 
    where("category", "==", category)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const getProduct = async (productId) => {
  const docRef = doc(db, productsCollection, productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
};


export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, productsCollection), {
    ...productData,
    price: Number(productData.price),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};


export const updateProduct = async (productId, productData) => {
  const docRef = doc(db, productsCollection, productId);
  await updateDoc(docRef, {
    ...productData,
    price: Number(productData.price),
    updatedAt: new Date()
  });
};


export const deleteProduct = async (productId) => {
  const docRef = doc(db, productsCollection, productId);
  await deleteDoc(docRef);
}; 