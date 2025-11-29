import { cn } from "@/lib/utils"

const logos = [
  { name: "Logo 1", src: "/logos/logo1.svg" },
  { name: "Logo 2", src: "/logos/logo2.svg" },
  { name: "Logo 3", src: "/logos/logo3.svg" },
  { name: "Logo 4", src: "/logos/logo4.svg" },
  { name: "Logo 5", src: "/logos/logo5.svg" },
  { name: "Logo 6", src: "/logos/logo6.svg" },
]

// Duplicate logos for seamless loop
const duplicatedLogos = [...logos, ...logos]

export function MarqueeLogo() {
  return (
    <section className={cn("py-12 border-y")}>
      <div className="container">
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className={cn("flex animate-marquee whitespace-nowrap")}>
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`first-${index}`}
                className={cn("flex items-center justify-center mx-8 w-32 h-16 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all")}
              >
                <div className={cn("w-full h-full bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground")}>
                  {logo.name}
                </div>
              </div>
            ))}
          </div>
          <div className={cn("flex animate-marquee whitespace-nowrap absolute left-full")} aria-hidden="true">
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`second-${index}`}
                className={cn("flex items-center justify-center mx-8 w-32 h-16 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all")}
              >
                <div className={cn("w-full h-full bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground")}>
                  {logo.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

