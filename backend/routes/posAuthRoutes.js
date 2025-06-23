// ✅ posAuthRoutes.js COMPLETO con verificación por correo
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// 🟣 Registrar usuario con verificación por correo
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token_verificacion = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      "INSERT INTO pos_users (username, email, password, token_verificacion) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
      [username, email, hashedPassword, token_verificacion]
    );

    const user = result.rows[0];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.BASE_URL}/verificar?token=${token_verificacion}&id=${user.id}`;

    await transporter.sendMail({
      from: `"BrotherSublima" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verifica tu cuenta",
      html: `<p>Hola ${user.username},</p>
        <p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationLink}">Verificar cuenta</a>`,
    });

    res.status(201).json({
      message: "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
    });
  } catch (error) {
    console.error("❌ Error en registro:", error.message);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// 🔐 Verificar cuenta con token
router.get("/verify", async (req, res) => {
  const { token, id } = req.query;
  try {
    const result = await pool.query("SELECT * FROM pos_users WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Usuario no encontrado.");
    }

    const user = result.rows[0];

    if (user.email_verificado) {
      return res
        .status(200)
        .send("Ya habías verificado tu cuenta anteriormente.");
    }

    if (user.token_verificacion !== token) {
      return res.status(400).send("Token inválido o ya fue usado.");
    }

    await pool.query(
      "UPDATE pos_users SET email_verificado = true, token_verificacion = NULL WHERE id = $1",
      [id]
    );

    res.send("✅ Cuenta verificada correctamente. Ya puedes iniciar sesión.");
  } catch (err) {
    console.error("❌ Error en verificación:", err.message);
    res.status(500).send("Error al verificar cuenta");
  }
});

// 🔐 Login con validación de verificación
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM pos_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (!user.email_verificado) {
      return res.status(403).json({
        message: "Debes verificar tu correo antes de iniciar sesión.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.email_verificado,
      },
    });
  } catch (error) {
    console.error("❌ Error en login POS user:", error.message);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// 🟣 Actualizar datos de usuario POS (nombre, correo y contraseña)
// 🟣 Actualizar datos de usuario POS (nombre, correo y contraseña)
router.put("/update/:id", async (req, res) => {
  const { username, email, password, newPassword } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM pos_users WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const values = [username, email];
    let updateQuery = "UPDATE pos_users SET username = $1, email = $2";

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "La contraseña actual es incorrecta." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery +=
        ", password = $3 WHERE id = $4 RETURNING id, username, email, role";
      values.push(hashedPassword, id);
    } else {
      updateQuery += " WHERE id = $3 RETURNING id, username, email, role";
      values.push(id);
    }

    const updated = await pool.query(updateQuery, values);

    res.json({
      message:
        password && newPassword
          ? "Contraseña actualizada correctamente."
          : "Datos actualizados correctamente.",
      user: updated.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error.message);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

router.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM pos_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Correo no encontrado" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(
      "UPDATE pos_users SET token_verificacion = $1 WHERE email = $2",
      [token, email]
    );

    const link = `${process.env.BASE_URL}/reset-password?token=${token}&email=${email}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BrotherSublima" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic para restablecer tu contraseña:</p><a href="${link}">${link}</a>`,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("❌ Error en reset-password-request:", error.message);
    res.status(500).json({ message: "Error al enviar correo de recuperación" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM pos_users WHERE email = $1 AND token_verificacion = $2",
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE pos_users SET password = $1, token_verificacion = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error en reset-password:", error.message);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
});
// 🟢 Enviar notificación de compra por correo
// 📩 Enviar correo de confirmación de compra
router.post("/send-purchase-email", async (req, res) => {
  const { email, nombre, productos, total, direccion } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const productosHTML = productos
      .map(
        (item) =>
          `<li>${item.nombre} (Cantidad: ${item.cantidad}) - $${item.precio_venta}</li>`
      )
      .join("");

    const direccionHTML = `
      <p><strong>Calle:</strong> ${direccion.calle}</p>
      <p><strong>Número:</strong> ${direccion.numero}</p>
      <p><strong>Colonia:</strong> ${direccion.colonia}</p>
      <p><strong>Ciudad:</strong> ${direccion.ciudad}</p>
      <p><strong>Estado:</strong> ${direccion.estado}</p>
      <p><strong>Código Postal:</strong> ${direccion.codigo_postal}</p>
      <p><strong>Teléfono:</strong> ${direccion.telefono}</p>
    `;

    const htmlContent = `
      <h2>¡Gracias por tu compra, ${nombre}!</h2>
      <p>Tu pedido fue procesado correctamente. Aquí están los detalles:</p>
      <h3>Productos:</h3>
      <ul>${productosHTML}</ul>
      <p><strong>Total:</strong> $${total}</p>
      <h3>Dirección de Envío:</h3>
      ${direccionHTML}
      <p>Te notificaremos cuando tu pedido sea enviado.</p>
    `;

    await transporter.sendMail({
      from: `"Brother Sublima" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirmación de compra - Brother Sublima",
      html: htmlContent,
    });

    res.json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error.message);
    res.status(500).json({ message: "Error al enviar correo" });
  }
});

module.exports = router;
