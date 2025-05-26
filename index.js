const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Base de datos simulada
const medicamentos = {
  amoxi: { nombre: 'Amoxicilina', precio: 150 },
  iverm: { nombre: 'Ivermectina', precio: 90 },
  dex:   { nombre: 'Dexametasona', precio: 120 }
};

app.post('/calcular-total', (req, res) => {
  const { id, cantidad } = req.body;
  const medicamento = medicamentos[id];
  if (!medicamento) {
    return res.status(404).json({ error: 'Medicamento no encontrado' });
  }

  const total = medicamento.precio * cantidad;
  res.json({
    nombre: medicamento.nombre,
    precio: medicamento.precio,
    cantidad,
    total
  });
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
