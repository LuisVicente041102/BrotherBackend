const express = require("express");
const multer = require("multer");
const pool = require("../db"); // Asegúrate de que esta ruta a tu pool de conexión sea correcta
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Configuración de Multer para el almacenamiento local de imágenes
// IMPORTANTE: Este almacenamiento es efímero en Render. Las imágenes se borrarán
// cuando el servidor entre en reposo o se reinicie. Para persistencia,
// se recomienda usar servicios de almacenamiento en la nube como AWS S3 o Cloudinary.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads"); // Carpeta 'uploads' en la raíz del backend
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Crea la carpeta si no existe
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo único para evitar colisiones
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Añade la extensión original del archivo
  },
});

const upload = multer({ storage }); // Inicializa Multer con la configuración de almacenamiento

// Función para obtener la URL base del servidor, considerando proxies (como Render/Vercel)
const getBaseUrl = (req) => {
  // 'x-forwarded-host' es una cabecera común usada por proxies/balanceadores de carga
  // para indicar el host original solicitado por el cliente.
  // Si está presente, construimos la URL con HTTPS.
  // De lo contrario, usamos el protocolo y host directamente de la petición.
  return req.headers["x-forwarded-host"]
    ? `https://${req.headers["x-forwarded-host"]}`
    : `${req.protocol}://${req.get("host")}`;
};

// --- RUTAS DE PRODUCTOS ---
// NOTA IMPORTANTE: Las rutas más específicas deben ir ANTES que las rutas genéricas como "/:id".

// 1. RUTA: Obtener los últimos 3 productos agregados (para el carrusel de "Novedades")
// Endpoint: GET /api/products/latest
router.get("/latest", async (req, res) => {
  try {
    // Consulta SQL para obtener los 3 productos más recientes, ordenados por 'created_at' descendente.
    // 'created_at' está en tu esquema de tabla 'products', lo cual es perfecto.
    const result = await pool.query(
      `SELECT id, nombre, precio_venta, imagen_url
       FROM products
       WHERE archivado = false -- Solo productos no archivados
       ORDER BY created_at DESC
       LIMIT 5;`
    );
    const baseUrl = getBaseUrl(req);
    // Mapea los resultados para construir la URL completa de la imagen
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Error al obtener los últimos productos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. RUTA: Obtener el producto más vendido (para la sección destacada)
// Endpoint: GET /api/products/top-selling
// Esta implementación se adapta a tu esquema con 'productos' JSONB en la tabla 'orders'.
router.get("/top-selling", async (req, res) => {
  try {
    // 1. Obtener todos los pedidos para analizar sus productos JSONB
    const ordersResult = await pool.query(`SELECT productos FROM orders;`);

    const productSales = {}; // Objeto para acumular las ventas por product_id

    // 2. Iterar sobre cada pedido y sus productos (dentro del JSONB)
    ordersResult.rows.forEach((order) => {
      // Asegúrate de que 'productos' sea un array y no sea nulo
      if (order.productos && Array.isArray(order.productos)) {
        order.productos.forEach((item) => {
          const productId = item.product_id; // Asume que el JSONB tiene 'product_id'
          const quantity = item.cantidad; // Asume que el JSONB tiene 'cantidad'

          if (productId && typeof quantity === "number") {
            productSales[productId] = (productSales[productId] || 0) + quantity;
          }
        });
      }
    });

    let topProductId = null;
    let maxQuantitySold = 0;

    // 3. Encontrar el product_id con la mayor cantidad vendida
    for (const productId in productSales) {
      if (productSales[productId] > maxQuantitySold) {
        maxQuantitySold = productSales[productId];
        topProductId = productId;
      }
    }

    // 4. Si se encontró un producto más vendido, obtener sus detalles de la tabla 'products'
    if (topProductId) {
      const productResult = await pool.query(
        `SELECT id, nombre, precio_venta, imagen_url
         FROM products
         WHERE id = $1 AND archivado = false;`,
        [topProductId]
      );

      if (productResult.rows.length > 0) {
        const topProduct = productResult.rows[0];
        const baseUrl = getBaseUrl(req);
        topProduct.imagen_url = topProduct.imagen_url
          ? `${baseUrl}${topProduct.imagen_url}`
          : null;
        res.json(topProduct);
      } else {
        // El producto más vendido no se encontró o está archivado
        res.json(null);
      }
    } else {
      // No hay ventas para determinar un producto más vendido
      res.json(null);
    }
  } catch (err) {
    console.error("❌ Error al obtener el producto más vendido:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 3. RUTA: Obtener productos "destacados" (tu ruta "/top" existente, renombrada a "/featured")
// Endpoint: GET /api/products/featured
// NOTA: Esta ruta ordena por 'cantidad' (que es la cantidad en stock en tu DB),
// lo cual significa que devuelve productos con mayor stock.
router.get("/featured", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, precio_venta, imagen_url
      FROM products
      WHERE archivado = false
      ORDER BY cantidad DESC LIMIT 6 -- Tu lógica existente de ordenar por 'cantidad' (stock)
    `);
    const baseUrl = getBaseUrl(req);
    const products = result.rows.map((product) => ({
      ...product,
      imagen_url: product.imagen_url ? `${baseUrl}${product.imagen_url}` : null,
    }));
    res.json(products);
  } catch (err) {
    console.error("❌ Error al obtener productos destacados (featured):", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// RUTA: Obtener todos los productos no archivados (para el catálogo general)
// Endpoint: GET /api/products/
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

// RUTA: Obtener productos archivados
// Endpoint: GET /api/products/archived
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

// RUTA: Crear un nuevo producto
// Endpoint: POST /api/products/
router.post("/", upload.single("imagen"), async (req, res) => {
  const { nombre, cantidad, precio_compra, precio_venta, categoria_id } =
    req.body;
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null; // Ruta relativa

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
       (nombre, cantidad, precio_compra, precio_venta, imagen_url, categoria_id, archivado, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW()) -- Añade created_at con la fecha y hora actuales
       RETURNING *`,
      [nombre, cantidad, precio_compra, precio_venta, imagen_url, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ message: "Error al agregar producto" });
  }
});

// RUTA: Actualizar un producto existente
// Endpoint: PUT /api/products/:id
router.put("/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, precio_compra, precio_venta, categoria_id } =
    req.body;
  // Si se sube un nuevo archivo, usa su URL; de lo contrario, usa la URL existente del cuerpo de la petición.
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
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

// RUTA: Archivar un producto
// Endpoint: PUT /api/products/:id/archivar
router.put("/:id/archivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE products SET archivado = true WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al archivar producto:", error);
    res.status(500).json({ message: "Error al archivar producto" });
  }
});

// RUTA: Desarchivar un producto
// Endpoint: PUT /api/products/:id/desarchivar
router.put("/:id/desarchivar", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE products SET archivado = false WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al desarchivar producto:", error);
    res.status(500).json({ message: "Error al desarchivar producto" });
  }
});

// RUTA: Obtener un producto por ID (DEBE IR AL FINAL por ser la más genérica)
// Endpoint: GET /api/products/:id
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
