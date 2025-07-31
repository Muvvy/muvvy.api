import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors({ origin: 'https://muvvy.github.io' }));
app.use(express.json());

const start = async () => {
  const db = await initDB();

  app.use('/api', authRouter(db));
  app.use('/api/messages', authMiddleware, messagesRouter(db));
  app.use('/api/me', authMiddleware, (req, res) => res.json({ user: req.user }));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`✅ API running on port ${port}`));
};

start();
