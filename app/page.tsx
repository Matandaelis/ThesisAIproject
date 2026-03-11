import Link from 'next/link';
import { ArrowRight, CheckCircle2, BookOpen, Sparkles, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-2xl text-indigo-600 tracking-tight">ThesisAI</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Sign In</Link>
            <Link href="/dashboard" className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="py-16 sm:py-24 px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            The Ultimate Academic Writing PaaS
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-neutral-900 tracking-tight mb-6 sm:mb-8 leading-tight">
            Write your thesis <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">faster & better</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            AI-powered academic writing platform tailored for Kenyan universities. Features real-time collaboration, automated citations, and intelligent feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              Start Writing for Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white text-neutral-900 border border-neutral-200 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-neutral-50 transition-colors flex items-center justify-center">
              View Features
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 sm:py-24 bg-neutral-50 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4">Everything you need to succeed</h2>
              <p className="text-neutral-500 max-w-2xl mx-auto text-sm sm:text-base">Built specifically for academic research and thesis writing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: 'University Templates',
                  description: 'Pre-configured templates for Kenyatta, KEMU, MKU, and Laikipia universities.',
                  icon: BookOpen,
                },
                {
                  title: 'Smart Citations',
                  description: 'Seamless integration with Semantic Scholar, Mendeley, and Zotero.',
                  icon: CheckCircle2,
                },
                {
                  title: 'Real-time Collaboration',
                  description: 'Work with your supervisor or peers in real-time with built-in comments.',
                  icon: Users,
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
