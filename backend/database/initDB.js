require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTables = async () => {
  try {
    console.log("🛠️ Iniciando la creación de la base de datos...");
    await client.connect();
    console.log("✅ Conectado a la base de datos", process.env.DB_NAME);

    // Limpieza de prueba
    await client.query("DROP TABLE IF EXISTS test_table;");
    console.log("🗑️ Tabla 'test_table' eliminada");

    // Usuarios del inventario
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'employee')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'inventory_users' creada correctamente");

    // Usuarios del punto de venta
    await client.query(`
      CREATE TABLE IF NOT EXISTS pos_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'pos_users' creada correctamente");

    // Categorías
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        archivado BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("✅ Tabla 'categories' creada correctamente");

    // Productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_compra NUMERIC(10, 2) NOT NULL,
        precio_venta NUMERIC(10, 2) NOT NULL,
        imagen_url TEXT,
        categoria_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        archivado BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("✅ Tabla 'products' creada correctamente");

    // Carrito
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES pos_users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        cantidad INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'cart_items' creada correctamente");

    // Pedidos (Orders)
    await client.query(`DROP TABLE IF EXISTS orders;`);
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES pos_users(id) ON DELETE CASCADE,
        stripe_session_id TEXT UNIQUE NOT NULL,
        productos JSONB NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        direccion_envio JSONB NOT NULL,
        correo_cliente TEXT NOT NULL,
        shipping_company TEXT,
        tracking_number TEXT,
        status VARCHAR(50) DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'orders' creada correctamente");

    await client.end();
    console.log("🔌 Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error creando las tablas:", error.message);
    await client.end();
    process.exit(1);
  }
};

createTables();
