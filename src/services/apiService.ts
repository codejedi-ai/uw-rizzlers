// API Service for Notion integration
import { Event } from '../types/Event';

interface NotionPage {
  id: string;
  properties: {
    [key: string]: any;
  };
  created_time: string;
  last_edited_time: string;
}

interface FetchPagesResponse {
  success: boolean;
  pages: NotionPage[];
  count: number;
  message?: string;
}

interface UpdateWorkerResponse {
  success: boolean;
  message: string;
  pageId: string;
  x: number;
  y: number;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  error: string;
}

class ApiService {
  private baseUrl = '/api';

  // Fetch all pages from Notion
  async fetchPages(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/fetch-pages`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FetchPagesResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pages');
      }

      // Map Notion pages to Event objects (preserve `this` context)
      return data.pages.map((page) => this.mapNotionPageToEvent(page));
    } catch (error) {
      console.error('Failed to fetch pages from API:', error);
      throw error;
    }
  }

  // Update worker coordinates
  async updateWorkerCoordinates(pageId: string, x: number, y: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/update-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          x,
          y
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UpdateWorkerResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update worker coordinates');
      }

      return true;
    } catch (error) {
      console.error('Failed to update worker coordinates:', error);
      throw error;
    }
  }

  // Map Notion page properties to Event interface
  private mapNotionPageToEvent(page: NotionPage): Event {
    const properties = page.properties;
    
    // Helper function to extract text from Notion rich text property
    const extractText = (property: any): string => {
      if (!property || !property.rich_text) return '';
      return property.rich_text.map((text: any) => text.plain_text).join('');
    };

    // Helper function to extract title from Notion title property
    const extractTitle = (property: any): string => {
      if (!property || !property.title) return '';
      return property.title.map((text: any) => text.plain_text).join('');
    };

    // Helper function to extract number from Notion number property
    const extractNumber = (property: any): number => {
      return property?.number || 0;
    };

    // Helper to extract URL from either url or rich_text properties
    const extractUrl = (property: any): string => {
      if (!property) return '';
      if (typeof property.url === 'string') return property.url;
      if (Array.isArray(property.rich_text)) {
        return property.rich_text.map((t: any) => t.plain_text).join('');
      }
      return '';
    };

    // Helper to extract color string from rich_text/select and normalize
    const extractColor = (property: any): string => {
      let raw = '';
      if (!property) return '';
      if (Array.isArray(property.rich_text)) {
        raw = property.rich_text.map((t: any) => t.plain_text).join('');
      } else if (property?.select?.name) {
        raw = property.select.name;
      } else if (typeof property === 'string') {
        raw = property;
      }
      raw = String(raw).trim();
      if (!raw) return '';
      // If it's a CSS color name or already a hex, return as-is; if it looks like hex without '#', add it
      if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
        return raw.startsWith('#') ? raw : `#${raw}`;
      }
      return raw;
    };

    // Extract properties with fallbacks
    // Prefer the Notion page title; common property keys are "Name" or "Title"
    const title = extractTitle(properties.Title)
      || extractTitle(properties.Name)
      || extractText(properties.Title)
      || extractText(properties.Name)
      || 'Untitled Event';
    const description = extractText(properties.Description) || '';
    // Support Link as url type or rich_text, and multiple casings/keys
    const link = extractUrl(properties.Link) 
      || extractUrl(properties.link) 
      || extractUrl(properties.URL) 
      || extractUrl(properties.url) 
      || '';
    // Support custom coordinate fields with sensible fallbacks: pos_x/pos_y → x/y → X/Y
    const x = extractNumber(properties.pos_x ?? properties.x ?? properties.X);
    const y = extractNumber(properties.pos_y ?? properties.y ?? properties.Y);
    // Support button color from Notion: prefer snake_case 'button_color' (rich_text or select), fallback to 'Button Color'
    const buttonColor = extractColor(properties.button_color)
      || extractColor(properties['Button Color'])
      || '#4CAF50';
    const type = extractText(properties.Type) === 'community' ? 'community' : 'event';
    const time = extractText(properties.Time) || undefined;

    // Generate color based on creation date
    const createdAt = new Date(page.created_time);
    const color = this.getPaperColorByDay(createdAt);

    return {
      id: page.id,
      title,
      description,
      link,
      x,
      y,
      color,
      buttonColor,
      type: type as 'event' | 'community',
      time,
      createdAt
    };
  }

  // Helper function to get paper color based on day of week
  private getPaperColorByDay(date: Date): string {
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
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

