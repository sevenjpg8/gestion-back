import nodemailer from "nodemailer";

export const enviarSolicitud = async (req, res) => {
  const { dni, nombre, email, telefono, razon } = req.body;

  if (!dni || !nombre || !email || !telefono || !razon) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"JoinWithUs" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      replyTo: email,
      subject: "Nueva Solicitud de Cambio de Rol",
      html: `
<div style="background-color: #0e0e0e; color: #f1f1f1; font-family: 'Segoe UI', sans-serif; padding: 2rem; border-radius: 12px; max-width: 640px; margin: auto; box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);">
  <header style="text-align: center; margin-bottom: 2rem;">
    <h2 style="color: #38bdf8; margin: 0; font-size: 1.8rem;">🚀 Nueva Solicitud de Cambio de Rol</h2>
    <p style="margin-top: 0.5rem; color: #cccccc;">Un usuario ha enviado una solicitud con la siguiente información:</p>
  </header>

  <table style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
    <tbody>
      <tr>
        <td style="padding: 1rem; border: 1px solid #333; font-weight: 600; width: 35%;">🆔 DNI</td>
        <td style="padding: 1rem; border: 1px solid #333;">${dni}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border: 1px solid #333; font-weight: 600;">🙍‍♂️ Nombre</td>
        <td style="padding: 1rem; border: 1px solid #333;">${nombre}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border: 1px solid #333; font-weight: 600;">📧 Email</td>
        <td style="padding: 1rem; border: 1px solid #333;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border: 1px solid #333; font-weight: 600;">📱 Teléfono</td>
        <td style="padding: 1rem; border: 1px solid #333;">${telefono}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border: 1px solid #333; font-weight: 600;">📝 Razón</td>
        <td style="padding: 1rem; border: 1px solid #333;">${razon}</td>
      </tr>
    </tbody>
  </table>

  <footer style="margin-top: 2rem; font-size: 0.9rem; color: #888888; text-align: center;">
    Este correo fue generado automáticamente por <strong style="color: #38bdf8;">Join With Us</strong>.
  </footer>
</div>

      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: "Error al enviar el correo." });
  }
};
