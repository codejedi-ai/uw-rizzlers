import { useState } from 'react'
import { VantaBackground } from '../components/VantaBackground'

interface Message {
  id: number
  room: string
  sender: string
  content: string
}

const rooms = ['Perspective Chat', 'Vibe Analysis', 'Experience Discussion', 'Event Planning']
const mockMessages = [
  { id: 1, room: 'Perspective Chat', sender: 'ViewSeeker', content: 'This experience completely changed how I see rainy days! 🌧️' },
  { id: 2, room: 'Perspective Chat', sender: 'PerspectiveCurator', content: 'Tell us more! I love discovering new perspectives' },
  { id: 3, room: 'Event Planning', sender: 'AtmosphereHost', content: 'Creating a "midnight reflections" gathering, need atmosphere ideas!' },
  { id: 4, room: 'Vibe Analysis', sender: 'VibeAnalyst', content: 'Anyone analyzed how different environments change your perspective?' },
]

function RoomSelector({ rooms, currentRoom, onRoomChange }: {
  rooms: string[]
  currentRoom: string
  onRoomChange: (room: string) => void
}) {
  return (
    <div className="flex space-x-2 mb-4">
      {rooms.map((room) => (
        <button
          key={room}
          onClick={() => onRoomChange(room)}
          className={`px-4 py-2 rounded-full text-sm ${
            currentRoom === room
              ? 'bg-white text-gray-900'
              : 'bg-gray-700 bg-opacity-50 hover:bg-opacity-75'
          }`}
        >
          {room}
        </button>
      ))}
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className="mb-4">
      <div className="font-bold text-gray-300">{message.sender}</div>
      <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg mt-1">{message.content}</div>
    </div>
  )
}

function MessageInput({ onSendMessage }: { onSendMessage: (content: string) => void }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage((e.target as HTMLInputElement).value)}
        className="flex-grow bg-gray-700 bg-opacity-50 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="bg-white text-gray-900 rounded-full px-6 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Send
      </button>
    </form>
  )
}

export default function Chat() {
  const [currentRoom, setCurrentRoom] = useState(rooms[0])
  const [messages, setMessages] = useState(mockMessages)

  const filteredMessages = messages.filter(msg => msg.room === currentRoom)

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: messages.length + 1,
      room: currentRoom,
      sender: 'You',
      content,
    }
    setMessages([...messages, newMessage])
  }

  return (
    <VantaBackground>
      <div className="flex flex-col h-screen text-white p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <RoomSelector rooms={rooms} currentRoom={currentRoom} onRoomChange={setCurrentRoom} />
        <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
          {filteredMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </VantaBackground>
  )
}