import React from 'react';
import DropdownMenu from './DropdownMenu';

interface NavbarProps {
  screenWidth: number;
  isDeleteMode: boolean;
  onToggleDeleteMode: () => void;
  onAddEvent: () => void;
}

export default function Navbar({ 
  screenWidth, 
  isDeleteMode, 
  onToggleDeleteMode, 
  onAddEvent 
}: NavbarProps) {
  return (
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
                action: onAddEvent
              },
              {
                id: 'delete',
                label: isDeleteMode ? 'Exit Delete Mode' : 'Delete Mode',
                icon: '🗑️',
                action: onToggleDeleteMode,
                variant: isDeleteMode ? 'danger' : 'default'
              }
            ]}
          />
        </div>
      </div>
    </header>
  );
}
