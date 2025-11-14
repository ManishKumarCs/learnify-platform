"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Camera, Monitor, Eye, Lock } from "lucide-react"

interface ProctoredExam {
  id: string
  title: string
  duration: number
  questions: number
  status: "scheduled" | "in-progress" | "completed"
  startTime?: string
  endTime?: string
  score?: number
}

export default function ProctoredExamPage() {
  const [exams, setExams] = useState<ProctoredExam[]>([
    {
      id: "1",
      title: "Advanced Data Structures - Proctored",
      duration: 120,
      questions: 50,
      status: "scheduled",
      startTime: "2024-04-15 10:00 AM",
    },
    {
      id: "2",
      title: "Algorithms Mastery - Proctored",
      duration: 90,
      questions: 40,
      status: "completed",
      startTime: "2024-04-10 02:00 PM",
      endTime: "2024-04-10 03:30 PM",
      score: 87,
    },
  ])

  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [screenMonitoring, setScreenMonitoring] = useState(false)
  const [selectedExam, setSelectedExam] = useState<ProctoredExam | null>(null)

  const handleStartExam = (exam: ProctoredExam) => {
    if (!cameraEnabled || !screenMonitoring) {
      alert("Please enable camera and screen monitoring to start the exam")
      return
    }
    setSelectedExam(exam)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Proctored Exams</h1>
        <p className="text-muted-foreground">Secure exam environment with AI proctoring and monitoring</p>
      </div>

      {/* Security Setup */}
      <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
            <AlertTriangle className="h-5 w-5" />
            Exam Security Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              For a secure exam experience, please enable camera and screen monitoring. Your exam will be monitored for
              suspicious activity.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera Setup */}
            <div className="p-4 border-2 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Webcam</h3>
              </div>
              <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                {cameraEnabled ? (
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-green-600 dark:text-green-400">Camera Active</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Camera Disabled</p>
                )}
              </div>
              <Button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                variant={cameraEnabled ? "default" : "outline"}
                className="w-full"
              >
                {cameraEnabled ? "Disable Camera" : "Enable Camera"}
              </Button>
            </div>

            {/* Screen Monitoring */}
            <div className="p-4 border-2 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Screen Monitoring</h3>
              </div>
              <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                {screenMonitoring ? (
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-green-600 dark:text-green-400">Monitoring Active</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Monitoring Disabled</p>
                )}
              </div>
              <Button
                onClick={() => setScreenMonitoring(!screenMonitoring)}
                variant={screenMonitoring ? "default" : "outline"}
                className="w-full"
              >
                {screenMonitoring ? "Disable Monitoring" : "Enable Monitoring"}
              </Button>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
            <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
              <Eye className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs font-semibold">Face Detection</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
              <Monitor className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs font-semibold">Tab Switching</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
              <Lock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs font-semibold">Copy Protection</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs font-semibold">Anomaly Detection</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Proctored Exams</h2>
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                    <Badge
                      variant={
                        exam.status === "completed"
                          ? "default"
                          : exam.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Duration: {exam.duration} minutes</span>
                    <span>Questions: {exam.questions}</span>
                    {exam.startTime && <span>Scheduled: {exam.startTime}</span>}
                  </div>
                  {exam.score !== undefined && (
                    <div className="pt-2">
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Score: {exam.score}%</Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {exam.status === "scheduled" && (
                    <Button
                      onClick={() => handleStartExam(exam)}
                      disabled={!cameraEnabled || !screenMonitoring}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Start Exam
                    </Button>
                  )}
                  {exam.status === "completed" && <Button variant="outline">View Results</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
