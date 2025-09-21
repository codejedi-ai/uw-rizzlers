import { Event } from "../types/Event";

export class Paper {
  public isHoveringButton: boolean = false;

  constructor(
    public event: Event,
    public width: number = 200,
    public height: number = 150
  ) {}

  // Get push pin coordinates (75px above the paper center)
  get pushPinX(): number {
    return this.event.x;
  }

  get pushPinY(): number {
    return this.event.y - 75;
  }

  hitTest(mx: number, my: number): boolean {
    return mx >= this.event.x - this.width / 2 && 
           mx <= this.event.x + this.width / 2 && 
           my >= this.event.y - this.height / 2 && 
           my <= this.event.y + this.height / 2;
  }

  // Check if click is on the push pin
  isClickOnPushPin(mx: number, my: number): boolean {
    const pushPinRadius = 12;
    const distance = Math.sqrt(
      Math.pow(mx - this.pushPinX, 2) + Math.pow(my - this.pushPinY, 2)
    );
    return distance <= pushPinRadius;
  }

  // Check if click is on the link button
  isClickOnLinkButton(mx: number, my: number): boolean {
    const buttonX = this.event.x - this.width / 2 + 10;
    const buttonY = this.event.y + this.height / 2 - 35;
    const buttonWidth = this.width - 20;
    const buttonHeight = 25;
    
    return mx >= buttonX && mx <= buttonX + buttonWidth && 
           my >= buttonY && my <= buttonY + buttonHeight;
  }


