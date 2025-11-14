import { Card } from "@/components/ui/card"
import { Brain, BarChart3, Zap, Shield, Users, Lightbulb } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Machine learning algorithms analyze your exam responses to identify strengths and weaknesses in real-time.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Get comprehensive performance reports with actionable insights for improvement.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Receive immediate feedback on your answers with detailed explanations.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and protected with enterprise-grade security.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Separate admin and student dashboards for complete control and transparency.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Learning",
    description: "Get customized learning paths based on your performance and goals.",
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Powerful Features for Success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Everything you need to excel in your exams and beyond</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
