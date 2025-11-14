import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600">AI-Powered Learning</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                True Potential
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Take intelligent exams that analyze your strengths and weaknesses. Get personalized insights powered by
              machine learning to accelerate your learning journey.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <Link href="/auth/signup" className="flex items-center gap-2">
                  Get Started <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Exams Available</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 lg:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl opacity-20 blur-3xl" />
            <div className="relative h-full rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 mb-4">
                  <Sparkles size={32} className="text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Interactive Exam Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
