import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Users, BookOpen, Award } from 'lucide-react'

export const Landing = () => {
  // const { t } = useLanguage()

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Practice',
      description: 'Access a wide range of practice questions covering all IPMA Level C competencies',
    },
    {
      icon: Award,
      title: 'AI-Powered Evaluation',
      description: 'Get instant feedback and scoring based on key performance indicators',
    },
    {
      icon: Users,
      title: 'Role-Based Learning',
      description: 'Tailored experience for learners, trainers, and administrators',
    },
  ]

  const benefits = [
    'Interactive practice sessions with real-time feedback',
    'Comprehensive coverage of IPMA Level C competencies',
    'Progress tracking and performance analytics',
    'Multi-language support (English/Finnish)',
    'Mobile-responsive design for learning anywhere',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enterprise Theme */}
      <div className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block">IPMA Level C</span>
                <span className="block text-white opacity-90">Certification Prep</span>
              </h1>
              <p className="hero-subtext mt-6 max-w-3xl mx-auto">
                Master project management competencies with our comprehensive, AI-powered preparation platform. 
                Practice, learn, and succeed in your IPMA Level C certification journey.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="btn-primary inline-flex items-center text-lg px-8 py-4"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/auth"
                  className="btn-outline border-white text-white hover:bg-white hover:text-primary-800 inline-flex items-center text-lg px-8 py-4"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-primary-800" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Professional Certification</h3>
              <p className="text-xl text-gray-600">Project Management Excellence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enterprise Cards */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
              Our platform provides comprehensive tools and resources for IPMA Level C certification preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card-elevated text-center group hover:scale-105 transition-transform duration-200">
                  <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-200 transition-colors duration-200">
                    <Icon className="w-8 h-8 text-accent-800" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section - Enterprise List */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
              Why choose our platform?
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Enterprise Gradient */}
      <div className="hero-gradient">
        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Ready to start your certification journey?
          </h2>
          <p className="text-xl text-white opacity-90 mb-10 max-w-3xl mx-auto">
            Join thousands of professionals who have successfully prepared for their IPMA Level C certification with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="btn-primary bg-white text-accent-600 hover:bg-accent-50 inline-flex items-center text-lg px-8 py-4"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/auth"
              className="btn-outline border-white text-white hover:bg-white hover:text-accent-600 inline-flex items-center text-lg px-8 py-4"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
