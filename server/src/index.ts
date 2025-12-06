import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import itemsRouter from './routes/items';
import ordersRouter from './routes/orders';
import contactRouter from './routes/contact';
import reviewsRouter from './routes/reviews';
import authRouter from './routes/auth';
import { checkHealth } from './elastic';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' })); // Increased from default 100kb to support large images
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.get('/api/health', async (req, res) => {
  const status = await checkHealth();
  res.json(status);
});

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewsRouter);

// Serve client static files (if built) and fall back to index.html for non-API routes
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Any non-API route should return the client index.html so React Router can handle it
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const port = process.env.PORT || 3020;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
