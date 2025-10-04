import { NextRequest, NextResponse } from 'next/server';
import { getAllCVs, addCV } from '@/lib/storage';
import { embedText } from '@/lib/cohere';
import { CV } from '@/lib/cohere';

export async function GET() {
  try {
    const cvs = getAllCVs();
    return NextResponse.json({ cvs, count: cvs.length });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json({ error: 'Failed to fetch CVs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, content } = body;

    if (!filename || !content) {
      return NextResponse.json(
        { error: 'Filename and content are required' },
        { status: 400 }
      );
    }

    // Generate embedding
    const embedding = await embedText(content);

    const cv: CV = {
      id: `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      content,
      embedding,
      uploadedAt: new Date(),
    };

    addCV(cv);

    return NextResponse.json({
      message: 'CV uploaded successfully',
      cv: { ...cv, embedding: undefined } // Don't send full embedding in response
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 });
  }
}