import { MessageCircle } from 'lucide-preact'
import { route } from 'preact-router'

export function ChatButton() {
  const handleClick = () => {
    route('/chat')
  }

  return (
    <button 
      onClick={handleClick}
      className="fixed bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 transition-colors duration-200"
      aria-label="Go to Chatroom"
    >
      <MessageCircle className="w-6 h-6 text-black" />
    </button>
  )
}