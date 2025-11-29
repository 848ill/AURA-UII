import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Automated Workflows",
    description: "Create complex automation workflows with ease. Connect multiple services and automate repetitive tasks.",
  },
  {
    title: "Real-time Monitoring",
    description: "Monitor your automation in real-time. Get instant notifications and track all activities.",
  },
  {
    title: "Easy Integration",
    description: "Integrate with hundreds of services. Connect your favorite tools without writing code.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className={cn("container py-12 md:py-24")}>
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className={cn("font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl")}>
          Powerful Features
        </h2>
        <p className={cn("max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7")}>
          Everything you need to automate your operations and streamline your workflow.
        </p>
      </div>
      <div className={cn("mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-12")}>
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

