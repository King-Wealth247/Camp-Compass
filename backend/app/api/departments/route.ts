import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get('institutionId');

    const where = institutionId ? { institutionId } : {};

    const departments = await prisma.department.findMany({
      where,
      include: {
        institution: true,
        mainCampus: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { institutionId, departmentName, mainCampusId } = body;

    if (!institutionId || !departmentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        institutionId,
        departmentName,
        mainCampusId,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
