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

interface SearchResult {
  filename: string;
  content: string;
  similarity: number;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function loadCVs(): Promise<CV[]> {
  const cvsDir = path.join(process.cwd(), 'data', 'cvs');
  const files = fs.readdirSync(cvsDir);

  const cvs: CV[] = files
    .filter(file => file.endsWith('.txt'))
    .map(file => ({
      filename: file,
      content: fs.readFileSync(path.join(cvsDir, file), 'utf-8'),
    }));

  return cvs;
}

async function embedDocuments(cvs: CV[]): Promise<CV[]> {
  console.log('Embedding CVs...');

  const embeddingFile = path.join(process.cwd(), 'data', 'embeddings.json');

  // Check if embeddings already exist
  if (fs.existsSync(embeddingFile)) {
    console.log('Loading existing embeddings...');
    const savedData = JSON.parse(fs.readFileSync(embeddingFile, 'utf-8'));
    return savedData;
  }

  const texts = cvs.map(cv => cv.content);

  // Batch embed all CVs (Cohere can handle up to 96 documents at once)
  const batchSize = 90;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}...`);

    const response = await cohere.embed({
      texts: batch,
      model: 'embed-english-v3.0',
      inputType: 'search_document',
    });

    allEmbeddings.push(...response.embeddings);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const cvsWithEmbeddings = cvs.map((cv, i) => ({
    ...cv,
    embedding: allEmbeddings[i],
  }));

  // Save embeddings to file
  fs.writeFileSync(embeddingFile, JSON.stringify(cvsWithEmbeddings, null, 2));
  console.log('Embeddings saved!');

  return cvsWithEmbeddings;
}

async function searchCVs(query: string, cvs: CV[], topK: number = 5): Promise<SearchResult[]> {
  console.log(`\nSearching for: "${query}"\n`);

  // Embed the query
  const queryResponse = await cohere.embed({
    texts: [query],
    model: 'embed-english-v3.0',
    inputType: 'search_query',
  });

  const queryEmbedding = queryResponse.embeddings[0];

  // Calculate similarities
  const results = cvs.map(cv => ({
    filename: cv.filename,
    content: cv.content,
    similarity: cosineSimilarity(queryEmbedding, cv.embedding!),
  }));

  // Sort by similarity and get top K
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}

async function main() {
  console.log('Loading CVs...');
  const cvs = await loadCVs();
  console.log(`Loaded ${cvs.length} CVs`);

  const cvsWithEmbeddings = await embedDocuments(cvs);

  // Search for "mobile developers"
  const results = await searchCVs('mobile developers', cvsWithEmbeddings, 5);

  console.log('='.repeat(80));
  console.log('TOP 5 MOBILE DEVELOPERS');
  console.log('='.repeat(80));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.filename} (Similarity: ${(result.similarity * 100).toFixed(2)}%)`);
    console.log('-'.repeat(80));
    console.log(result.content.substring(0, 500) + '...');
    console.log('-'.repeat(80));
  });

  // Also demonstrate with some other queries
  console.log('\n\n' + '='.repeat(80));
  console.log('ADDITIONAL SEARCH EXAMPLES');
  console.log('='.repeat(80));

  const additionalQueries = [
    'iOS expert',
    'Android specialist',
    'cross-platform app engineer',
  ];

  for (const query of additionalQueries) {
    const queryResults = await searchCVs(query, cvsWithEmbeddings, 3);
    console.log(`\n\nQuery: "${query}"`);
    console.log('-'.repeat(80));
    queryResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.filename} (${(result.similarity * 100).toFixed(2)}%)`);
    });
  }
}

main().catch(console.error);