import express from 'express';
import { esClient } from '../elastic';
import { sanitizeSvg } from '../sanitizeSvg';

const router = express.Router();
const INDEX = 'items';

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  try {
    const searchParams = {
      index: INDEX,
      size: 50,
      body: {
        query: q
          ? { multi_match: { query: q, fields: ['title^2', 'description'] } }
          : { match_all: {} }
      },
      sort: [
        { averageRating: { order: 'desc', missing: '_last' } }
      ]
    };

    const r = await esClient.search(searchParams);
    // cast hit to any to avoid TS spreading issues when _source may be unknown
    const hits = r.hits.hits.map((h: any) => ({ id: h._id, ...(h._source || {}) }));
    res.json({ ok: true, results: hits });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await esClient.get({
      index: INDEX,
      id
    });
    res.json({ ok: true, item: { id: r._id, ...(r._source as object) } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

router.post('/', async (req, res) => {
  const doc = req.body;
  try {
    // sanitize image SVG if present
    if (doc && typeof doc.imageSvg === 'string' && doc.imageSvg.trim()) {
      doc.imageSvg = sanitizeSvg(doc.imageSvg);
    }
    
    // Initialize reviews array and set creation date
    doc.reviews = [];
    doc.createdAt = new Date().toISOString();
    
  } catch (err) {
    console.warn('SVG sanitization failed', err);
  }
  try {
    const r = await esClient.index({ index: INDEX, document: doc });
    // refresh so reads are immediate for development
    await esClient.indices.refresh({ index: INDEX });
    res.json({ ok: true, id: r._id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const doc = req.body;
  try {
    // sanitize image SVG if present
    if (doc && typeof doc.imageSvg === 'string' && doc.imageSvg.trim()) {
      doc.imageSvg = sanitizeSvg(doc.imageSvg);
    }
  } catch (err) {
    console.warn('SVG sanitization failed', err);
  }
  try {
    const r = await esClient.update({
      index: INDEX,
      id,
      doc,
      refresh: true
    });
    res.json({ ok: true, id: r._id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// Add a review to an item
router.post('/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Name, rating, and comment are required' 
    });
  }

  try {
    // Get current item
    const item = await esClient.get({
      index: INDEX,
      id
    });

    const currentItem = item._source as any;
    const reviews = currentItem.reviews || [];

    // Add new review
    const newReview = {
      id: Date.now().toString(),
      name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString()
    };

    reviews.push(newReview);

    // Calculate new average rating
    const averageRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;

    // Update item with new review and average rating
    await esClient.update({
      index: INDEX,
      id,
      doc: {
        reviews,
        averageRating
      },
      refresh: true
    });

    res.json({ ok: true, review: newReview });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// Get reviews for an item
router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await esClient.get({
      index: INDEX,
      id
    });

    const reviews = ((item._source as any).reviews || []).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ ok: true, reviews });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;
