import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { initDB } from "./db.js";
import { authMiddleware } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = await initDB();

app.use(cors());
app.use(express.json());

// Регистрация
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Требуется имя пользователя и пароль" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
    res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    res.status(400).json({ message: "Пользователь с таким именем уже существует" });
  }
});

// Вход
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(401).json({ message: "Неверное имя или пароль" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Неверное имя или пароль" });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
  res.json({ token });
});

// Получить данные текущего пользователя
app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await db.get("SELECT id, username FROM users WHERE id = ?", [req.user.id]);
  res.json(user);
});

// Публичный профиль пользователя по имени
app.get("/api/users/:username", async (req, res) => {
  const { username } = req.params;
  const user = await db.get("SELECT id, username FROM users WHERE username = ?", [username]);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });
  res.json(user);
});

app.listen(port, () => {
  console.log(`Muvvy backend запущен на http://localhost:${port}`);
});
