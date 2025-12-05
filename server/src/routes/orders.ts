import express from 'express';
import { esClient } from '../elastic';

const router = express.Router();
const ITEMS_INDEX = 'items';
const ORDERS_INDEX = 'orders';

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await esClient.search({
      index: ORDERS_INDEX,
      size: 100,
      body: {
        query: { match_all: {} },
        sort: [{ createdAt: { order: 'desc' } }]
      }
    });
    
    const orders = result.hits.hits.map((h: any) => ({ id: h._id, ...(h._source || {}) }));
    res.json({ ok: true, orders });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// PUT /api/orders/:id - Update order status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { shipped, shippingProvider, trackingId, emailCustomer } = req.body as {
    shipped: boolean;
    shippingProvider?: string;
    trackingId?: string;
    emailCustomer?: boolean;
  };
  
  try {
    const doc: any = { shipped, shippedAt: shipped ? new Date().toISOString() : null };
    if (shipped) {
      if (shippingProvider) doc.shippingProvider = shippingProvider;
      if (trackingId) doc.trackingId = trackingId;
      if (typeof emailCustomer === 'boolean') doc.emailCustomerNotified = emailCustomer;
    } else {
      doc.shippingProvider = null;
      doc.trackingId = null;
      doc.emailCustomerNotified = false;
    }

    await esClient.update({
      index: ORDERS_INDEX,
      id,
      doc,
      refresh: true
    });
    // TODO: optionally send email here using provider/env config
    res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// POST /api/orders/backfill - Backfill shipping fields on existing orders
router.post('/backfill', async (req, res) => {
  try {
    // Ensure mapping has fields
    try {
      await (esClient as any).indices.putMapping({
        index: ORDERS_INDEX,
        properties: {
          shippingProvider: { type: 'keyword' },
          trackingId: { type: 'keyword' },
          emailCustomerNotified: { type: 'boolean' },
          shippedAt: { type: 'date' },
        }
      });
    } catch (e: any) {
      // ignore mapping errors due to existing fields
    }

    const result: any = await esClient.search({
      index: ORDERS_INDEX,
      size: 1000,
      query: { match_all: {} },
    } as any);

    const hits = result.hits?.hits || [];
    if (hits.length === 0) {
      return res.json({ ok: true, updated: 0 });
    }

    const bulkBody: any[] = [];
    let toUpdate = 0;
    for (const h of hits) {
      const src = h._source || {};
      let needUpdate = false;
      const doc: any = {};

      if (typeof src.shippingProvider === 'undefined') { doc.shippingProvider = null; needUpdate = true; }
      if (typeof src.trackingId === 'undefined') { doc.trackingId = null; needUpdate = true; }
      if (typeof src.emailCustomerNotified === 'undefined') { doc.emailCustomerNotified = false; needUpdate = true; }
      if (src.shipped === true && (typeof src.shippedAt === 'undefined' || src.shippedAt === null)) {
        doc.shippedAt = src.createdAt || new Date().toISOString();
        needUpdate = true;
      }

      if (needUpdate) {
        toUpdate++;
        bulkBody.push({ update: { _index: ORDERS_INDEX, _id: h._id } });
        bulkBody.push({ doc });
      }
    }

    if (bulkBody.length > 0) {
      await esClient.bulk({ refresh: true, body: bulkBody } as any);
    }
    res.json({ ok: true, updated: toUpdate });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

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

      const r: any = await esClient.get({ index: ITEMS_INDEX, id }).catch(() => null);
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
      const r: any = await esClient.get({ index: ITEMS_INDEX, id });
      const current = (r._source as any).inventory || 0;
      const newInv = Math.max(0, current - qty);
      await esClient.update({ index: ITEMS_INDEX, id, doc: { inventory: newInv } });
    }

    // Store the order
    const order = {
      items,
      buyer,
      shipped: false,
      shippingProvider: null,
      trackingId: null,
      emailCustomerNotified: false,
      createdAt: new Date().toISOString(),
      total: 0
    };
    
    const result = await esClient.index({
      index: ORDERS_INDEX,
      document: order,
      refresh: true
    });

    // refresh index
    await esClient.indices.refresh({ index: ITEMS_INDEX });

    // Return the order number (id)
    return res.json({ ok: true, orderNumber: result._id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;
