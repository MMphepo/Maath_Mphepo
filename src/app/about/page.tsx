import { Metadata } from 'next'
import AboutHero from '@/components/about/AboutHero'
import MissionPhilosophy from '@/components/about/MissionPhilosophy'
import JourneyTimeline from '@/components/about/JourneyTimeline'
import SkillsTechnologies from '@/components/about/SkillsTechnologies'
import CoreStrengths from '@/components/about/CoreStrengths'
import QuotesCarousel from '@/components/about/QuotesCarousel'
import HobbiesInterests from '@/components/about/HobbiesInterests'
import AboutCTAFooter from '@/components/about/AboutCTAFooter'

export const metadata: Metadata = {
  title: 'About Maath Mphepo - Backend Developer with Django & Laravel',
  description: 'Learn about Maath Mphepo, a professional backend developer specializing in Python, Django, Laravel, and scalable system architecture. Discover my journey, skills, and development philosophy.',
  keywords: 'Maath Mphepo, Backend Developer, Django, Laravel, Python, PHP, API Development, Database Design, Software Engineer',
  openGraph: {
    title: 'About Maath Mphepo - Backend Developer',
    description: 'Professional backend developer with expertise in Django, Laravel, and scalable system architecture.',
    type: 'profile',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Maath Mphepo - Backend Developer',
    description: 'Professional backend developer with expertise in Django, Laravel, and scalable system architecture.',
  }
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-dark-100 overflow-x-hidden">
      <AboutHero />
      <MissionPhilosophy />
      <JourneyTimeline />
      <SkillsTechnologies />
      <CoreStrengths />
      <QuotesCarousel />
      <HobbiesInterests />
      <AboutCTAFooter />
    </main>
  )
}
