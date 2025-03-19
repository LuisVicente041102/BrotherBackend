require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcrypt");

// Configuración de conexión a PostgreSQL
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createAdminUser = async () => {
  try {
    await client.connect();
    console.log("✅ Conectado a la base de datos");

    // Verificar si ya existe un usuario admin
    const existingAdmin = await client.query(
      "SELECT * FROM inventory_users WHERE role = 'admin'"
    );
    if (existingAdmin.rowCount > 0) {
      console.log("⚠️ Ya existe un usuario administrador. No se creará otro.");
      await client.end();
      return;
    }

    // Encriptar la contraseña del admin
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Insertar el usuario admin
    await client.query(
      "INSERT INTO inventory_users (email, password, role) VALUES ($1, $2, $3)",
      ["admin@brothersublima.com", hashedPassword, "admin"]
    );

    console.log("🎉 Usuario administrador creado exitosamente.");
    await client.end();
  } catch (error) {
    console.error("❌ Error creando el usuario admin:", error.message);
    await client.end();
  }
};

// Ejecutar el script
createAdminUser();
