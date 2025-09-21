import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingScreen } from '../components/LoadingScreen'
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees: number
  category: string
  image?: string
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Talk: AI in Healthcare',
    description: 'Join us for an insightful discussion about the future of AI in healthcare with industry experts.',
    date: '2025-01-20',
    time: '7:00 PM',
    location: 'DC 1350',
    attendees: 45,
    maxAttendees: 100,
    category: 'Tech'
  },
  {
    id: '2',
    title: 'Winter Social Mixer',
    description: 'Meet new people and enjoy hot chocolate while networking with fellow students.',
    date: '2025-01-22',
    time: '6:30 PM',
    location: 'SLC Great Hall',
    attendees: 78,
    maxAttendees: 150,
    category: 'Social'
  },
  {
    id: '3',
    title: 'Hackathon Prep Workshop',
    description: 'Get ready for upcoming hackathons with tips, tricks, and team formation.',
    date: '2025-01-25',
    time: '2:00 PM',
    location: 'E7 4053',
    attendees: 32,
    maxAttendees: 60,
    category: 'Workshop'
  },
  {
    id: '4',
    title: 'Game Night Extravaganza',
    description: 'Board games, video games, and pizza! Come hang out and have fun.',
    date: '2025-01-27',
    time: '8:00 PM',
    location: 'MC Comfy Lounge',
    attendees: 23,
    maxAttendees: 40,
    category: 'Gaming'
  }
]

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [events] = useState<Event[]>(mockEvents)

  if (loading) return <LoadingScreen />
  if (!user) {
    navigate('/')
    return null
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Tech': 'bg-blue-100 text-blue-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Workshop': 'bg-green-100 text-green-800',
      'Gaming': 'bg-purple-100 text-purple-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">UW-Rizzlers</h1>
              <span className="ml-2 text-2xl">🎉</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Button>
              
              <div className="relative">
                {user.picture && (
                  <img
                    src={user.picture}
                    width={40}
                    height={40}
                    alt="Profile"
                    className="rounded-full cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => setShowMenu(!showMenu)}
                  />
                )}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={handleProfile}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
          <p className="text-gray-600">Discover amazing events happening on campus</p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{event.date}</div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attendees}/{event.maxAttendees} attending
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                  <Button size="sm" className="whitespace-nowrap">
                    Join Event
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for when no events */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create an event for the community!</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}