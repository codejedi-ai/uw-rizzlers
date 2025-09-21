
import React, { useRef, useEffect, useState } from "react";
import { Event } from "./types/Event";
import { Paper } from "./shapes/Paper";
import AddItemForm from "./components/AddItemForm";
import DropdownMenu from "./components/DropdownMenu";
import { workerManager } from "./utils/workerManager";
import { deletionManager } from "./utils/deletionManager";

interface AppProps {
  onNavigate?: (path: string) => void;
}

export default function App({ onNavigate }: AppProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [activeEvent, setActiveEvent] = useState<Event | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [isDraggingEvent, setIsDraggingEvent] = useState(false);
    const [draggedEventIndex, setDraggedEventIndex] = useState(-1);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredButtonIndex, setHoveredButtonIndex] = useState(-1);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deletionStatus, setDeletionStatus] = useState<{ status: string; queueSize: number } | null>(null);


    // Load events from worker
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setIsLoading(true);
                const loadedEvents = await workerManager.fetchEvents();
                setEvents(loadedEvents);
                setPapers(loadedEvents.map(event => new Paper(event)));
            } catch (error) {
                console.error('Failed to load events:', error);
                // Fallback to empty state
                setEvents([]);
                setPapers([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();

        // Cleanup workers on unmount
        return () => {
            workerManager.destroy();
            deletionManager.destroy();
        };
    }, []);

    // Monitor deletion status with callbacks
    useEffect(() => {
        const handleDeletionUpdate = (response: any) => {
            if (response.type === 'BATCH_DELETION_SUCCESS' || response.type === 'STATUS_UPDATE') {
                if (response.payload) {
                    setDeletionStatus({
                        status: response.payload.status || 'idle',
                        queueSize: response.payload.queueSize || 0
                    });
                }
            }
        };

        // Add callback for real-time updates
        deletionManager.addCallback(handleDeletionUpdate);

        // Get initial status
        const getInitialStatus = async () => {
            if (deletionManager.isAvailable()) {
                try {
                    const status = await deletionManager.getStatus();
                    if (status) {
                        setDeletionStatus(status);
                    }
                } catch (error) {
                    // Silently handle timeout errors
                    if (error instanceof Error && !error.message.includes('timeout')) {
                        console.error('Failed to get initial deletion status:', error);
                    }
                }
            }
        };

        getInitialStatus();

        return () => {
            deletionManager.removeCallback(handleDeletionUpdate);
        };
    }, []);

    // Setup canvas and animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match container (with small margin)
        const updateCanvasSize = () => {
            canvas.width = window.innerWidth - 4;
            canvas.height = window.innerHeight - (screenWidth < 768 ? 60 : 70);
        };
        
        updateCanvasSize();

        // Draw function to continuously update the canvas
        const draw = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Save context for panning
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            
            // Draw white bulletin board background (infinite)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(-10000, -10000, 20000, 20000); // Cover entire infinite area
            
            // Add infinite grid pattern across entire canvas
            ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
            ctx.lineWidth = 1;
            const gridSize = 50;
            
            // Draw vertical lines across entire infinite area
            for (let x = -10000; x < 10000; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, -10000);
                ctx.lineTo(x, 10000);
                ctx.stroke();
            }
            
            // Draw horizontal lines across entire infinite area
            for (let y = -10000; y < 10000; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(-10000, y);
                ctx.lineTo(10000, y);
                ctx.stroke();
            }

            // Draw all papers (which now include push pins)
            papers.forEach((paper) => paper.draw(ctx));

            
            // Restore context
            ctx.restore();

            requestAnimationFrame(draw);
        };

        // Start the draw loop
        const animationId = requestAnimationFrame(draw);

        // Event handlers for panning, dragging events, and clicking
        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const adjustedMouseX = mouseX - panOffset.x;
            const adjustedMouseY = mouseY - panOffset.y;

            // Check if clicking on an event (paper or push pin)
            let clickedOnEvent = false;
            for (let i = events.length - 1; i >= 0; i--) {
                const event = events[i];
                const paper = papers[i];
                
                const isClickOnPaper = paper.hitTest(adjustedMouseX, adjustedMouseY);
                const isClickOnPushPin = paper.isClickOnPushPin(adjustedMouseX, adjustedMouseY);
                const isClickOnLinkButton = paper.isClickOnLinkButton(adjustedMouseX, adjustedMouseY);

                if (isClickOnPaper || isClickOnPushPin || isClickOnLinkButton) {
                    if (isDeleteMode) {
                        // In delete mode - delete the paper
                        deleteEvent(i);
                        clickedOnEvent = true;
                        break;
                    } else if (isClickOnLinkButton && event.link) {
                        // Clicking on link button - open the link
                        window.open(event.link, '_blank');
                        clickedOnEvent = true;
                        break;
                    } else if (isClickOnPushPin) {
                        // Clicking on push pin - no special action needed
                        clickedOnEvent = true;
                        break;
                    } else {
                        // Clicking on paper starts dragging
                        setIsDraggingEvent(true);
                        setDraggedEventIndex(i);
                        setDragOffset({
                            x: adjustedMouseX - event.x,
                            y: adjustedMouseY - event.y
                        });
                        clickedOnEvent = true;
                        break;
                    }
                }
            }
            
            // If not clicking on an event, start panning
            if (!clickedOnEvent) {
                setIsPanning(true);
                setLastPanPoint({ x: mouseX, y: mouseY });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (isPanning) {
                const deltaX = mouseX - lastPanPoint.x;
                const deltaY = mouseY - lastPanPoint.y;
                
                setPanOffset(prev => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY
                }));
                
                setLastPanPoint({ x: mouseX, y: mouseY });
            } else if (isDraggingEvent && draggedEventIndex >= 0) {
                const adjustedMouseX = mouseX - panOffset.x;
                const adjustedMouseY = mouseY - panOffset.y;
                
                const newX = adjustedMouseX - dragOffset.x;
                const newY = adjustedMouseY - dragOffset.y;
                
                setEvents(prev => prev.map((event, i) => 
                    i === draggedEventIndex ? { ...event, x: newX, y: newY } : event
                ));
                setPapers(prev => prev.map((paper, i) => 
                    i === draggedEventIndex ? new Paper({ ...events[draggedEventIndex], x: newX, y: newY }) : paper
                ));
            } else {
                // Check for button hover
                const adjustedMouseX = mouseX - panOffset.x;
                const adjustedMouseY = mouseY - panOffset.y;
                
                let foundHover = false;
                for (let i = 0; i < papers.length; i++) {
                    const paper = papers[i];
                    if (paper.isClickOnLinkButton(adjustedMouseX, adjustedMouseY)) {
                        if (hoveredButtonIndex !== i) {
                            setHoveredButtonIndex(i);
                            // Update paper hover state
                            setPapers(prev => prev.map((p, idx) => {
                                if (idx === i) {
                                    p.isHoveringButton = true;
                                } else {
                                    p.isHoveringButton = false;
                                }
                                return p;
                            }));
                        }
                        foundHover = true;
                    break;
                    }
                }
                
                if (!foundHover && hoveredButtonIndex !== -1) {
                    setHoveredButtonIndex(-1);
                    // Clear all hover states
                    setPapers(prev => prev.map(paper => {
                        paper.isHoveringButton = false;
                        return paper;
                    }));
                }
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            setIsDraggingEvent(false);
            setDraggedEventIndex(-1);
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mouseleave", handleMouseUp);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mouseleave", handleMouseUp);
        };
    }, [events, papers, panOffset, isPanning, isDraggingEvent, draggedEventIndex, dragOffset]);

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            // Update canvas size on resize
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                canvas.width = window.innerWidth - 4;
                canvas.height = window.innerHeight - (window.innerWidth < 768 ? 60 : 70);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper function to get paper color based on day of week
    const getPaperColorByDay = (date: Date): string => {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayColors = [
            "#FFE4E1", // Sunday - Light Pink
            "#E6F3FF", // Monday - Light Blue
            "#F0FFF0", // Tuesday - Light Green
            "#FFF8DC", // Wednesday - Light Yellow
            "#F5F5DC", // Thursday - Beige
            "#F0E6FF", // Friday - Light Purple
            "#FFE4B5"  // Saturday - Moccasin
        ];
        return dayColors[dayOfWeek];
    };

    const addEvent = async (title: string, description: string, link: string = "", buttonColor: string = "#4CAF50", type: 'event' | 'community' = 'event', time?: string) => {
        try {
            // Calculate center of screen in world coordinates
            const screenCenterX = (window.innerWidth / 2) - panOffset.x;
            const screenCenterY = (window.innerHeight / 2) - panOffset.y;
            
            const now = new Date();
            const eventData = {
                title,
                description,
                link,
                x: screenCenterX,
                y: screenCenterY,
                color: getPaperColorByDay(now),
                buttonColor,
                type,
                time,
                createdAt: now
            };

            const newEvent = await workerManager.createEvent(eventData);
            setEvents(prev => [...prev, newEvent]);
            setPapers(prev => [...prev, new Paper(newEvent)]);
            console.log(`🎉 ${type} "${title}" added to bulletin board`);
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to create event:', error);
            // Still close the form even if creation fails
            setShowAddForm(false);
        }
    };

    const deleteEvent = async (index: number) => {
        try {
            const eventToDelete = events[index];
            if (eventToDelete) {
                console.log(`🗑️ Deleting ${eventToDelete.type}: "${eventToDelete.title}"`);
                // Remove from UI immediately for better UX
                setEvents(prev => prev.filter((_, i) => i !== index));
                setPapers(prev => prev.filter((_, i) => i !== index));
                
                // Queue for database deletion
                const deletionSuccess = await deletionManager.deleteEvent(eventToDelete.id);
                if (!deletionSuccess) {
                    console.warn(`⚠️ Failed to queue ${eventToDelete.type} "${eventToDelete.title}" for database deletion`);
                } else {
                    console.log(`✅ ${eventToDelete.type} "${eventToDelete.title}" queued for database deletion`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to delete event:', error);
        }
    };


    return (
        <div style={{ 
            margin: 0, 
            padding: 0, 
  
            overflow: "hidden",
            boxSizing: "border-box"
        }}>
            <header 
                style={{
                    position: "fixed", 
                    top: 0,
                    left: 0,
                    width: "100%",
                    background: "#000000",
                    color: "white",
                    padding: screenWidth < 768 ? "10px 0" : "15px 0",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
            >
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    width: "100%",
                    maxWidth: "100vw",
                    padding: screenWidth < 768 ? "0 10px" : "0 20px",
                    gap: screenWidth < 768 ? "5px" : "15px",
                    boxSizing: "border-box"
                }}>
                    {/* Left: Push Pin Icon */}
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        fontSize: screenWidth < 768 ? "18px" : "24px",
                        flexShrink: 0,
                        minWidth: screenWidth < 480 ? "30px" : "40px"
                    }}>
                        📌
                    </div>
                    
                    {/* Center: Title */}
                    <div style={{ 
                        flex: 1, 
                        textAlign: "center",
                        minWidth: 0, // Allow shrinking
                        overflow: "hidden",
                        padding: screenWidth < 480 ? "0 5px" : "0 10px"
                    }}>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: screenWidth < 480 ? "14px" : screenWidth < 768 ? "16px" : screenWidth < 1024 ? "20px" : "28px",
                            fontWeight: "bold",
                            letterSpacing: screenWidth < 768 ? "0.5px" : "1px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "white"
                        }}>
                            {screenWidth < 480 ? "Rizz Lords" : 
                             screenWidth < 768 ? "UW Rizz Lords" : 
                             "UW Rizz Lords Bulletin Board"}
                        </h1>
                    </div>
                    
                    {/* Right: Dropdown Menu */}
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        flexShrink: 0
                    }}>
                        <DropdownMenu
                            buttonIcon="⚙️"
                            buttonTitle="Menu - Add events and manage items"
                            items={[
                                {
                                    id: 'add',
                                    label: 'Add Event',
                                    icon: '+',
                                    action: () => setShowAddForm(true)
                                },
                                {
                                    id: 'delete',
                                    label: isDeleteMode ? 'Exit Delete Mode' : 'Delete Mode',
                                    icon: '🗑️',
                                    action: () => setIsDeleteMode(!isDeleteMode),
                                    variant: isDeleteMode ? 'danger' : 'default'
                                }
                            ]}
                        />
                    </div>
                </div>
            </header>
            
            <div style={{ 
                position: "fixed",
                top: screenWidth < 768 ? "50px" : "60px",
                left: 0,
                width: "100vw",
                height: `calc(100vh - ${screenWidth < 768 ? "60px" : "70px"})`,
                overflow: "hidden"
            }}>
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth - 4}
                    height={window.innerHeight - (screenWidth < 768 ? 60 : 70)}
                    style={{
                        display: "block",
                        width: "calc(100% - 4px)",
                        height: "calc(100% - 4px)",
                        margin: "2px",
                        cursor: hoveredButtonIndex !== -1 ? "pointer" : isDraggingEvent ? "grabbing" : isPanning ? "grabbing" : "grab",
                    }}
                />
            </div>

            {isLoading && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    fontSize: "18px",
                    zIndex: 1000
                }}>
                    Loading events...
                </div>
            )}

            {/* Deletion Status Indicator */}
            {deletionStatus && deletionStatus.queueSize > 0 && (
                <div style={{
                    position: "fixed",
                    top: "10px",
                    right: "10px",
                    background: deletionStatus.status === 'processing' ? "#ff9800" : "#4caf50",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                }}>
                    <span>🗑️</span>
                    <span>
                        {deletionStatus.status === 'processing' 
                            ? `Deleting ${deletionStatus.queueSize} events...` 
                            : `${deletionStatus.queueSize} events queued for deletion`}
                    </span>
                </div>
            )}

            {showAddForm && (
                <AddItemForm
                    onSubmit={addEvent}
                    onCancel={() => setShowAddForm(false)}
                    screenWidth={screenWidth}
                />
            )}
        </div>
    );
}