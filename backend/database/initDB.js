require("dotenv").config();
const { Client } = require("pg");

// Configuración de conexión a PostgreSQL
const client = new Client({
  user: process.env.DB_USER || "luis_", // Valor por defecto si no se encuentra en .env
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "brothersublima",
  password: process.env.DB_PASSWORD || "vicente33",
  port: process.env.DB_PORT || 5433,
});

const createTables = async () => {
  try {
    console.log("🛠️ Iniciando la creación de la base de datos...");

    // Conectar a la base de datos
    await client.connect();
    console.log("✅ Conectado a la base de datos", process.env.DB_NAME);

    // Crear tabla de prueba "test_table"
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tabla 'test_table' creada correctamente");

    // Verificar si la tabla se creó
    const result = await client.query(`SELECT * FROM test_table LIMIT 1;`);
    console.log(
      "🔍 Verificación: ",
      result.rowCount === 0
        ? "Tabla vacía, creada correctamente"
        : "Tabla ya tiene registros"
    );

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
