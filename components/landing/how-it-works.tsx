import { Card } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Sign Up & Create Profile",
    description: "Register as a student and complete your profile with your academic background and goals.",
  },
  {
    number: "02",
    title: "Take the Exam",
    description: "Answer questions across multiple domains: Aptitude, CS Concepts, Programming, and Problem Solving.",
  },
  {
    number: "03",
    title: "AI Analysis",
    description: "Our ML model analyzes your responses to identify your strengths and areas for improvement.",
  },
  {
    number: "04",
    title: "Get Your Report",
    description: "Receive a detailed report with personalized recommendations and learning resources.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Simple steps to discover your potential</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="p-6 h-full">
                <div className="text-4xl font-bold text-blue-600 mb-4 opacity-20">{step.number}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
