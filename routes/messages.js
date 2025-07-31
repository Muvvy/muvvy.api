import express from 'express';

export default function (db) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const messages = await db.all(`
      SELECT messages.content, messages.timestamp, users.username
      FROM messages JOIN users ON users.id = messages.user_id
      ORDER BY messages.timestamp DESC
      LIMIT 50
    `);
    res.json(messages);
  });

  router.post('/', async (req, res) => {
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Empty message' });

    await db.run('INSERT INTO messages (user_id, content) VALUES (?, ?)', [userId, content]);
    res.json({ message: 'Message sent' });
  });

  return router;
}
