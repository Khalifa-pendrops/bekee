import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload.' }, { status: 400 });
    }

    const uploadedUrls: { url: string; originalName: string }[] = [];

    // Optional Supabase Storage client
    let supabase: any = null;
    if (supabaseUrl && supabaseServiceKey && !supabaseServiceKey.includes('placeholder')) {
      try {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
      } catch (e) {
        // Fall back to local storage
      }
    }

    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(publicUploadsDir, { recursive: true });

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean file extension and base name
      const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const rawBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      const uniqueFileName = `${rawBase || 'product'}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${cleanExt}`;

      let fileUploadedUrl: string | null = null;

      // 1. Try Supabase Storage 'product-images'
      if (supabase) {
        try {
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(`products/${uniqueFileName}`, buffer, {
              contentType: file.type || 'image/jpeg',
              upsert: true,
            });

          if (!error && data) {
            const { data: pubData } = supabase.storage
              .from('product-images')
              .getPublicUrl(`products/${uniqueFileName}`);
            if (pubData?.publicUrl) {
              fileUploadedUrl = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          // If bucket doesn't exist yet, smoothly fallback to local
        }
      }

      // 2. Fallback: Save directly to public/uploads
      if (!fileUploadedUrl) {
        const filePath = path.join(publicUploadsDir, uniqueFileName);
        await writeFile(filePath, buffer);
        fileUploadedUrl = `/uploads/${uniqueFileName}`;
      }

      uploadedUrls.push({
        url: fileUploadedUrl,
        originalName: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
    });
  } catch (error: any) {
    console.error('[API /api/admin/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files', message: error.message },
      { status: 500 }
    );
  }
}

