/* eslint-disable @typescript-eslint/no-explicit-any */
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const commandes = formData.get('commandes') as string | null;
    const lotto = formData.get('lotto') as string | null;
    const ordine = formData.get('ordine') as string | null;
    const puht = formData.get('puht') ? parseFloat(formData.get('puht') as string) : null;
    const clientId = formData.get('clientId') as string;
    const commandesWithVariants = JSON.parse(formData.get('commandesWithVariants') as string || '[]');
    const files = formData.getAll('files') as File[];

    console.log('Form data received:', { name, clientId, files: files.length });

    // Handle file uploads to S3
    const filePaths = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME, // Use the exported constant
          Key: `client-models/${fileName}`,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(command);
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/client-models/${fileName}`;
      })
    );

    const combinedCommandes = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.map((c: any) => c.value).filter((v: string) => v.trim() !== '').join(',')
      : commandes || '';

    const combinedVariants = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.flatMap((c: any) => c.variants.filter((v: any) => v.name.trim() !== ''))
      : [];

    const newModel = await prisma.clientModel.create({
      data: {
        name,
        description,
        commandes: combinedCommandes || null,
        commandesWithVariants: commandesWithVariants.length > 0 ? commandesWithVariants : [],
        lotto,
        ordine,
        puht,
        clientId,
        files: filePaths,
        variants: {
          create: combinedVariants.map((v: any) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante.toString()) : null,
          })),
        },
      },
      include: { variants: true, client: true },
    });

    console.log('Model created:', newModel);
    return NextResponse.json(newModel, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client model:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to update client model', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}