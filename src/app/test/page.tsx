import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Test Page</h1>
          <p className="text-xl mt-4">If you can see this, Next.js is working!</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
