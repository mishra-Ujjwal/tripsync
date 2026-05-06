import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
  "https://tripsyncproject.onrender.com",
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

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
