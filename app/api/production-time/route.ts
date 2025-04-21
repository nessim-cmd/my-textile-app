import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const entries = await prisma.productionTimeEntry.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching production time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { employeeId, date, hours } = await request.json();
  if (!employeeId || !date || !hours) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const entry = await prisma.productionTimeEntry.create({
      data: {
        employeeId,
        date: new Date(date),
        hours, // JSON object like {"Duree": "8", "8:00-9:00": "1", "9:00-10:00": "0", ...}
      },
      include: { employee: true },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating production time entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}