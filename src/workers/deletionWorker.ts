// Deletion Worker - Handles permanent deletion of events from database
import { Event } from '../types/Event';

// Database configuration
const DATABASE_URL = 'https://api.uwrizzlords.com/database'; // Replace with actual database API
const DELETION_BATCH_SIZE = 1; // Process deletions individually for immediate response
const DELETION_RETRY_ATTEMPTS = 3; // Number of retry attempts for failed deletions

interface DeletionMessage {
  type: 'DELETE_EVENT' | 'BATCH_DELETE_EVENTS' | 'CLEAR_DELETION_QUEUE' | 'GET_DELETION_STATUS';
  payload?: {
    eventId?: string;
    eventIds?: string[];
    force?: boolean;
  };
}

interface DeletionResponse {
  type: 'DELETION_SUCCESS' | 'DELETION_FAILED' | 'BATCH_DELETION_SUCCESS' | 'BATCH_DELETION_FAILED' | 'QUEUE_CLEARED' | 'STATUS_UPDATE' | 'ERROR';
  payload?: {
    deletedId?: string;
    deletedIds?: string[];
    failedIds?: string[];
    queueSize?: number;
    status?: 'idle' | 'processing' | 'error';
  };
  error?: string;
}

// Deletion queue to batch operations
let deletionQueue: string[] = [];
let isProcessing = false;
let deletionStatus: 'idle' | 'processing' | 'error' = 'idle';

// Simulate database deletion (replace with real database calls)
async function deleteFromDatabase(eventId: string): Promise<boolean> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Database connection timeout');
    }
    
    // In production, replace with actual database deletion:
    // const response = await fetch(`${DATABASE_URL}/events/${eventId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Database deletion failed: ${response.status}`);
    // }
    // 
    // return true;
    
    console.log(`Successfully deleted event ${eventId} from database`);
    return true;
  } catch (error) {
    console.error(`Failed to delete event ${eventId} from database:`, error);
    return false;
  }
}

// Process deletion queue
async function processDeletionQueue() {
  if (isProcessing || deletionQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  deletionStatus = 'processing';
  
  try {
    const eventsToDelete = deletionQueue.splice(0, DELETION_BATCH_SIZE);
    const deletionPromises = eventsToDelete.map(async (eventId) => {
      const success = await deleteFromDatabase(eventId);
      return { eventId, success };
    });
    
    const results = await Promise.allSettled(deletionPromises);
    const successfulDeletions: string[] = [];
    const failedDeletions: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulDeletions.push(eventsToDelete[index]);
      } else {
        failedDeletions.push(eventsToDelete[index]);
      }
    });
    
    // Send success response
    self.postMessage({
      type: 'BATCH_DELETION_SUCCESS',
      payload: {
        deletedIds: successfulDeletions,
        failedIds: failedDeletions,
        queueSize: deletionQueue.length
      }
    } as DeletionResponse);
    
    // Retry failed deletions
    if (failedDeletions.length > 0) {
      console.log(`Retrying ${failedDeletions.length} failed deletions`);
      deletionQueue.unshift(...failedDeletions);
    }
    
  } catch (error) {
    deletionStatus = 'error';
    self.postMessage({
      type: 'BATCH_DELETION_FAILED',
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    } as DeletionResponse);
  } finally {
    isProcessing = false;
    
    // Continue processing if there are more items in queue
    if (deletionQueue.length > 0) {
      setTimeout(() => processDeletionQueue(), 1000); // Wait 1 second before next batch
    } else {
      deletionStatus = 'idle';
      // Don't terminate - keep worker alive for future deletions
    }
  }
}

// Add event to deletion queue
function queueForDeletion(eventId: string) {
  if (!deletionQueue.includes(eventId)) {
    deletionQueue.push(eventId);
    console.log(`Queued event ${eventId} for deletion. Queue size: ${deletionQueue.length}`);
    
    // Start processing immediately for individual deletions
    if (!isProcessing) {
      setTimeout(() => processDeletionQueue(), 50); // Very small delay
    }
  }
}

// Handle immediate deletion (for critical deletions)
async function deleteImmediately(eventId: string): Promise<boolean> {
  try {
    const success = await deleteFromDatabase(eventId);
    
    if (success) {
      self.postMessage({
        type: 'DELETION_SUCCESS',
        payload: { deletedId: eventId }
      } as DeletionResponse);
    } else {
      self.postMessage({
        type: 'DELETION_FAILED',
        payload: { deletedId: eventId },
        error: 'Database deletion failed'
      } as DeletionResponse);
    }
    
    return success;
  } catch (error) {
    self.postMessage({
      type: 'DELETION_FAILED',
      payload: { deletedId: eventId },
      error: error instanceof Error ? error.message : 'Unknown error'
    } as DeletionResponse);
    return false;
  }
}

// Handle worker messages
self.addEventListener('message', async (event: MessageEvent<DeletionMessage>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'DELETE_EVENT':
        if (payload?.eventId) {
          if (payload.force) {
            // Immediate deletion for critical cases
            await deleteImmediately(payload.eventId);
          } else {
            // Queue for batch processing
            queueForDeletion(payload.eventId);
          }
        }
        break;
        
      case 'BATCH_DELETE_EVENTS':
        if (payload?.eventIds) {
          payload.eventIds.forEach(eventId => queueForDeletion(eventId));
        }
        break;
        
      case 'CLEAR_DELETION_QUEUE':
        deletionQueue = [];
        isProcessing = false;
        deletionStatus = 'idle';
        self.postMessage({
          type: 'QUEUE_CLEARED',
          payload: { queueSize: 0 }
        } as DeletionResponse);
        break;
        
      case 'GET_DELETION_STATUS':
        self.postMessage({
          type: 'STATUS_UPDATE',
          payload: {
            status: deletionStatus,
            queueSize: deletionQueue.length
          }
        } as DeletionResponse);
        break;
        
      default:
        self.postMessage({
          type: 'ERROR',
          error: 'Unknown message type'
        } as DeletionResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as DeletionResponse);
  }
});

// No periodic status updates - only send updates when requested

// Export for TypeScript
export {};
