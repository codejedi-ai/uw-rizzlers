import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="flex items-center justify-center space-x-3 mb-4 pr-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-cyan-500 rounded-full"
              animate={{
                y: [-6, 0, -6],
                scale: [1, 1.2, 1],
                backgroundColor: ['#06b6d4', '#22d3ee', '#06b6d4'],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="text-cyan-500 font-medium text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading...
          </motion.div>
          <div className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
            Please wait while we prepare your experience
          </div>
        </motion.div>
      </div>
    </div>
  )
}