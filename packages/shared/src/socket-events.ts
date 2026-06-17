// ── Client → Server ──────────────────────────────────────────────────────────

export interface ThreadJoinPayload {
  threadId?: string;
  metadata?: Record<string, unknown>;
}

export interface ThreadMessagePayload {
  text: string;
}

export interface ClientToServerEvents {
  'thread.join': (payload: ThreadJoinPayload) => void;
  'thread.message': (payload: ThreadMessagePayload) => void;
}

// ── Server → Client ──────────────────────────────────────────────────────────

export interface ThreadJoinedPayload {
  threadId: string;
  created: boolean;
}

export interface MessageUserPayload {
  id: string;
  text: string;
}

export interface MessageAssistantPayload {
  id: string;
  text: string;
}

export type SocketErrorCode =
  | 'THREAD_JOIN_FAILED'
  | 'NO_THREAD'
  | 'EMPTY_MESSAGE'
  | 'CHAT_FAILED';

export interface SocketErrorPayload {
  code: SocketErrorCode;
  message: string;
}

export interface ServerToClientEvents {
  'thread.joined': (payload: ThreadJoinedPayload) => void;
  'message.user': (payload: MessageUserPayload) => void;
  'message.assistant': (payload: MessageAssistantPayload) => void;
  error: (payload: SocketErrorPayload) => void;
}
