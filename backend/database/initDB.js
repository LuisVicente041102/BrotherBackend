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

    // Crear tabla de usuarios para el inventario
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

    await client.end();
    console.log("🔌 Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error creando la tabla:", error.message);
    await client.end();
    process.exit(1); // Salida con error
  }
};

// Ejecutar la creación de tablas
createTables();
