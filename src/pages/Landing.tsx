import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { VantaBackground } from '../components/VantaBackground'

const smoothTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.7
}

export default function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Show loading screen for 3 seconds then go to dashboard
      const timer = setTimeout(() => {
        setIsLoading(false)
        navigate('/home')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [user, navigate])

  const handleGetStarted = async () => {
    try {
      const audio = new Audio('/uofthacks_st.mp3')
      audio.play().catch(error => {
        console.error('Audio playback failed:', error)
      })
    } catch (error) {
      console.error('Audio creation failed:', error)
    }
    
    await signInWithGoogle()
  }

  // Show loading screen if user is authenticated
  if (user && isLoading) {
    return (
      <VantaBackground>
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={smoothTransition}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-8">UW-Rizzlers</h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    y: [-10, 0, -10],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <p className="text-xl text-gray-300">Loading your campus events...</p>
          </motion.div>
        </div>
      </VantaBackground>
    )
  }

  return (
    <VantaBackground>
      <div className="flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
        <motion.div 
          layout
          transition={smoothTransition}
          className="flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={smoothTransition}
            className="text-6xl font-bold mb-8"
          >
            UW-Rizzlers 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: 0.3 }}
            className="text-xl text-gray-300 mb-8 text-center max-w-md"
          >
            Discover and create amazing campus events at University of Waterloo
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: 0.6 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </VantaBackground>
  )
}