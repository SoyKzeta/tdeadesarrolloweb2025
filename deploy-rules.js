const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRKlB56O3_88Ry8OJdRbkiR-WpRWlXnsk",
  authDomain: "gameshop-d3732.firebaseapp.com",
  projectId: "gameshop-d3732",
  storageBucket: "gameshop-d3732.appspot.com",
  messagingSenderId: "914952962060",
  appId: "1:914952962060:web:592a45fb17bc1624c7ee29",
  measurementId: "G-ZRQYRN77R4"
};

// Inicializar Firebase Admin con credenciales de servicio
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Leer las reglas de Firestore desde el archivo
const firestoreRules = fs.readFileSync('./firestore.rules', 'utf8');

// Función principal para desplegar las reglas
async function deployRules() {
  try {
    console.log('Desplegando reglas de Firestore...');
    
    // Desplegar reglas de Firestore
    await admin.firestore().settings({
      rules: firestoreRules
    });
    
    console.log('Reglas de Firestore desplegadas correctamente');
    
    // Configurar las rutas adicionales si existen
    console.log('Proceso completado con éxito');
  } catch (error) {
    console.error('Error al desplegar las reglas:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
deployRules(); 