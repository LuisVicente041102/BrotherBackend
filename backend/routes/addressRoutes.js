const express = require("express");
const router = express.Router();
const pool = require("../db");

// 📝 Crear o actualizar dirección del usuario POS
router.post("/", async (req, res) => {
  const {
    user_id,
    calle,
    numero,
    colonia,
    ciudad,
    estado,
    codigo_postal,
    telefono,
  } = req.body;

  try {
    // Verifica si ya tiene dirección guardada
    const existing = await pool.query(
      "SELECT * FROM pos_user_addresses WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      // Si existe, actualiza la dirección
      await pool.query(
        `UPDATE pos_user_addresses 
         SET calle = $1, numero = $2, colonia = $3, ciudad = $4, estado = $5, 
             codigo_postal = $6, telefono = $7
         WHERE user_id = $8`,
        [
          calle,
          numero,
          colonia,
          ciudad,
          estado,
          codigo_postal,
          telefono,
          user_id,
        ]
      );

      return res.status(200).json({ message: "Dirección actualizada" });
    } else {
      // Si no existe, crea nueva
      await pool.query(
        `INSERT INTO pos_user_addresses 
         (user_id, calle, numero, colonia, ciudad, estado, codigo_postal, telefono)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user_id,
          calle,
          numero,
          colonia,
          ciudad,
          estado,
          codigo_postal,
          telefono,
        ]
      );
      return res.status(201).json({ message: "Dirección creada" });
    }
  } catch (error) {
    console.error("❌ Error al guardar dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// Obtener dirección por user_id
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM pos_user_addresses WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
