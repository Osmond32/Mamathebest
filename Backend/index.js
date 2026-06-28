import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import alimentazioneRoute from './src/routes/alimentazioneRoute.js';
import bambiniRoute from './src/routes/bambiniRoute.js';
import pesateRoute from './src/routes/pesateRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/alimentazione', alimentazioneRoute);
app.use('/bambini', bambiniRoute);
app.use('/pesate', pesateRoute);

app.get('/', (req, res) => {
  res.json({ message: "Il server è attivo! 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
