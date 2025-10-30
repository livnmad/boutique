import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import itemsRouter from './routes/items';
import ordersRouter from './routes/orders';
import { checkHealth } from './elastic';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const status = await checkHealth();
  res.json(status);
});

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);

// Serve client static files (if built) and fall back to index.html for non-API routes
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Any non-API route should return the client index.html so React Router can handle it
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
