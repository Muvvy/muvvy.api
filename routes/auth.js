import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default function (db) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ error: 'Missing fields' });

    const hash = await bcrypt.hash(password, 10);
    try {
      await db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hash]);
      res.json({ message: 'User registered' });
    } catch (err) {
      res.status(400).json({ error: 'Email already in use' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token });
  });

  router.get('/me', (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}
