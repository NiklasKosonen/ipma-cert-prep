import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Shield, 
  Star,
  ChevronDown,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Youtube
} from 'lucide-react'

export const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    consent: false
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Practice',
      description: 'Access a wide range of practice questions covering all IPMA Level C competencies with AI-powered evaluation.',
      highlight: '500+ Questions'
    },
    {
      icon: Award,
      title: 'AI-Powered Evaluation',
      description: 'Get instant feedback and scoring based on key performance indicators with detailed analytics.',
      highlight: 'Real-time Feedback'
    },
    {
      icon: Users,
      title: 'Role-Based Learning',
      description: 'Tailored experience for learners, trainers, and administrators with personalized dashboards.',
      highlight: 'Multi-Role Support'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Secure platform with company codes, data encryption, and compliance with industry standards.',
      highlight: 'SOC 2 Compliant'
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Company Setup',
      description: 'Get your company code and set up your team with secure access credentials.'
    },
    {
      step: '02',
      title: 'Practice & Learn',
      description: 'Access comprehensive practice questions and AI-powered evaluation for each competency.'
    },
    {
      step: '03',
      title: 'Track Progress',
      description: 'Monitor individual and team progress with detailed analytics and performance insights.'
    },
    {
      step: '04',
      title: 'Achieve Certification',
      description: 'Prepare confidently for your IPMA Level C certification with proven results.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      company: 'TechCorp Solutions',
      content: 'The AI-powered evaluation helped me identify my weak areas and focus my study time effectively. I passed on my first attempt!',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Senior Consultant',
      company: 'Global Consulting',
      content: 'Our team of 50+ project managers all used this platform. The results speak for themselves - 95% pass rate.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Training Director',
      company: 'Enterprise Learning',
      content: 'As a trainer, I love the detailed analytics. I can see exactly where each team member needs help.',
      rating: 5,
      avatar: 'ER'
    }
  ]

  const stats = [
    { number: '95%', label: 'Pass Rate', description: 'Average success rate for IPMA Level C certification' },
    { number: '10,000+', label: 'Professionals', description: 'Successfully prepared for certification' },
    { number: '50+', label: 'Companies', description: 'Trust our platform for team training' },
    { number: '24/7', label: 'Support', description: 'Always available when you need help' }
  ]

  const faqs = [
    {
      question: 'What is IPMA Level C certification?',
      answer: 'IPMA Level C is an internationally recognized project management certification that validates your competency in project management. It focuses on technical competencies, behavioral competencies, and contextual competencies.'
    },
    {
      question: 'How does the AI-powered evaluation work?',
      answer: 'Our AI system analyzes your answers against key performance indicators (KPIs) for each competency area. It provides instant feedback, identifies knowledge gaps, and suggests areas for improvement.'
    },
    {
      question: 'Can I use this platform for team training?',
      answer: 'Yes! Our platform supports company-wide training with role-based access, team analytics, and progress tracking. Administrators can monitor team performance and identify training needs.'
    },
    {
      question: 'What if I need help during my preparation?',
      answer: 'We provide 24/7 support through our help center, email support, and live chat. Our team of certified project managers is always ready to assist you.'
    },
    {
      question: 'Is my data secure on your platform?',
      answer: 'Absolutely. We use enterprise-grade security with data encryption, secure authentication, and compliance with international standards. Your data is protected and never shared with third parties.'
    },
    {
      question: 'How long does it take to prepare for the certification?',
      answer: 'Preparation time varies, but most professionals complete their preparation in 4-8 weeks with consistent practice. Our platform adapts to your pace and provides personalized study plans.'
    }
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required'
    }
    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    }
    if (!formData.consent) {
      errors.consent = 'You must agree to our privacy policy'
    }

    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      // Simulate form submission
      setIsFormSubmitted(true)
      setFormData({ name: '', email: '', message: '', consent: false })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">IPMA C AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#faq" className="text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/auth/company"
                className="btn-primary inline-flex items-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
                <a href="#faq" className="text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
                <Link
                  to="/auth/company"
                  className="btn-primary inline-flex items-center justify-center mt-4"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Master Project Management with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
                    AI-Powered Learning
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Prepare for your IPMA Level C certification with our comprehensive platform. 
                  Get instant feedback, track progress, and achieve success with AI-driven insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/company"
                  className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-4">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                  Free Trial Available
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-success-600 mr-2" />
                  Enterprise Security
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-600">IPMA C AI Platform</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Progress Overview</span>
                        <span className="text-sm text-success-600">85% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Practice Questions</span>
                          <BookOpen className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">247</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg Score</span>
                          <TrendingUp className="h-5 w-5 text-success-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">92%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and resources needed for IPMA Level C certification success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card-elevated group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin your certification journey with our simple 4-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="card text-center group hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                
                {/* Connector line for desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-accent-200 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by professionals worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful project managers who have achieved their IPMA Level C certification with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-elevated">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-primary-600">{testimonial.company}</div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our platform and IPMA Level C certification.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start your certification journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join thousands of professionals who have successfully prepared for their IPMA Level C certification with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/company"
              className="bg-white text-primary-600 hover:bg-gray-50 inline-flex items-center justify-center text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center justify-center text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">IPMA C AI</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering project management professionals with AI-powered learning and certification preparation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3" />
                  hello@ipmacai.com
                </li>
                <li className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3" />
                  San Francisco, CA
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Get in Touch</h3>
              
              {isFormSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">Thank you for your message!</h4>
                  <p className="text-gray-300">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
                          formErrors.name ? 'border-error-500' : 'border-gray-700'
                        }`}
                        placeholder="Your name"
                      />
                      {formErrors.name && <p className="text-error-400 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
                          formErrors.email ? 'border-error-500' : 'border-gray-700'
                        }`}
                        placeholder="your@email.com"
                      />
                      {formErrors.email && <p className="text-error-400 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
                        formErrors.message ? 'border-error-500' : 'border-gray-700'
                      }`}
                      placeholder="Tell us about your project management training needs..."
                    />
                    {formErrors.message && <p className="text-error-400 text-sm mt-1">{formErrors.message}</p>}
                  </div>
                  
                  <div>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 rounded border-gray-700 bg-gray-800 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-300">
                        I agree to the{' '}
                        <a href="#" className="text-primary-400 hover:text-primary-300 underline">
                          Privacy Policy
                        </a>{' '}
                        and consent to being contacted about my inquiry. *
                      </span>
                    </label>
                    {formErrors.consent && <p className="text-error-400 text-sm mt-1">{formErrors.consent}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 IPMA C AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}