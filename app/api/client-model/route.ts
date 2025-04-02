/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface Variant {
  id?: string;
  name: string;
  qte_variante: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const searchTerm = searchParams.get('search');
    const client = searchParams.get('client');

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

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching client models:', error);
    return NextResponse.json({ error: 'Failed to fetch client models' }, { status: 500 });
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
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      for (const file of files) {
        if (file instanceof File) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          const bytes = await file.arrayBuffer();
          await writeFile(filePath, Buffer.from(bytes));
          filePaths.push(`/uploads/${fileName}`);
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

    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('Error creating client model:', error);
    return NextResponse.json({ error: 'Failed to create client model' }, { status: 500 });
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

    console.log('PUT request received:', {
      id,
      name,
      clientId,
      filesCount: formData.getAll('files').length,
    });

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
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      console.log('Creating directory if not exists:', uploadDir);
      await mkdir(uploadDir, { recursive: true });
      
      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          console.log(`Attempting to write file: ${filePath}, size: ${file.size}`);
          try {
            const bytes = await file.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));
            filePaths.push(`/uploads/${fileName}`);
            console.log(`Successfully wrote file: ${filePath}`);
          } catch (writeError) {
            console.error(`Failed to write file ${file.name}:`, writeError);
            throw new Error(`Failed to write file ${file.name}`);
          }
        } else {
          console.warn('Skipping invalid file:', file);
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

    console.log('Model updated successfully:', updatedModel.id);
    return NextResponse.json(updatedModel);
  } catch (error: any) {
    console.error('Detailed error updating client model:', {
      message: error.message,
      stack: error.stack,
      requestData: {
        id: request.url,
        hasFiles: !!request.headers.get('content-type')?.includes('multipart/form-data'),
      },
    });
    return NextResponse.json(
      { error: 'Failed to update client model', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.clientModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model' }, { status: 500 });
  }
}