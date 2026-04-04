import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, Shield, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MediCare HMS</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-50 -z-10" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-blue-50/50 rounded-l-[100px] -z-10 hidden lg:block" />
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                  Next-generation Healthcare
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                  Manage your hospital with <span className="text-primary">absolute precision.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                  MediCare HMS provides an enterprise-grade, integrated dashboard for patient records, scheduling, and billing. Built for professionals who demand clarity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login">
                    <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-lg shadow-primary/20 group">
                      Access Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-slate-200">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mx-auto w-full max-w-[600px] lg:max-w-none shadow-2xl rounded-2xl border border-slate-200/60 overflow-hidden bg-white"
              >
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative">
                  {/* Mockup UI representation */}
                  <div className="absolute inset-0 bg-slate-900 p-2 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg flex overflow-hidden">
                      <div className="w-1/4 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
                        <div className="h-8 bg-blue-500/20 rounded w-full" />
                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-800 rounded w-5/6" />
                        <div className="h-4 bg-slate-800 rounded w-2/3" />
                      </div>
                      <div className="flex-1 p-6 flex flex-col gap-6">
                        <div className="h-8 bg-slate-100 rounded w-1/3" />
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-blue-50 rounded-xl border border-blue-100" />
                          <div className="h-24 bg-slate-50 rounded-xl border border-slate-100" />
                          <div className="h-24 bg-slate-50 rounded-xl border border-slate-100" />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise features, elegant design</h2>
              <p className="text-lg text-slate-600">Everything you need to run a modern healthcare facility efficiently and securely.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Patient Management",
                  description: "Complete health records, medical history, and demographics instantly accessible when you need them."
                },
                {
                  icon: Clock,
                  title: "Smart Scheduling",
                  description: "Conflict-free appointment booking, doctor availability tracking, and automated status updates."
                },
                {
                  icon: Shield,
                  title: "Secure Data",
                  description: "Role-based access control ensures doctors, patients, and admins only see what they should."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
                  }}
                  className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-blue-900/20 blur-3xl rounded-full -z-10" />
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to transform your practice?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who trust MediCare HMS for their daily operations.
            </p>
            <Link href="/login">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30">
                Sign in to Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-slate-900">MediCare HMS</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 MediCare Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
