import { esClient } from './elastic';

const ORDERS_INDEX = 'orders';

async function ensureMapping() {
  try {
    await esClient.indices.putMapping({
      index: ORDERS_INDEX,
      properties: {
        shippingProvider: { type: 'keyword' },
        trackingId: { type: 'keyword' },
        emailCustomerNotified: { type: 'boolean' },
        shippedAt: { type: 'date' },
      } as any,
    } as any);
    console.log('Mapping updated for orders index');
  } catch (err) {
    console.warn('Mapping update warning (may already exist):', (err as any)?.message || err);
  }
}

async function backfill() {
  await ensureMapping();

  const pageSize = 1000;
  const result: any = await esClient.search({
    index: ORDERS_INDEX,
    size: pageSize,
    query: { match_all: {} },
  } as any);

  const hits = result.hits?.hits || [];
  if (hits.length === 0) {
    console.log('No orders to backfill');
    return;
  }

  const bulkBody: any[] = [];
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
      bulkBody.push({ update: { _index: ORDERS_INDEX, _id: h._id } });
      bulkBody.push({ doc });
    }
  }

  if (bulkBody.length > 0) {
    const bulkResp = await esClient.bulk({ refresh: true, body: bulkBody } as any);
    if (bulkResp.errors) {
      console.error('Bulk backfill completed with errors');
    } else {
      console.log(`Backfilled ${bulkBody.length / 2} orders`);
    }
  } else {
    console.log('All orders already contain shipping fields');
  }
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
