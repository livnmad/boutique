import express from 'express';
import { esClient } from '../elastic';

const router = express.Router();
const INDEX = 'items';

// POST /api/orders
// body: { items: [{ id, qty }], buyer: { name, email } }
router.post('/', async (req, res) => {
  const { items, buyer } = req.body as { items: Array<{ id: string; qty: number }>; buyer?: any };
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: 'No items provided' });
  }

  try {
    // check inventory for each item
    for (const it of items) {
      const id = it.id;
      const qty = Number(it.qty || 0);
      if (!id || qty <= 0) return res.status(400).json({ ok: false, error: 'Invalid item or qty' });

      const r: any = await esClient.get({ index: INDEX, id }).catch(() => null);
      if (!r || !r._source) return res.status(404).json({ ok: false, error: `Item ${id} not found` });

      const current = (r._source as any).inventory || 0;
      if (current < qty) {
        return res.status(400).json({ ok: false, error: `Insufficient inventory for item ${id}` });
      }
    }

    // all ok, perform updates
    for (const it of items) {
      const id = it.id;
      const qty = Number(it.qty || 0);
      const r: any = await esClient.get({ index: INDEX, id });
      const current = (r._source as any).inventory || 0;
      const newInv = Math.max(0, current - qty);
      await esClient.update({ index: INDEX, id, doc: { inventory: newInv } });
    }

    // refresh index
    await esClient.indices.refresh({ index: INDEX });

    // TODO: store order record if desired
    return res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;
