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
        const response = await axios.get("https://phonevalidation.abstractapi.com/v1/", {
        params: {
            api_key: process.env.ABSTRACT_PHONE_API_KEY,
            phone: numero,
            country: "PE", // opcional para mejorar precisión
        },
        });

        const { valid, country, type } = response.data;

        res.json({
            valido: valid,
            pais: country?.name,
            tipo: type,
            detalles: response.data,
        });
    } catch (error) {
        console.error("Error al validar el número:", error?.response?.data || error.message);
        res.status(500).json({ error: "Error al validar el número de teléfono" });
    }
};

export const validarEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.get("https://emailvalidation.abstractapi.com/v1/", {
        params: {
            api_key: process.env.ABSTRACT_EMAIL_API_KEY,
            email,
        },
        });

        const { is_valid_format, is_mx_found, is_smtp_valid, deliverability } = response.data;

        const esValido =
        is_valid_format?.value &&
        is_mx_found?.value &&
        is_smtp_valid?.value &&
        deliverability === "DELIVERABLE";

        res.json({ valido: esValido, detalles: response.data });
    } catch (error) {
        console.error("Error en validarEmail:", error?.response?.data || error.message);
        res.status(500).json({ error: "Error al validar el correo electrónico" });
    }
}