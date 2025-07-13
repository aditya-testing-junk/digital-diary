import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Models ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const noteSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  content: String,
});
const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// --- Auth Middleware ---
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Routes ---

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (await User.findOne({ username })) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Save note
app.post('/api/note', auth, async (req, res) => {
  const { content } = req.body;
  await Note.create({ userId: req.user.userId, content });
  res.json({ success: true });
});

// Get notes
app.get('/api/notes', auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.userId });
  res.json(notes);
});

// --- Start server (for local testing) ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

export default app;
