import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[]; // Changed to getAll for multiple files

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload all files to Vercel Blob and collect URLs
    const uploadPromises = files.map((file) =>
      put(file.name, file, {
        access: 'public', // Makes the files publicly accessible
      })
    );
    const blobs = await Promise.all(uploadPromises);
    const urls = blobs.map((blob) => blob.url);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}