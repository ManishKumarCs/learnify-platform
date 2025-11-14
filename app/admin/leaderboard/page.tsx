"use client"

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminLeaderboardPage() {
  const { data, error, isLoading } = useSWR('/api/leaderboard?limit=200', fetcher)

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard (Real Exams)</CardTitle>
          <CardDescription>Admins can view all students ranked by average exam score.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Failed to load leaderboard</p>}
          {data?.ok && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Best</TableHead>
                    <TableHead className="text-right">Exams</TableHead>
                    <TableHead>Last Submission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((r: any) => (
                    <TableRow key={r.userId}>
                      <TableCell>{r.rank}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="text-right">{r.avgScore}%</TableCell>
                      <TableCell className="text-right">{r.bestScore}%</TableCell>
                      <TableCell className="text-right">{r.examsCount}</TableCell>
                      <TableCell>{r.latestSubmitted ? new Date(r.latestSubmitted).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
