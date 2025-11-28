import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who have discovered their true potential with e-learnify.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            <Link href="/auth/signup" className="flex items-center gap-2">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
