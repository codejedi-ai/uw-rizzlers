import {
  NetlifyEvent,
  NetlifyContext,
  ErrorResponse
} from '../shared/models';
import { Bulletin_boardPages_DB } from '../shared/constants';

const handler = async (event: NetlifyEvent, context: NetlifyContext) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, message: 'Method not allowed' })
      };
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    if (!NOTION_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Missing NOTION_TOKEN' })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const {
      title,
      description = '',
      link = '',
      x = 0,
      y = 0,
      buttonColor = '#4CAF50',
      type = 'event',
      time
    } = body;

    if (!title) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'title is required' })
      };
    }

    const url = `https://api.notion.com/v1/pages`;
    const notionHeaders = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    } as const;

    const payload = {
      parent: { database_id: Bulletin_boardPages_DB },
      properties: {
        // Common title property name in Notion DBs is "Name"
        Name: {
          title: [
            {
              type: 'text',
              text: { content: String(title).slice(0, 100) }
            }
          ]
        },
        // Coordinates
        pos_x: { number: Number(x) || 0 },
        pos_y: { number: Number(y) || 0 },
        // Optional rich text fields we already parse on client
        Description: description
          ? { rich_text: [{ type: 'text', text: { content: String(description) } }] }
          : { rich_text: [] },
        Link: link
          ? { rich_text: [{ type: 'text', text: { content: String(link) } }] }
          : { rich_text: [] },
        button_color: buttonColor
          ? { rich_text: [{ type: 'text', text: { content: String(buttonColor) } }] }
          : { rich_text: [] },
        Type: type
          ? { rich_text: [{ type: 'text', text: { content: String(type) } }] }
          : { rich_text: [] },
        Time: time
          ? { rich_text: [{ type: 'text', text: { content: String(time) } }] }
          : { rich_text: [] }
      }
    };

    console.log('Creating Notion page with payload properties keys:', Object.keys(payload.properties));

    const response = await fetch(url, {
      method: 'POST',
      headers: notionHeaders,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API error: ${response.status} - ${errorText}`);
    }

    const created = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, page: created })
    };

  } catch (error) {
    console.error('Error in create-page function:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to create page in Notion',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};

export { handler };


