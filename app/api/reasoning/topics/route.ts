import { NextResponse } from 'next/server'
import { RE_TOPICS } from '@/lib/reasoning-data'

export async function GET() {
  return NextResponse.json({ ok: true, topics: [{ key: 'random', label: 'Random' }, ...RE_TOPICS] })
}
