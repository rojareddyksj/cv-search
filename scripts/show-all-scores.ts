import { CohereClient } from 'cohere-ai';
import * as fs from 'fs';
import * as path from 'path';

const cohere = new CohereClient({
  token: 'urHf4BtmwVpVvNornL5HvH14WLxNS9wthWIWGj1p',
});

interface CV {
  filename: string;
  content: string;
  embedding?: number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function main() {
  const embeddingFile = path.join(process.cwd(), 'data', 'embeddings.json');
  const cvs: CV[] = JSON.parse(fs.readFileSync(embeddingFile, 'utf-8'));

  const query = 'mobile developers';

  const queryResponse = await cohere.embed({
    texts: [query],
    model: 'embed-english-v3.0',
    inputType: 'search_query',
  });

  const queryEmbedding = queryResponse.embeddings[0];

  const results = cvs.map(cv => ({
    filename: cv.filename,
    similarity: cosineSimilarity(queryEmbedding, cv.embedding!),
  }));

  results.sort((a, b) => b.similarity - a.similarity);

  console.log(`Query: "${query}"\n`);
  console.log('Rank | Similarity | Filename');
  console.log('-----|------------|-------------------------------------------');

  results.forEach((result, index) => {
    const rank = (index + 1).toString().padStart(4, ' ');
    const similarity = (result.similarity * 100).toFixed(2).padStart(6, ' ') + '%';
    console.log(`${rank} | ${similarity} | ${result.filename}`);
  });
}

main().catch(console.error);