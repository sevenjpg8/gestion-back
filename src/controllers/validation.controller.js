// controllers/validation.controller.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const verificarDNI = async (req, res) => {
    const { numero } = req.body;

    if (!numero || !/^\d{8}$/.test(numero)) {
        return res.status(400).json({ error: 'DNI inválido. Debe tener 8 dígitos.' });
    }

    try {
        const response = await axios.get('https://api.decolecta.com/v1/reniec/dni', {
        params: { numero },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.APIS_TOKEN}`,
        },
        });

        res.json({ existe: true, datos: response.data });
    } catch (error) {
        if (error.response?.status === 404) {
        return res.status(404).json({ existe: false, mensaje: 'DNI no encontrado.' });
        }

        console.error('Error al consultar la API externa:', error.message);
        res.status(500).json({ error: 'Error al consultar la API externa.' });
    }
};

export const validarTelefono = async (req, res) => {
    const { numero } = req.body;

    try {
        const response = await axios.get("https://phoneintelligence.abstractapi.com/v1/", {
        params: {
            api_key: process.env.ABSTRACT_PHONE_API_KEY,
            phone: numero,
            country: "PE", // opcional para mejorar precisión
        },
        });

        const data = response.data;

        // ✅ Cambio clave: leer phone_validation.is_valid
        const isValid = data?.phone_validation?.is_valid === true;

        res.json({
            valido: isValid,
            pais: data?.phone_location?.country_name,
            tipo: data?.phone_carrier?.line_type,
            detalles: data,
        });
    } catch (error) {
        console.error("Error al validar el número:", error?.response?.data || error.message);
        res.status(500).json({ error: "Error al validar el número de teléfono" });
    }
};

export const validarEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.get("https://emailreputation.abstractapi.com/v1/", {
            params: {
                api_key: process.env.ABSTRACT_EMAIL_API_KEY,
                email,
            },
        });

        const data = response.data;

        // ✅ Leer los campos reales que devuelve la API
        const esValido =
            data?.email_deliverability?.status === "deliverable" &&
            data?.email_deliverability?.is_format_valid === true &&
            data?.email_deliverability?.is_mx_valid === true &&
            data?.email_deliverability?.is_smtp_valid === true;

        res.json({ valido: esValido, detalles: data });

    } catch (error) {
        console.error("Error en validarEmail:", error?.response?.data || error.message);
        res.status(500).json({ error: "Error al validar el correo electrónico" });
    }
};