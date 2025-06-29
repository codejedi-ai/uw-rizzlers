import { useState, useEffect } from 'preact/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { route } from 'preact-router'
import { VantaBackground } from '../components/VantaBackground'

const smoothTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.7
}

export default function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (user) {
      route('/survey')
      return
    }

    const timer1 = setTimeout(() => setStage(1), 2000)
    const timer2 = setTimeout(() => setStage(2), 4000)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [user])

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

  return (
    <VantaBackground>
      <div className="flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
        <motion.div 
          layout
          transition={smoothTransition}
          className="flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.h1
                key="hello"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={smoothTransition}
                className="text-5xl font-bold mb-8"
              >
                Hi there :)
              </motion.h1>
            )}
            {stage >= 1 && (
              <motion.h1
                key="perceptr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...smoothTransition,
                  delay: stage === 1 ? 0.3 : 0
                }}
                className="text-6xl font-bold mb-8"
              >
                <div className='flex flex-col items-center gap-8'>
                  Perceptr
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-6 py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={handleGetStarted}
                  >
                    Let's get started
                  </Button>
                </div>
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </VantaBackground>
  )
}