import nodemailer from "nodemailer";

export const enviarAyuda = async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !asunto || !mensaje) {
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
      subject: "Consulta de Ayuda",
      html: `
<div style="background-color: #0e0e0e; color: #f1f1f1; font-family: 'Segoe UI', sans-serif; padding: 2rem; border-radius: 12px; max-width: 640px; margin: auto; box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);">
  <header style="text-align: center; margin-bottom: 2rem;">
    <h2 style="color: #3b82f6; margin: 0; font-size: 1.8rem;">🚀 Nueva Solicitud de Cambio de Rol</h2>
    <p style="margin-top: 0.5rem; color: #bcbcbc;">Un usuario ha enviado la siguiente información:</p>
  </header>

  <table style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid #2b2b2b;">
    <tbody>
      <tr>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b; font-weight: 600;">🙍‍♂️ Nombre</td>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b;">${nombre}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b; font-weight: 600;">📧 Email</td>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b; font-weight: 600;">📧 Email</td>
        <td style="padding: 1rem; border-bottom: 1px solid #2b2b2b;">${asunto}</td>
      </tr>
      <tr>
        <td style="padding: 1rem; font-weight: 600;">📝 Razón</td>
        <td style="padding: 1rem;">${mensaje}</td>
      </tr>
    </tbody>
  </table>

  <footer style="margin-top: 2.5rem; font-size: 0.9rem; color: #a1a1a1; text-align: center;">
    Este mensaje fue generado automáticamente por <strong style="color: #3b82f6;">Join With Us</strong>. Si no esperabas este correo, puedes ignorarlo.
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
}