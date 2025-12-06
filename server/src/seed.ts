import { esClient } from './elastic';

async function run() {
  const itemsIndex = 'items';
  const ordersIndex = 'orders';

  // wait for ES to be reachable
  async function waitForEs(attempts = 20, delayMs = 1000) {
    for (let i = 0; i < attempts; i++) {
      try {
        await esClient.ping();
        return;
      } catch (err) {
        console.log('Waiting for Elasticsearch... attempt', i + 1);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    throw new Error('Elasticsearch did not become ready in time');
  }

  await waitForEs();

  // Create items index
  const existsResp = await esClient.indices.exists({ index: itemsIndex });
  const exists = typeof existsResp === 'boolean' ? existsResp : (existsResp && (existsResp as any).body === true);

  if (!exists) {
    // create index with mappings suitable for bracelets
    await esClient.indices.create({
      index: itemsIndex,
      body: {
        mappings: {
          properties: {
            title: { type: 'text' },
            description: { type: 'text' },
            category: { type: 'keyword' },
            size: { type: 'keyword' },
            colors: { type: 'keyword' },
            pattern: { type: 'keyword' },
            imageSvg: { type: 'text' },
            inventory: { type: 'integer' },
            price: { type: 'float' },
            averageRating: { type: 'float' },
            reviews: { type: 'object', enabled: false },
            createdAt: { type: 'date' }
          }
        }
      }
    });
    console.log('Created index:', itemsIndex);
  } else {
    console.log('Index already exists:', itemsIndex);
  }

  // Create orders index
  const ordersExistsResp = await esClient.indices.exists({ index: ordersIndex });
  const ordersExists = typeof ordersExistsResp === 'boolean' ? ordersExistsResp : (ordersExistsResp && (ordersExistsResp as any).body === true);

  if (!ordersExists) {
    await esClient.indices.create({
      index: ordersIndex,
      body: {
        mappings: {
          properties: {
            items: { type: 'object', enabled: false },
            buyer: { type: 'object', enabled: false },
            shipped: { type: 'boolean' },
            shippedAt: { type: 'date' },
            shippingProvider: { type: 'keyword' },
            trackingId: { type: 'keyword' },
            emailCustomerNotified: { type: 'boolean' },
            deliveredAt: { type: 'date' },
            createdAt: { type: 'date' },
            total: { type: 'float' }
          }
        }
      }
    });
    console.log('Created index:', ordersIndex);
  } else {
    console.log('Index already exists:', ordersIndex);
  }

  // const sample = [
  // { title: 'Rainbow Smile Bracelet', description: 'Bright multicolor beads with a smile charm', category: 'bracelet', size: 'small', colors: ['rainbow'], pattern: 'smile', price: 8.99, inventory: 12, averageRating: 0, reviews: [], createdAt: new Date() },
  // { title: 'Pastel Dreams Bracelet', description: 'Soft pastel beads for a gentle look', category: 'bracelet', size: 'medium', colors: ['pastel'], pattern: 'pastel', price: 10.5, inventory: 8, averageRating: 0, reviews: [], createdAt: new Date() },
  // { title: 'Ocean Wave Bracelet', description: 'Blue and teal beads inspired by the sea', category: 'bracelet', size: 'large', colors: ['blue','teal'], pattern: 'wave', price: 12.0, inventory: 6, averageRating: 0, reviews: [], createdAt: new Date() },
  // { title: 'Party Pop Bracelet', description: 'Colorful fun beads for celebrations', category: 'bracelet', size: 'medium', colors: ['multicolor'], pattern: 'party', price: 9.5, inventory: 10, averageRating: 0, reviews: [], createdAt: new Date() },
  // { title: 'Custom Name Bracelet', description: 'Personalized with letters — add a name in the order', category: 'bracelet', size: 'custom', colors: ['any'], pattern: 'custom', price: 14.0, inventory: 4, averageRating: 0, reviews: [], createdAt: new Date() },
  // { title: 'Gold Accent Bracelet', description: 'Classic beads with gold-accent spacers', category: 'bracelet', size: 'small', colors: ['gold','cream'], pattern: 'classic', price: 15.0, inventory: 5, averageRating: 0, reviews: [], createdAt: new Date() }
  // ];

  // for (const doc of sample) {
  //   // attach a small placeholder SVG for each sample item
  //   const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#fff6f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#d95b6b">${doc.title.replace(/'/g,'')}</text></svg>`;
  //   (doc as any).imageSvg = placeholder;
  //   await esClient.index({ index: itemsIndex, document: doc });
  // }
  // await esClient.indices.refresh({ index: itemsIndex });
  // console.log('Seeded sample bracelet items');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
