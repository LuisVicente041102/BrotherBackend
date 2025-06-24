const express = require("express");
const multer = require("multer");
const pool = require("../db");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const getBaseUrl = (req) => {
  return req.headers["x-forwarded-host"]
    ? `https://${req.headers["x-forwarded-host"]}`
    : `${req.protocol}://${req.get("host")}`;
};

// 🔥 MOVER ESTA RUTA ARRIBA para evitar conflictos con "/:id"
router.get("/top", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM products ORDER BY cantidad DESC LIMIT 6
    `);
    const baseUrl = getBaseUrl(req);
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Error al obtener productos más vendidos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre 
      FROM products p
      LEFT JOIN categories c ON p.categoria_id = c.id
      WHERE p.archivado = false
      ORDER BY p.id ASC
    `);
    const baseUrl = getBaseUrl(req);
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

router.get("/archived", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre 
      FROM products p
      LEFT JOIN categories c ON p.categoria_id = c.id
      WHERE p.archivado = true
      ORDER BY p.id ASC
    `);
    const baseUrl = getBaseUrl(req);
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos archivados:", error);
    res.status(500).json({ message: "Error al obtener productos archivados" });
  }
});

router.post("/", upload.single("imagen"), async (req, res) => {
  const { nombre, cantidad, precio_compra, precio_venta, categoria_id } =
    req.body;
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (
    !nombre ||
    !cantidad ||
    !precio_compra ||
    !precio_venta ||
    !categoria_id
  ) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products 
       (nombre, cantidad, precio_compra, precio_venta, imagen_url, categoria_id, archivado)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [nombre, cantidad, precio_compra, precio_venta, imagen_url, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ message: "Error al agregar producto" });
  }
});

router.put("/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, precio_compra, precio_venta, categoria_id } =
    req.body;
  const imagen_url = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imagen_url;

  try {
    const result = await pool.query(
      `UPDATE products 
       SET nombre = $1, cantidad = $2, precio_compra = $3, precio_venta = $4, imagen_url = $5, categoria_id = $6
       WHERE id = $7 RETURNING *`,
      [
        nombre,
        cantidad,
        precio_compra,
        precio_venta,
        imagen_url,
        categoria_id,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

router.put("/:id/archivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE products SET archivado = true WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al archivar producto:", error);
    res.status(500).json({ message: "Error al archivar producto" });
  }
});

router.put("/:id/desarchivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE products SET archivado = false WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al desarchivar producto:", error);
    res.status(500).json({ message: "Error al desarchivar producto" });
  }
});

router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, precio_venta, imagen_url
      FROM products
      WHERE archivado = false
      ORDER BY created_at DESC
    `);
    const baseUrl = getBaseUrl(req);
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos públicos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

// 👇 ESTA DEBE IR AL FINAL
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const product = result.rows[0];
    const baseUrl = getBaseUrl(req);
    product.imagen_url = product.imagen_url
      ? `${baseUrl}${product.imagen_url}`
      : null;
    res.json(product);
  } catch (error) {
    console.error("❌ Error al obtener producto por ID:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

module.exports = router;
