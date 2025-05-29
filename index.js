const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./credenciales.json'); // este archivo debe estar bien configurado

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/calcular-total', async (req, res) => {
  const { nombre, cantidad } = req.body;

  try {
    const snapshot = await db.collection('medicamentos')
      .where('nombre', '==', nombre)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    const doc = snapshot.docs[0];
    const datos = doc.data();

    const total = datos.precio * cantidad;

    res.json({
      nombre: datos.nombre,
      precio: datos.precio,
      cantidad,
      total
    });
  } catch (error) {
    console.error('Error consultando Firestore:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