  draw(gc: CanvasRenderingContext2D): void {
    gc.save();
    
    const x = this.event.x - this.width / 2;
    const y = this.event.y - this.height / 2;
    
    // Draw paper background
    gc.fillStyle = this.event.color;
    gc.strokeStyle = "#333";
    gc.lineWidth = 2;
    gc.beginPath();
    gc.roundRect(x, y, this.width, this.height, 8);
    gc.fill();
    gc.stroke();
    
    // Draw shadow effect
    gc.fillStyle = "rgba(0, 0, 0, 0.1)";
    gc.beginPath();
    gc.roundRect(x + 3, y + 3, this.width, this.height, 8);
    gc.fill();
    
    // Draw title
    gc.fillStyle = "#333";
    gc.font = "bold 16px Arial";
    gc.textAlign = "center";
    gc.textBaseline = "top";
    
    // Wrap text if too long
    const maxWidth = this.width - 20;
    const words = this.event.title.split(' ');
    let line = '';
    let yPos = y + 20;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = gc.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        gc.fillText(line, this.event.x, yPos);
        line = words[n] + ' ';
        yPos += 20;
      } else {
        line = testLine;
      }
    }
    gc.fillText(line, this.event.x, yPos);
    
    // Draw description
    gc.font = "12px Arial";
    gc.fillStyle = "#666";
    yPos += 30;
    
    const descWords = this.event.description.split(' ');
    line = '';
    
    for (let n = 0; n < descWords.length; n++) {
      const testLine = line + descWords[n] + ' ';
      const metrics = gc.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        gc.fillText(line, this.event.x, yPos);
        line = descWords[n] + ' ';
        yPos += 15;
      } else {
        line = testLine;
      }
    }
    gc.fillText(line, this.event.x, yPos);
    
    // Draw time for events
    if (this.event.type === 'event' && this.event.time) {
      yPos += 20;
      gc.font = "bold 11px Arial";
      gc.fillStyle = "#8B4513";
      gc.fillText(`🕒 ${this.formatTime(this.event.time)}`, this.event.x, yPos);
    }
    
    // Draw link button if there's a link
    if (this.event.link) {
      this.drawLinkButton(gc);
    }
    
    // Draw push pin
    this.drawPushPin(gc);
    
    gc.restore();
  }

  // Draw the metallic push pin
  private drawPushPin(gc: CanvasRenderingContext2D): void {
    const pinX = this.pushPinX;
    const pinY = this.pushPinY;
    const radius = 12;

    // Create metallic gradient
    const gradient = gc.createRadialGradient(pinX - 3, pinY - 3, 0, pinX, pinY, radius);
    gradient.addColorStop(0, "#f0f0f0");
    gradient.addColorStop(0.3, "#c0c0c0");
    gradient.addColorStop(0.7, "#808080");
    gradient.addColorStop(1, "#404040");

    // Draw push pin circle
    gc.fillStyle = gradient;
    gc.beginPath();
    gc.arc(pinX, pinY, radius, 0, 2 * Math.PI);
    gc.fill();

    // Add highlight
    gc.fillStyle = "rgba(255, 255, 255, 0.6)";
    gc.beginPath();
    gc.arc(pinX - 3, pinY - 3, radius * 0.4, 0, 2 * Math.PI);
    gc.fill();

    // Add shadow
    gc.fillStyle = "rgba(0, 0, 0, 0.3)";
    gc.beginPath();
    gc.arc(pinX + 2, pinY + 2, radius * 0.8, 0, 2 * Math.PI);
    gc.fill();
  }

  // Draw the link button
  private drawLinkButton(gc: CanvasRenderingContext2D): void {
    const buttonX = this.event.x - this.width / 2 + 10;
    const buttonY = this.event.y + this.height / 2 - 35;
    const buttonWidth = this.width - 20;
    const buttonHeight = 25;

    // Hover effect - scale and shadow
    if (this.isHoveringButton) {
      gc.save();
      const scale = 1.05;
      const centerX = buttonX + buttonWidth / 2;
      const centerY = buttonY + buttonHeight / 2;
      gc.translate(centerX, centerY);
      gc.scale(scale, scale);
      gc.translate(-centerX, -centerY);
      
      // Add shadow
      gc.fillStyle = "rgba(0, 0, 0, 0.2)";
      gc.beginPath();
      gc.roundRect(buttonX + 2, buttonY + 2, buttonWidth, buttonHeight, 4);
      gc.fill();
    }

    // Button background with custom color
    const baseColor = this.event.buttonColor || "#4CAF50";
    const hoverColor = this.isHoveringButton ? this.lightenColor(baseColor, 20) : baseColor;
    const borderColor = this.darkenColor(baseColor, 10);
    
    gc.fillStyle = hoverColor;
    gc.strokeStyle = borderColor;
    gc.lineWidth = this.isHoveringButton ? 2 : 1;
    gc.beginPath();
    gc.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 4);
    gc.fill();
    gc.stroke();

    // Button text
    gc.fillStyle = "white";
    gc.font = "bold 12px Arial";
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    
    // Determine button text based on link type and event type
    let buttonText = "🔗 Join";
    
    if (this.event.type === 'event') {
      if (this.isLumaUrl(this.event.link)) {
        buttonText = "📅 Luma";
      } else if (this.isGetRiverUrl(this.event.link)) {
        buttonText = "🌊 GetRiver";
      } else {
        buttonText = "📅 Event";
      }
    } else {
      // Community type
      if (this.event.link.includes("discord")) {
        buttonText = "💬 Discord";
      } else if (this.event.link.includes("slack")) {
        buttonText = "💼 Slack";
      } else if (this.event.link.includes("telegram")) {
        buttonText = "📱 Telegram";
      } else if (this.event.link.startsWith("http")) {
        buttonText = "🌐 Website";
      } else {
        buttonText = "👥 Join";
      }
    }

    gc.fillText(buttonText, this.event.x, buttonY + buttonHeight / 2);
    
    if (this.isHoveringButton) {
      gc.restore();
    }
  }

  // Helper function to lighten a color
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Helper function to darken a color
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }

  // Helper function to format time
  private formatTime(timeString: string): string {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  }

  // Helper function to detect Luma URLs
  private isLumaUrl(url: string): boolean {
    if (!url) return false;
    const lumaPatterns = [
      'lu.ma',
      'luma.com',
      'luma.co',
      'lu.ma/',
      'luma.com/',
      'luma.co/'
    ];
    return lumaPatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()));
  }

  // Helper function to detect GetRiver URLs
  private isGetRiverUrl(url: string): boolean {
    if (!url) return false;
    const getRiverPatterns = [
      'getriver.io',
      'app.getriver.io',
      'river.io',
      'getriver.com',
      'app.getriver.com'
    ];
    return getRiverPatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()));
  }
}
