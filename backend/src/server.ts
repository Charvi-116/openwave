import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'OpenWave backend', timestamp: new Date().toISOString() });
});

app.get('/api/tracks', (_req, res) => {
  res.json({
    data: [
      {
        id: '1',
        title: 'Sunrise Echoes',
        artist: 'Luma Harbor',
        genre: 'Ambient',
        license: 'CC-BY',
        source: 'Jamendo',
      },
      {
        id: '2',
        title: 'Night Signals',
        artist: 'Arcadia Found',
        genre: 'Electronic',
        license: 'CC-BY-SA',
        source: 'Internet Archive',
      },
      {
        id: '3',
        title: 'Glass Horizon',
        artist: 'Morrow Lane',
        genre: 'Lo-fi',
        license: 'public-domain',
        source: 'Wikimedia Commons',
      },
    ],
  });
});

app.listen(port, () => {
  console.log(`OpenWave backend listening on http://localhost:${port}`);
});
