import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { name, poste } = await request.json();
  if (!name || !poste) {
    return NextResponse.json({ error: 'Name and poste are required' }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.create({
      data: { name, poste },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  try {
    await prisma.employee.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, poste } = await request.json();
  if (!id || !name || !poste) {
    return NextResponse.json({ error: 'ID, name, and poste are required' }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { name, poste },
    });
    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}