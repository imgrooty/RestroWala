import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { optimizeModel } from '@/lib/modelOptimizer';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.glb', '.gltf'];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        const extension = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json({ error: 'Invalid file type. Only GLB and glTF are supported' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Optimize GLB if applicable
        let finalBuffer: Buffer<ArrayBufferLike> = buffer;
        let metadata = {
            fileSize: buffer.length,
            vertices: 0,
            triangles: 0,
            isCompressed: false,
        };

        if (extension === '.glb') {
            const optimized = await optimizeModel(buffer);
            finalBuffer = optimized.data;
            metadata = optimized.metadata;
        }

        // Save file to public/models
        const fileName = `${uuidv4()}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'models');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (_err) {
            // Ignore if directory exists
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, finalBuffer);

        return NextResponse.json({
            success: true,
            url: `/models/${fileName}`,
            metadata,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
    }
}
