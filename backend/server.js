const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'db.json');

// GET /api/data => récupère toutes les données
app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readJson(dbPath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire la base de données.' });
  }
});

// POST /api/add => ajoute un utilisateur avec mot de passe hashé
app.post('/api/add', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Données manquantes.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = await fs.readJson(dbPath);

    db.users = db.users || [];
    db.users.push({ username, password: hashedPassword });

    await fs.writeJson(dbPath, db, { spaces: 2 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Impossible d’ajouter l’utilisateur.' });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
