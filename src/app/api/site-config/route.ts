import { NextResponse } from 'next/server';
import { getConfigFromStore, saveConfigToStore } from '@/lib/fake-builder-store';
import { SiteConfig } from '@/lib/builder-types';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const config = await getConfigFromStore();
  await delay();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as SiteConfig;
  const saved = await saveConfigToStore(body);
  await delay();
  return NextResponse.json(saved);
}


