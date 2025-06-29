import { useState, useEffect } from 'preact/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ArrowLeft, ArrowRight } from 'lucide-preact'
import { useAuth } from '../contexts/AuthContext'
import { route } from 'preact-router'
import { LoadingScreen } from '../components/LoadingScreen'
import { VantaBackground } from '../components/VantaBackground'

const questions = [
  {
    id: 1,
    question: "Tell me about yourself.",
    maxWords: 500
  },
  {
    id: 2,
    question: "What are some key aspects of your culture or upbringing that shaped your perspective?",
    maxWords: 500
  },
  {
    id: 3,
    question: "What hobbies, interests, or passions do you have that influence how you see the world?",
    maxWords: 500
  },
  {
    id: 4,
    question: "Have you ever had an experience that changed the way you view life or people around you?",
    maxWords: 500
  },
  {
    id: 5,
    question: "What is your greatest accomplishment?",
    maxWords: 500
  },
  {
    id: 6,
    question: "Share your social media handles.",
    maxWords: 50,
    isSocialMedia: true
  }
]

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 300
    }
  },
  tap: {
    scale: 0.95
  }
}

const textareaVariants = {
  hover: {
    scale: 1.01,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 300
    }
  }
}

export default function Survey() {
  const { user, loading, signOut } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [direction, setDirection] = useState(0)
  const [showLogout, setShowLogout] = useState(false)
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    discord: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return

      try {
        const response = await fetch(`https://7503-199-7-156-226.ngrok-free.app/find_document?userId=${user.uid}`)
        const data = await response.json()
        
        if (data.exists && Object.keys(data.results).length !== 0) { 
          route('/home')
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    if (!loading) {
      checkUser()
    }
  }, [user, loading])

  if (loading) return <LoadingScreen />
  if (!user) {
    route('/')
    return null
  }

  const handleLogout = async () => {
    await signOut()
    route('/')
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1)
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1)
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }))
  }

  const handleSocialMediaChange = (field: 'instagram' | 'discord', value: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      const fullText = questions.map((q, index) => {
        if (index === 5) return ''
        return `Question: ${q.question} Answer: ${answers[index] || ''}`
      }).filter(text => text).join(' ')

      const formData = {
        user_id: user.uid,
        name: user.displayName,
        email: user.email,
        text: fullText,
        social1: `https://www.instagram.com/${socialMedia.instagram}`,
        social2: socialMedia.discord
      }

      const response = await fetch('https://7503-199-7-156-226.ngrok-free.app/add_document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit survey')
      }

      route('/home')

    } catch (error) {
      console.error('Error submitting survey:', error)
    }
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const currentAnswer = answers[currentQuestion] || ''
  const wordCount = countWords(currentAnswer)
  const isOverLimit = wordCount > questions[currentQuestion].maxWords

  return (
    <VantaBackground>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    width={60}
                    height={60}
                    alt="Profile"
                    className="rounded-full cursor-pointer"
                    onClick={() => setShowLogout(!showLogout)}
                  />
                )}
                {showLogout && (
                  <Button
                    variant="outline"
                    className="absolute mt-1 left-0 right-0 z-10 shadow-lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome, {user.displayName}!</h1>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-white bg-opacity-80 rounded-lg shadow-lg p-6 md:p-8 backdrop-blur-sm">
          <div className="mb-8">
            <div className="h-1 w-full bg-gray-200 rounded-full">
              <div 
                className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {questions[currentQuestion].question}
              </h2>

              {currentQuestion === 5 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Instagram</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">instagram.com/</span>
                      <input
                        type="text"
                        value={socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange('instagram', (e.target as HTMLInputElement).value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg 
                        focus:ring-2 focus:ring-blue-100 focus:border-blue-400 
                        outline-none transition-all duration-200 text-gray-700"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Discord ID</label>
                    <input
                      type="text"
                      value={socialMedia.discord}
                      onChange={(e) => handleSocialMediaChange('discord', (e.target as HTMLInputElement).value)}
                      className="w-full p-2 border border-gray-200 rounded-lg 
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400 
                      outline-none transition-all duration-200 text-gray-700"
                      placeholder="username#0000"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={textareaVariants}
                    whileHover="hover"
                    className="relative"
                  >
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => handleAnswerChange((e.target as HTMLTextAreaElement).value)}
                      placeholder="Type your answer here..."
                      className="min-h-[200px] resize-none"
                    />
                  </motion.div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                      {wordCount} / {questions[currentQuestion].maxWords} words
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
                disabled={isOverLimit}
                className="transition-colors duration-200"
              >
                {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </VantaBackground>
  )
}