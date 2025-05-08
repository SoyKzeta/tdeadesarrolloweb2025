import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyCRKlB56O3_88Ry8OJdRbkiR-WpRWlXnsk",
  authDomain: "gameshop-d3732.firebaseapp.com",
  projectId: "gameshop-d3732",
  storageBucket: "gameshop-d3732.appspot.com",
  messagingSenderId: "914952962060",
  appId: "1:914952962060:web:592a45fb17bc1624c7ee29",
  measurementId: "G-ZRQYRN77R4"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth, db, storage };