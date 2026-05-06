import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://tripsyncproject.onrender.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/places', placeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
