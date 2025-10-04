import { NextRequest, NextResponse } from 'next/server';
import { getAllCVs } from '@/lib/storage';
import { searchCVs } from '@/lib/cohere';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 5 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const cvs = getAllCVs();

    if (cvs.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No CVs available. Please upload some CVs first.',
      });
    }

    const results = await searchCVs(query, cvs, topK);

    // Remove embeddings from response to reduce size
    const cleanResults = results.map(result => ({
      cv: {
        ...result.cv,
        embedding: undefined,
      },
      similarity: result.similarity,
    }));

    return NextResponse.json({
      query,
      results: cleanResults,
      totalCVs: cvs.length,
    });
  } catch (error) {
    console.error('Error searching CVs:', error);
    return NextResponse.json({ error: 'Failed to search CVs' }, { status: 500 });
  }
}