const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');

// Leer archivo secreto en Render
const serviceAccount = JSON.parse(
  fs.readFileSync('/etc/secrets/GOOGLE_APPLICATION_CREDENTIALS.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
      nombre: doc.data().Nombre,
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
    const subtotal = precio * cantidad;
    const iva = +(subtotal * 0.16).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);

    res.json({
      nombre,
      precio,
      cantidad,
      subtotal,
      iva,
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
