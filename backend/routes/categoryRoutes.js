// backend/routes/categoryRoutes.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

// ✅ Obtener solo categorías activas
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM categories
      WHERE archivado = false
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener las categorías:", error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
});

// ✅ Obtener categorías archivadas
router.get("/archivadas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM categories
      WHERE archivado = true
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener categorías archivadas:", error);
    res.status(500).json({ message: "Error al obtener categorías archivadas" });
  }
});

// ✅ Agregar nueva categoría
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: "El nombre es requerido" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (nombre, archivado)
       VALUES ($1, false)
       RETURNING *`,
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear la categoría:", error);
    res.status(500).json({ message: "Error al crear la categoría" });
  }
});

// ✅ Archivar categoría
router.put("/:id/archivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE categories SET archivado = true WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al archivar categoría:", error);
    res.status(500).json({ message: "Error al archivar categoría" });
  }
});

// ✅ Desarchivar categoría
router.put("/:id/desarchivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE categories SET archivado = false WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al desarchivar categoría:", error);
    res.status(500).json({ message: "Error al desarchivar categoría" });
  }
});

// ✅ Modificar categoría
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre es requerido" });
  }

  try {
    const result = await pool.query(
      `UPDATE categories SET nombre = $1 WHERE id = $2 RETURNING *`,
      [nombre, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar la categoría:", error);
    res.status(500).json({ message: "Error al actualizar la categoría" });
  }
});

module.exports = router;
