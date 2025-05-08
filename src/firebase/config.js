import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase (hardcoded para garantizar que funcione)
const firebaseConfig = {
  apiKey: "AIzaSyCRKlB56O3_88Ry8OJdRbkiR-WpRWlXnsk",
  authDomain: "gameshop-d3732.firebaseapp.com",
  projectId: "gameshop-d3732",
  storageBucket: "gameshop-d3732.appspot.com",
  messagingSenderId: "914952962060",
  appId: "1:914952962060:web:592a45fb17bc1624c7ee29",
  measurementId: "G-ZRQYRN77R4"
};

// Inicializar Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Obtener servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar servicios
export { auth, db, storage };