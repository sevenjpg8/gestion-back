import app from './app.js';
import sequelize from './config/connection.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

// Obtener origins desde .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket']
});

// Hacer disponible io globalmente
global.io = io;

// Eventos Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado');

  socket.on('joinRoom', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👥 Usuario ${userId} unido a user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Conexión BD e inicio del servidor
try {
  await sequelize.authenticate();
  console.log('✅ Base de datos conectada');

  const PORT = process.env.APP_PORT || 3000;

  server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log('🌐 Origins permitidos:', allowedOrigins);
  });

} catch (error) {
  console.error('❌ Error al conectar a la base de datos:', error);
}