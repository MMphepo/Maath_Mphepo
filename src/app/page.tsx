'use client'

import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import QuickHighlights from '@/components/QuickHighlights'
import FeaturedProjects from '@/components/FeaturedProjects'
import MiniBio from '@/components/MiniBio'
import TechStack from '@/components/TechStack'
import Testimonial from '@/components/Testimonial'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-100 overflow-x-hidden">
      <Navigation />
      <Hero />
      <QuickHighlights />
      <FeaturedProjects />
      <MiniBio />
      <TechStack />
      <Testimonial />
      <CTABanner />
      <Footer />
    </main>
  )
}
