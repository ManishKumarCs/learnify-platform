import { NextResponse } from 'next/server'
import { APT_TOPICS } from '@/lib/aptitude-data'

export async function GET() {
  return NextResponse.json({ ok: true, topics: [{ key: 'random', label: 'Random' }, ...APT_TOPICS] })
}
