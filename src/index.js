// Este archivo es opcional y solo se usa para desarrollo
// Configura un middleware CORS para el servidor de desarrollo

import express from 'express';
import cors from 'cors';

const app = express();

// Configurar CORS para todas las rutas
app.use(cors({
  origin: '*', // Permitir cualquier origen en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint de ejemplo para probar CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS está configurado correctamente' });
});

// En desarrollo, iniciamos el servidor
// Nota: Asumimos que estamos en desarrollo para evitar errores de linter con 'process'
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor CORS iniciado en el puerto ${PORT}`);
});

export default app; 