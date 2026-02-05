import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

        <div className="glass p-12 rounded-3xl max-w-4xl w-full border border-white/30 dark:border-white/10 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            CivicConnect
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-muted-foreground leading-relaxed">
            Empowering citizens and officers to build better communities together.
            <span className="block mt-2 font-medium text-foreground">Report. Track. Resolve.</span>
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            <Link
              href="/dashboard/citizen"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-primary/50 transition-all hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10">Report an Issue</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-primary/20 text-foreground rounded-full font-bold text-lg hover:bg-white/30 transition-all hover:-translate-y-1"
            >
              Officer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📢"
            title="Report Instantly"
            desc="Easily file complaints about potholes, sanitation, lighting, and more with a simple form."
          />
          <FeatureCard
            icon="👀"
            title="Track Status"
            desc="Get real-time updates as officers review, assign, and resolve your complaints."
          />
          <FeatureCard
            icon="✅"
            title="Verified Resolution"
            desc="Transparency at every step. See proof of work before a ticket is closed."
          />
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground text-sm glass border-t border-border">
        &copy; {new Date().getFullYear()} Municipality Complaint System. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 hover:border-primary/50 transition-colors group">
      <div className="text-5xl mb-6 bg-primary/10 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  )
}
