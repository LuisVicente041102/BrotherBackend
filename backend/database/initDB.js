require("dotenv").config();
const { Client } = require("pg");

// Configuración de conexión a PostgreSQL desde .env
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

    // Conectar a la base de datos
    await client.connect();
    console.log("✅ Conectado a la base de datos", process.env.DB_NAME);

    // Eliminar tabla de prueba si existe
    await client.query("DROP TABLE IF EXISTS test_table;");
    console.log("🗑️ Tabla 'test_table' eliminada");

    // Tabla de usuarios del inventario
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

    // 🔥 NUEVA: Tabla de usuarios del punto de venta
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

    // Tabla de categorías (con archivado ya incluido)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        archivado BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("✅ Tabla 'categories' creada correctamente");

    // Tabla de productos (con archivado ya incluido)
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

    await client.end();
    console.log("🔌 Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error creando las tablas:", error.message);
    await client.end();
    process.exit(1);
  }
};

// Ejecutar la creación de tablas
createTables();
