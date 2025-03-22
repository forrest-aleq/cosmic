import { CompanyProfileGenerator } from "@/components/company-profile-generator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="relative size-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700"></div>
              <div className="absolute inset-[2px] rounded-full bg-background"></div>
              <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-indigo-300 to-purple-500"></div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Cosmic</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <p className="text-muted-foreground max-w-3xl">
              Create synthetic company profiles and financial data for testing and development. Map your business
              constellations with precision and cosmic detail.
            </p>
          </div>
          <div className="text-sm text-muted-foreground mt-2 md:mt-0">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <CompanyProfileGenerator />
      </div>
    </main>
  )
}

