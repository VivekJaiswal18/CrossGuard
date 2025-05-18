import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = searchParams.get('chain');
  if (!chain) {
    return NextResponse.json({ error: 'Missing chain param' }, { status: 400 });
  }
  try {
    const { data } = await axios.get(`https://price-api.mayan.finance/v3/tokens?chain=${chain}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
} 