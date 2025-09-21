import { useState, useRef, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  pinColor: string;
}

export default function MainApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'React Workshop',
      description: 'Learn the fundamentals of React development with hands-on coding exercises.',
      date: '2024-03-15',
      time: '2:00 PM',
      location: 'CSE Building Room 303',
      category: 'Tech',
      attendees: 15,
      maxAttendees: 30,
      x: 150,
      y: 120,
      color: '#FFE4B5',
      rotation: -2,
      pinColor: '#FF6B6B'
    },
    {
      id: '2',
      title: 'Coffee & Code',
      description: 'Casual meetup for developers to network and share experiences.',
      date: '2024-03-18',
      time: '10:00 AM',
      location: 'HUB Starbucks',
      category: 'Social',
      attendees: 8,
      maxAttendees: 12,
      x: 400,
      y: 200,
      color: '#E6F3FF',
      rotation: 1.5,
      pinColor: '#4ECDC4'
    },
    {
      id: '3',
      title: 'AI/ML Symposium',
      description: 'Explore the latest trends in artificial intelligence and machine learning.',
      date: '2024-03-22',
      time: '1:00 PM',
      location: 'Kane Hall 130',
      category: 'Workshop',
      attendees: 25,
      maxAttendees: 50,
      x: 300,
      y: 350,
      color: '#F0FFF0',
      rotation: -1,
      pinColor: '#45B7D1'
    },
    {
      id: '4',
      title: 'Study Group',
      description: 'Weekly study session for CSE 142 students.',
      date: '2024-03-20',
      time: '7:00 PM',
      location: 'Odegaard Library',
      category: 'Academic',
      attendees: 6,
      maxAttendees: 10,
      x: 600,
      y: 150,
      color: '#FFF0F5',
      rotation: 2,
      pinColor: '#96CEB4'
    }
  ];

  useEffect(() => {
    draw();
  }, [events, selectedEvent]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;

    // Clear canvas with cork board background
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cork texture
    ctx.fillStyle = '#C19A6B';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw wood grain lines
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = (canvas.height / 8) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw events
    events.forEach(event => {
      drawPaperNote(ctx, event);
    });
  };

  const drawPaperNote = (ctx: CanvasRenderingContext2D, event: Event) => {
    const width = 220;
    const height = 160;
    
    ctx.save();
    ctx.translate(event.x + width/2, event.y + height/2);
    ctx.rotate((event.rotation * Math.PI) / 180);
    ctx.translate(-width/2, -height/2);

    // Draw paper shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(3, 3, width, height);

    // Draw paper background
    ctx.fillStyle = event.color;
    ctx.fillRect(0, 0, width, height);

    // Draw paper border
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Draw lined paper effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 20; i < height - 20; i += 15) {
      ctx.beginPath();
      ctx.moveTo(10, i);
      ctx.lineTo(width - 10, i);
      ctx.stroke();
    }

    // Draw red margin line
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, 10);
    ctx.lineTo(25, height - 10);
    ctx.stroke();

    // Draw handwritten-style text
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 16px "Comic Sans MS", cursive';
    ctx.fillText(event.title, 30, 35);
    
    ctx.font = '12px "Comic Sans MS", cursive';
    const descLines = wrapText(ctx, event.description, width - 40);
    descLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, 30, 55 + i * 15);
    });
    
    ctx.font = '11px "Comic Sans MS", cursive';
    ctx.fillText(`📅 ${event.date}`, 30, 95);
    ctx.fillText(`🕐 ${event.time}`, 30, 110);
    ctx.fillText(`📍 ${event.location}`, 30, 125);
    ctx.fillText(`👥 ${event.attendees}/${event.maxAttendees} people`, 30, 140);

    ctx.restore();

    // Draw push pin
    drawPushPin(ctx, event.x + width/2, event.y - 10, event.pinColor);
  };

  const drawPushPin = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    // Pin shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pin body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pin highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pin needle
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 15);
    ctx.stroke();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const getEventAt = (x: number, y: number): Event | null => {
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (x >= event.x && x <= event.x + 200 && y >= event.y && y <= event.y + 150) {
        return event;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const event = getEventAt(x, y);
    if (event) {
      setSelectedEvent(event);
      setIsDragging(true);
      setDraggedEvent(event);
      setDragOffset({
        x: x - event.x,
        y: y - event.y
      });
    } else {
      setSelectedEvent(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedEvent) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update event position
    const updatedEvents = events.map(event => 
      event.id === draggedEvent.id 
        ? { ...event, x: x - dragOffset.x, y: y - dragOffset.y }
        : event
    );
    
    draw();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedEvent(null);
  };

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#8B4513',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#654321',
        color: '#F5DEB3',
        padding: '15px 20px',
        borderBottom: '3px solid #8B4513',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '32px' }}>📌</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold',
            fontFamily: '"Comic Sans MS", cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            UW-Rizzlers
          </h1>
          <span style={{
            backgroundColor: '#FF6B6B',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontFamily: '"Comic Sans MS", cursive',
            transform: 'rotate(-2deg)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Community Board
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: '"Comic Sans MS", cursive',
              transform: 'rotate(1deg)',
              boxShadow: '3px 3px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(1deg) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(1deg) scale(1)'}
          >
            📝 Post Event
          </button>
          
          <div style={{
            backgroundColor: '#DEB887',
            color: '#654321',
            padding: '8px 15px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '2px solid #CD853F'
          }}>
            <span style={{ fontSize: '20px' }}>🎓</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              fontFamily: '"Comic Sans MS", cursive'
            }}>
              UW Student
            </span>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#D2B48C'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Sidebar */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '300px',
          backgroundColor: '#FFF8DC',
          color: '#654321',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '5px 5px 15px rgba(0,0,0,0.3)',
          border: '3px solid #DEB887',
          transform: 'rotate(-1deg)',
          maxHeight: '70vh',
          overflowY: 'auto',
          fontFamily: '"Comic Sans MS", cursive'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '22px', 
              fontWeight: 'bold',
              color: '#8B4513'
            }}>
              {selectedEvent.title}
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                backgroundColor: '#FF6B6B',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '50%',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#FFE4B5',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '15px',
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#8B4513',
            border: '2px solid #DEB887'
          }}>
            {selectedEvent.category}
          </div>
          
          <p style={{ 
            marginBottom: '15px', 
            lineHeight: '1.6', 
            color: '#654321',
            fontSize: '14px'
          }}>
            {selectedEvent.description}
          </p>
          
          <div style={{ marginBottom: '20px', color: '#8B4513' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span>
              <span style={{ fontWeight: 'bold' }}>{selectedEvent.date}</span>
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🕐</span>
              <span style={{ fontWeight: 'bold' }}>{selectedEvent.time}</span>
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span style={{ fontWeight: 'bold' }}>{selectedEvent.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥</span>
              <span style={{ fontWeight: 'bold' }}>{selectedEvent.attendees}/{selectedEvent.maxAttendees} people</span>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', marginBottom: '5px', color: '#8B4513', fontWeight: 'bold' }}>
              Attendance: {Math.round((selectedEvent.attendees / selectedEvent.maxAttendees) * 100)}%
            </div>
            <div style={{
              backgroundColor: '#DEB887',
              height: '8px',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#FF6B6B',
                height: '100%',
                width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <button
            style={{
              backgroundColor: '#4ECDC4',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              width: '100%',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: '"Comic Sans MS", cursive',
              boxShadow: '3px 3px 6px rgba(0,0,0,0.2)',
              transform: 'rotate(0.5deg)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0.5deg) scale(1)'}
          >
            🎉 Join Event!
          </button>
        </div>
      )}

      {/* Add Event Form Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFF8DC',
            padding: '30px',
            borderRadius: '20px',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: '10px 10px 20px rgba(0,0,0,0.3)',
            border: '3px solid #DEB887',
            transform: 'rotate(-1deg)',
            fontFamily: '"Comic Sans MS", cursive'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#8B4513',
              fontSize: '24px',
              textAlign: 'center'
            }}>
              📝 Post New Event
            </h3>
            <p style={{ 
              color: '#654321', 
              textAlign: 'center', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Share your event with the UW community!
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                backgroundColor: '#FF6B6B',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: '"Comic Sans MS", cursive',
                width: '100%',
                fontSize: '16px',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.2)'
              }}
            >
              Close for Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}