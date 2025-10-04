import { NextRequest, NextResponse } from 'next/server';
import { getCVById, deleteCV } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cv = getCVById(id);

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    return NextResponse.json({ cv: { ...cv, embedding: undefined } });
  } catch (error) {
    console.error('Error fetching CV:', error);
    return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteCV(id);

    if (!success) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 });
  }
}