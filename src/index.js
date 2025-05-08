


import express from 'express';
import cors from 'cors';

const app = express();


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS está configurado correctamente' });
});



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor CORS iniciado en el puerto ${PORT}`);
});

export default app; 