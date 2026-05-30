//app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import eventosRoutes from './routes/eventos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import cuponesRoutes from './routes/coupons.routes.js';
import favoritosRoutes from './routes/favorites.routes.js';
import notificacionesRoutes from './routes/notifications.routes.js';
import multimediaRoutes from './routes/multimedia.routes.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import ayudaRoutes from './routes/ayuda.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import validationDNIRoute from './routes/validation.route.js';

const app = express();

/* ==========================
   CONFIGURACIÓN
========================== */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim()) || [];

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request origin:', origin);           // ← qué origen llega
    console.log('Allowed:', allowedOrigins);          // ← qué tiene el array
    console.log('Match:', allowedOrigins.includes(origin)); // ← si matchea
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/* ==========================
   RUTAS
========================== */

app.use(eventosRoutes);
app.use(usuariosRoutes);
app.use(ticketsRoutes);
app.use(reviewsRoutes);
app.use(ordersRoutes);
app.use(cuponesRoutes);
app.use(favoritosRoutes);
app.use(notificacionesRoutes);
app.use(solicitudRoutes);
app.use(ayudaRoutes);
app.use(dashboardRoutes);
app.use(paymentRoutes);

app.use('/api/multimedia', multimediaRoutes);
app.use('/api', validationDNIRoute);

export default app;