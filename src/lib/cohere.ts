import { CohereClient } from 'cohere-ai';

export const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'urHf4BtmwVpVvNornL5HvH14WLxNS9wthWIWGj1p',
});

export interface CV {
  id: string;
  filename: string;
  content: string;
  embedding?: number[];
  uploadedAt: Date;
}

export interface SearchResult {
  cv: CV;
  similarity: number;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function embedText(text: string): Promise<number[]> {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0',
    inputType: 'search_document',
  });
  return response.embeddings[0];
}

export async function embedQuery(query: string): Promise<number[]> {
  const response = await cohere.embed({
    texts: [query],
    model: 'embed-english-v3.0',
    inputType: 'search_query',
  });
  return response.embeddings[0];
}

export async function searchCVs(query: string, cvs: CV[], topK: number = 5): Promise<SearchResult[]> {
  const queryEmbedding = await embedQuery(query);

  const results = cvs
    .filter(cv => cv.embedding)
    .map(cv => ({
      cv,
      similarity: cosineSimilarity(queryEmbedding, cv.embedding!),
    }));

  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}