import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEvent = await prisma.event.create({
      data: {
        description: body.description,
        date: new Date(body.date),
      },
    });
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedEvent = await prisma.event.update({
      where: { id: Number(body.id) },
      data: {
        date: new Date(body.date),
      },
    });
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.event.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}