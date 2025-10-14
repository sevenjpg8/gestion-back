import User from '../models/Usuario/Usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


const JWT_SECRET = process.env.JWT_SECRET

const generarToken = (user) => {
    return jwt.sign(
        {
            userId: user.UserId,
            email: user.Email,
            role: user.Role,
            fullName: user.FullName,
            verified: user.VerifiedOrganizer,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

export const getUsuarios = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

export const getUsuario = async (req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'UserId inválido' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};


export const validarToken = (req, res) => {
    const token = req.cookies.tokenUsuario;

    if (!token) {
        return res.status(401).json({ message: 'No autenticado: token no encontrado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: 'Autenticado', user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};



// ✅ Inicio de sesión con JWT + Cookie
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const hashedPassword = user.PasswordHash;
        let passwordMatch = false;

        if (hashedPassword.startsWith('$2')) {
            passwordMatch = await bcrypt.compare(password, hashedPassword);
        } else {
            passwordMatch = password === hashedPassword;
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = generarToken(user);

        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('tokenUsuario', token, {
            httpOnly: true,
            secure: true, // true en producción (HTTPS)
            sameSite:"None",
            maxAge: 1000 * 60 * 60 * 24 * 30,
            path: '/',
        });

        const { PasswordHash, ...userWithoutPassword } = user.toJSON();
        res.json({
            message: 'Inicio de sesión exitoso',
            user: userWithoutPassword,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};

export const logoutUsuario = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const token = req.cookies.tokenUsuario;

    if (!token) {
        console.log('No se encontro el token');
    }

    res.clearCookie('tokenUsuario', {
        httpOnly: true,
        secure: true,
        sameSite:"None",
        path: '/',
    });

    res.json({ message: 'sesion cerrada correctamente' });
};

export const registerUsuario = async (req, res) => {
    try {
        const { Email, DNI, PasswordHash, ...userData } = req.body;

        // Validar si el Email ya existe
        const existingEmail = await User.findOne({ where: { Email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Validar si el DNI ya existe
        const existingDNI = await User.findOne({ where: { DNI } });
        if (existingDNI) {
            return res.status(400).json({ message: 'El DNI ya está registrado.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(PasswordHash, saltRounds);

        const user = await User.create({
            ...userData,
            Email,
            DNI,
            PasswordHash: hashedPassword
        });

        const { PasswordHash: _, ...userWithoutPassword } = user.toJSON(); // excluye la contraseña
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const updateUsuario = async (req, res) => {
    const userId = req.params.id;

    try {
        const updateData = { ...req.body };

        // Verificar si se está actualizando la contraseña
        if (updateData.PasswordHash) {
            const looksHashed = typeof updateData.PasswordHash === 'string' &&
                updateData.PasswordHash.startsWith('$2b$');

            if (!looksHashed) {
                const saltRounds = 10;
                updateData.PasswordHash = await bcrypt.hash(updateData.PasswordHash, saltRounds);
            }
        }

        const [updatedRows] = await User.update(updateData, {
            where: { UserId: userId },
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o sin cambios' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
};

export const deleteUsuario = async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedRows = await User.destroy({
            where: { UserId: userId },
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};

export const cambiarPassword = async (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword, requireCurrent = true } = req.body

  try {
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    if (requireCurrent) {
      const match = await bcrypt.compare(currentPassword, user.PasswordHash)
      if (!match) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" })
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.PasswordHash = hashedNewPassword
    await user.save()

    return res.status(200).json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}

export const obtenerUsuarioPorEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Error al buscar usuario por email:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const enviarEnlaceReset = async (req, res) => {
  const { email, cliente } = req.body;

  //console.log("📥 Solicitud de restablecimiento recibida para:", email);

  try {
    const usuario = await User.findOne({ where: { Email: email } });

    if (!usuario) {
      console.log("❌ Usuario no encontrado con el email:", email);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //console.log("✅ Usuario encontrado:", {id: usuario.id, Email: usuario.Email,});

    const resetToken = jwt.sign(
      {
        userId: usuario.UserId,
        email: usuario.Email,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    //console.log("🔐 Token generado:", resetToken);

     // URL base según el cliente
    const baseUrl =
      cliente === "ecommerce"
        ? "https://joinwithus.vercel.app/usuario"
        : "https://sistemajoinwithus.vercel.app"; // Por defecto "gestion"

    const resetLink = `${baseUrl}/changePassword?token=${resetToken}`;
    //console.log("🔗 Enlace de restablecimiento:", resetLink);

    // ENVÍO DEL CORREO
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"JoinWithUs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablece tu contraseña",
     html: `
  <div style="font-family: Arial, sans-serif; background-color: #121212; padding: 20px; color: #e0e0e0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 8px; overflow: hidden; box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);">
      <div style="background-color: #2d2d2d; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">JoinWithUs</h1>
        <p style="margin: 5px 0 0; font-size: 16px;">Restablecimiento de contraseña</p>
      </div>
      <div style="padding: 30px; color: #e0e0e0;">
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Para continuar, haz clic en el botón a continuación:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p>Si no realizaste esta solicitud, puedes ignorar este mensaje. El enlace caducará en 15 minutos por motivos de seguridad.</p>
        <p style="margin-top: 30px;">Gracias,<br><strong>Equipo JoinWithUs</strong></p>
      </div>
      <div style="background-color: #181818; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
        © ${new Date().getFullYear()} JoinWithUs. Todos los derechos reservados.
      </div>
    </div>
  </div>
`
,
    });

    //console.log("✉️ Correo enviado exitosamente a:", email);

    res.json({ message: "Enlace de restablecimiento enviado al correo." });
  } catch (error) {
    console.error("💥 Error al enviar correo:", error);
    res.status(500).json({ message: "Error al enviar correo." });
  }
};
