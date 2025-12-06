import express from 'express';
import { esClient } from '../elastic';

const router = express.Router();
const ITEMS_INDEX = 'items';
const ORDERS_INDEX = 'orders';
const ORDER_REVIEWS_INDEX = 'order_reviews';

// Ensure index mapping exists for order_reviews
async function ensureOrderReviewsIndex() {
  try {
    await (esClient as any).indices.create({
      index: ORDER_REVIEWS_INDEX,
      body: {
        mappings: {
          properties: {
            orderId: { type: 'keyword' },
            name: { type: 'text' },
            rating: { type: 'integer' },
            comment: { type: 'text' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
  } catch (e: any) {
    // ignore if already exists
  }
}

// GET /api/reviews/order/:orderId - check if review exists and fetch order summary
router.get('/order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order: any = await esClient.get({ index: ORDERS_INDEX, id: orderId }).catch(() => null);
    if (!order || !order._source) return res.status(404).json({ ok: false, error: 'Order not found' });

    const existing: any = await esClient.search({
      index: ORDER_REVIEWS_INDEX,
      size: 1,
      query: { term: { orderId } }
    } as any).catch(() => ({ hits: { hits: [] } }));

    const reviewed = (existing.hits?.hits || []).length > 0;
    return res.json({ ok: true, reviewed, order: { id: order._id, ...(order._source || {}) } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// POST /api/reviews/order - submit a single review for an order, applied to all items
// body: { orderId, name, rating, comment }
router.post('/order', async (req, res) => {
  const { orderId, name, rating, comment } = req.body as { orderId: string; name: string; rating: number; comment: string };
  if (!orderId || !name || !comment || typeof rating !== 'number') {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  try {
    await ensureOrderReviewsIndex();

    // Validate order exists
    const order: any = await esClient.get({ index: ORDERS_INDEX, id: orderId }).catch(() => null);
    if (!order || !order._source) return res.status(404).json({ ok: false, error: 'Order not found' });

    // Ensure only one review per order
    const existing: any = await esClient.search({
      index: ORDER_REVIEWS_INDEX,
      size: 1,
      query: { term: { orderId } }
    } as any);
    if ((existing.hits?.hits || []).length > 0) {
      return res.status(409).json({ ok: false, error: 'Review already submitted for this order' });
    }

    // Create order review record
    await esClient.index({
      index: ORDER_REVIEWS_INDEX,
      document: { orderId, name, rating, comment, createdAt: new Date().toISOString() },
      refresh: true
    });

    // Apply to all items: increment reviewCount and update averageRating (simple running average)
    const items: Array<{ id: string; qty: number }> = order._source.items || [];
    for (const it of items) {
      const r: any = await esClient.get({ index: ITEMS_INDEX, id: it.id }).catch(()=>null);
      if (!r || !r._source) continue;
      const src = r._source as any;
      const currentCount = typeof src.reviewCount === 'number' ? src.reviewCount : (Array.isArray(src.reviews) ? src.reviews.length : 0);
      const currentAvg = typeof src.averageRating === 'number' ? src.averageRating : 0;
      const newCount = currentCount + 1;
      const newAvg = newCount === 0 ? 0 : ((currentAvg * currentCount + rating) / newCount);
      await esClient.update({ index: ITEMS_INDEX, id: it.id, doc: { reviewCount: newCount, averageRating: Math.round(newAvg * 10) / 10 } });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;