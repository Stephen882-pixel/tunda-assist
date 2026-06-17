import { io, Socket } from 'socket.io-client';

interface ThreadJoinedEvent {
  threadId: string;
  created: boolean;
}

interface MessageIncomingEvent {
  messageId: string;
  role: 'assistant';
  content: string;
  timestamp: string;
}

interface ErrorEvent {
  code: string;
  message: string;
}

type MessageCallback = (message: MessageIncomingEvent) => void;
type ErrorCallback = (error: ErrorEvent) => void;

class SocketClient {
  private socket: Socket | null = null;
  private threadId: string | null = null;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  connect(url: string, secret?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const auth = secret ? { token: secret } : undefined;

      this.socket = io(`${url}/chat`, {
        auth,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('[SocketClient] Connected to backend');
        resolve();
      });

      this.socket.on('connect_error', (err: Error) => {
        console.error('[SocketClient] Connection error:', err.message);
        reject(err);
      });

      this.socket.on('thread.joined', (data: ThreadJoinedEvent) => {
        console.log('[SocketClient] Joined thread:', data.threadId);
        this.threadId = data.threadId;
      });

      this.socket.on('message.user', (data: { id: string; text: string }) => {
        console.log('[SocketClient] User message echoed:', data);
      });

      this.socket.on('message.assistant', (data: { id: string; text: string }) => {
        console.log('[SocketClient] Assistant message received:', data);
        this.messageCallbacks.forEach((cb) => cb({
          messageId: data.id,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toISOString(),
        }));
      });

      this.socket.on('error', (data: ErrorEvent) => {
        console.error('[SocketClient] Error:', data);
        this.errorCallbacks.forEach((cb) => cb(data));
      });

      this.socket.on('disconnect', () => {
        console.log('[SocketClient] Disconnected from backend');
      });
    });
  }

  joinThread(existingThreadId?: string, metadata?: Record<string, unknown>): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    console.log('[SocketClient] Joining thread...', { existingThreadId, metadata });
    this.socket.emit('thread.join', {
      threadId: existingThreadId,
      metadata,
    });
  }

  sendMessage(text: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    if (!this.threadId) {
      throw new Error('No active thread. Call joinThread first.');
    }

    console.log('[SocketClient] Sending message:', text);
    this.socket.emit('thread.message', { text });
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.threadId = null;
    }
  }

  getThreadId(): string | null {
    return this.threadId;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
export type { MessageIncomingEvent, ErrorEvent };
