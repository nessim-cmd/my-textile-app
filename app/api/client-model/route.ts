/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Variant {
  id?: string;
  name: string;
  qte_variante: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/client-model called', request.url);
    const { searchParams } = new URL(request.url);
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const searchTerm = searchParams.get('search');
    const client = searchParams.get('client');

    console.log('Params:', { dateDebut, dateFin, searchTerm, client });

    const where: any = {};

    if (dateDebut && dateFin) {
      const startDate = new Date(dateDebut);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(dateFin);
      endDate.setUTCHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { commandes: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (client) {
      const clientRecord = await prisma.client.findFirst({ where: { name: client } });
      if (clientRecord) {
        where.clientId = clientRecord.id;
      } else {
        console.log(`Client "${client}" not found`);
        return NextResponse.json([]);
      }
    }

    const models = await prisma.clientModel.findMany({
      where,
      include: {
        client: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Models fetched:', models.length);
    return NextResponse.json(models);
  } catch (error: any) {
    console.error('Error fetching client models:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return NextResponse.json(
      { error: 'Failed to fetch client models', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const commandes = formData.get('commandes') as string;
    const commandesWithVariants = JSON.parse(formData.get('commandesWithVariants') as string);
    const lotto = formData.get('lotto') as string;
    const ordine = formData.get('ordine') as string;
    const puht = parseFloat(formData.get('puht') as string);
    const clientId = formData.get('clientId') as string;
    const variants = JSON.parse(formData.get('variants') as string);

    const files = formData.getAll('files') as File[];
    const filePaths: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const fileName = `${Date.now()}-${file.name}`;
          const bytes = await file.arrayBuffer();
          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: fileName,
            Body: Buffer.from(bytes),
            ContentType: file.type,
          }));
          filePaths.push(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`);
        }
      }
    }

    const newModel = await prisma.clientModel.create({
      data: {
        name: name || null,
        description: description || null,
        commandes: commandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : [],
        lotto: lotto || null,
        ordine: ordine || null,
        puht: puht || null,
        clientId,
        files: filePaths,
        variants: {
          create: variants.map((v: Variant) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante.toString()) : null,
          })),
        },
      },
      include: { variants: true, client: true },
    });

    console.log('Model created:', newModel.id);
    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('Error creating client model:', error);
    return NextResponse.json({ error: 'Failed to create client model', details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const commandes = formData.get('commandes') as string;
    const commandesWithVariantsString = formData.get('commandesWithVariants') as string;
    const lotto = formData.get('lotto') as string;
    const ordine = formData.get('ordine') as string;
    const puht = parseFloat(formData.get('puht') as string);
    const clientId = formData.get('clientId') as string;
    const variantsString = formData.get('variants') as string;

    console.log('PUT request received:', { id, name, clientId, filesCount: formData.getAll('files').length });

    let commandesWithVariants;
    let variants;
    try {
      commandesWithVariants = JSON.parse(commandesWithVariantsString);
      variants = JSON.parse(variantsString);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return NextResponse.json({ error: 'Invalid JSON in variantes or commandesWithVariants' }, { status: 400 });
    }

    const existingModel = await prisma.clientModel.findUnique({
      where: { id },
      select: { clientId: true, name: true, files: true },
    });
    if (!existingModel) {
      console.log('Model not found:', id);
      return NextResponse.json({ error: 'ClientModel not found' }, { status: 404 });
    }

    const files = formData.getAll('files') as File[];
    const filePaths: string[] = existingModel.files || [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const fileName = `${Date.now()}-${file.name}`;
          const bytes = await file.arrayBuffer();
          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: fileName,
            Body: Buffer.from(bytes),
            ContentType: file.type,
          }));
          filePaths.push(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`);
        }
      }
    }

    const updatedModel = await prisma.clientModel.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingModel.name,
        description: description !== undefined ? description : null,
        commandes: commandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : [],
        lotto: lotto !== undefined ? lotto : null,
        ordine: ordine !== undefined ? ordine : null,
        puht: puht !== undefined ? puht : null,
        clientId: clientId || existingModel.clientId,
        files: filePaths,
        ...(variants.length > 0 && {
          variants: {
            deleteMany: {},
            create: variants.map((v: Variant) => ({
              name: v.name || null,
              qte_variante: v.qte_variante ? parseInt(v.qte_variante.toString()) : null,
            })),
          },
        }),
      },
      include: { variants: true, client: true },
    });

    console.log('Model updated:', updatedModel.id);
    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json({ error: 'Failed to update client model', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.clientModel.delete({ where: { id } });
    console.log('Model deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model', details: String(error) }, { status: 500 });
  }
}