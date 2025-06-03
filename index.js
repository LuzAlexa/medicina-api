const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Leer las credenciales desde variable de entorno
const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!serviceAccountJson) {
  throw new Error('Falta la variable GOOGLE_APPLICATION_CREDENTIALS_JSON');
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/medicamentos', async (req, res) => {
  try {
    const snapshot = await db.collection('medicamentos').get();
    const medicamentos = snapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().Nombre
    }));
    res.json(medicamentos);
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/calcular-total', async (req, res) => {
  try {
    const { id, cantidad } = req.body;
    const doc = await db.collection('medicamentos').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    const datos = doc.data();
    const precio = datos.Precio;
    const nombre = datos.Nombre;

    const total = precio * cantidad;
    res.json({
      nombre,
      precio,
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
