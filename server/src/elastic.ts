import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const node = process.env.ELASTIC_URL || 'http://localhost:9200';

const auth: any = {};
if (process.env.ELASTIC_API_KEY) {
  auth.apiKey = process.env.ELASTIC_API_KEY;
} else if (process.env.ELASTIC_USERNAME && process.env.ELASTIC_PASSWORD) {
  auth.username = process.env.ELASTIC_USERNAME;
  auth.password = process.env.ELASTIC_PASSWORD;
}

export const esClient = new Client({
  node,
  auth: Object.keys(auth).length ? auth : undefined,
});

export async function checkHealth() {
  try {
    const info = await esClient.info();
    return { ok: true, name: info.name, cluster: info.cluster_name };
  } catch (err: any) {
    return { ok: false, error: err.message || String(err) };
  }
}
