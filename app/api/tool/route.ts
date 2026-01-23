import { NextRequest, NextResponse } from 'next/server';
import { executeTool } from '@/lib/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolName, args } = body;

    if (!toolName || !args) {
      return NextResponse.json(
        { error: 'Missing toolName or args' },
        { status: 400 }
      );
    }

    const result = await executeTool(toolName, args);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
