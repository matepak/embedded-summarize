require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const fetchRoutes = require('./routes/fetch');

const app = express();
const port = 3000;

app.use(express.json());

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in the environment variables');
  process.exit(1);
}

connectDB();

app.use(authRoutes);
app.use(fetchRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something went wrong: ${err.message}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
