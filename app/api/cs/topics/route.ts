import { NextResponse } from 'next/server'
import { CS_TOPICS } from '@/lib/cs-data'

export async function GET() {
  return NextResponse.json({ ok: true, topics: [{ key: 'random', label: 'Random' }, ...CS_TOPICS] })
}
