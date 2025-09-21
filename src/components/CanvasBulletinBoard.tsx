import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Palette, Eye } from 'lucide-react'

interface PerspectiveCard {
  id: string
  x: number
  y: number
  title: string
  description: string
  color: string
  vibe: string
  isDragging?: boolean
}

export function CanvasBulletinBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cards, setCards] = useState<PerspectiveCard[]>([])
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showForm, setShowForm] = useState(false)
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    color: '#ff6b6b',
    vibe: ''
  })

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with dark background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw perspective cards
    cards.forEach(card => {
      // Card background with gradient
      const gradient = ctx.createLinearGradient(card.x - 80, card.y - 60, card.x + 80, card.y + 60)
      gradient.addColorStop(0, card.color)
      gradient.addColorStop(1, card.color + '80')
      
      ctx.fillStyle = gradient
      ctx.fillRect(card.x - 80, card.y - 60, 160, 120)
      
      // Card border
      ctx.strokeStyle = card.color
      ctx.lineWidth = 2
      ctx.strokeRect(card.x - 80, card.y - 60, 160, 120)
      
      // Card content
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      
      // Title (truncated if too long)
      const title = card.title.length > 15 ? card.title.substring(0, 15) + '...' : card.title
      ctx.fillText(title, card.x, card.y - 30)
      
      // Vibe
      ctx.font = '12px Arial'
      ctx.fillStyle = '#e0e0e0'
      const vibe = card.vibe.length > 20 ? card.vibe.substring(0, 20) + '...' : card.vibe
      ctx.fillText(vibe, card.x, card.y - 10)
      
      // Description (first line only)
      const desc = card.description.length > 25 ? card.description.substring(0, 25) + '...' : card.description
      ctx.fillText(desc, card.x, card.y + 10)
      
      // Perspective emoji
      ctx.font = '20px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('👁️', card.x, card.y + 35)
    })
  }, [cards])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    
    // Check if clicked on a card
    const clickedCard = cards.find(card => {
      return coords.x >= card.x - 80 && coords.x <= card.x + 80 &&
             coords.y >= card.y - 60 && coords.y <= card.y + 60
    })

    if (clickedCard) {
      setDraggedCard(clickedCard.id)
      setDragOffset({
        x: coords.x - clickedCard.x,
        y: coords.y - clickedCard.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedCard) return

    const coords = getCanvasCoordinates(e)
    setCards(prev => prev.map(card => 
      card.id === draggedCard 
        ? { ...card, x: coords.x - dragOffset.x, y: coords.y - dragOffset.y }
        : card
    ))
  }

  const handleMouseUp = () => {
    setDraggedCard(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const addCard = () => {
    if (!newCard.title.trim()) return

    const card: PerspectiveCard = {
      id: Date.now().toString(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      title: newCard.title,
      description: newCard.description,
      color: newCard.color,
      vibe: newCard.vibe
    }

    setCards(prev => [...prev, card])
    setNewCard({ title: '', description: '', color: '#ff6b6b', vibe: '' })
    setShowForm(false)
  }

  return (
    <div className="relative bg-transparent pt-10">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-full bg-purple-600 text-white
            hover:bg-purple-700 transition-all duration-200 shadow-lg mr-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Perspective
        </button>
        
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white animate-fade pt-4">
          Perceptr - Perspective Board 👁️
        </h1>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-cyan-400/30 shadow-xl shadow-cyan-400/10 cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border border-purple-400 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Create New Perspective
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Perspective Title</label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                  placeholder="Midnight Reflections"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Atmosphere Description</label>
                <input
                  type="text"
                  value={newCard.vibe}
                  onChange={(e) => setNewCard(prev => ({ ...prev, vibe: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                  placeholder="Contemplative, inspiring, transformative..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 h-20"
                  placeholder="How this perspective changes how you see the world..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Color Theme</label>
                <input
                  type="color"
                  value={newCard.color}
                  onChange={(e) => setNewCard(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-1 rounded bg-gray-800 border border-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addCard}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}