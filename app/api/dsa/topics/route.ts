import { NextResponse } from 'next/server'
import { DSA_TOPICS } from '@/lib/dsa-data'

export async function GET() {
  return NextResponse.json({ ok: true, topics: [{ key: 'random', label: 'Random' }, ...DSA_TOPICS] })
}
