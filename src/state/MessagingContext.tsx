import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { demoUserId } from '../data/mockData'

export interface Message {
  id: string
  fromId: string
  toId: string
  body: string
  createdAt: string
}

export interface Conversation {
  userId: string // the other user
  messages: Message[]
}

interface MessagingContextValue {
  conversations: Conversation[]
  sendMessage: (toId: string, body: string) => void
  getConversation: (userId: string) => Conversation
  totalUnread: number
}

const MessagingContext = createContext<MessagingContextValue | null>(null)

// Seed a few demo messages so inbox isn't empty
const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    fromId: 'user-tiara-rhea',
    toId: demoUserId,
    body: 'Hey! Loved your review on the Kay Beauty concealer. Which shade did you end up getting?',
    createdAt: '2026-04-27T10:00:00Z',
  },
  {
    id: 'msg-002',
    fromId: demoUserId,
    toId: 'user-tiara-rhea',
    body: 'I got W2! Works really well for my NC30 skin. Definitely try it.',
    createdAt: '2026-04-27T10:15:00Z',
  },
  {
    id: 'msg-003',
    fromId: 'user-tiara-rhea',
    toId: demoUserId,
    body: 'Amazing thank you! Also what sunscreen are you using these days?',
    createdAt: '2026-04-27T10:20:00Z',
  },
  {
    id: 'msg-004',
    fromId: 'user-tiara-naina',
    toId: demoUserId,
    body: 'Your post about pigmentation routine was so helpful. Have you tried adding tranexamic acid?',
    createdAt: '2026-04-28T08:00:00Z',
  },
  {
    id: 'msg-005',
    fromId: demoUserId,
    toId: 'user-tiara-naina',
    body: 'Not yet! Which one do you recommend? The Minimalist one?',
    createdAt: '2026-04-28T08:10:00Z',
  },
]

function buildConversations(messages: Message[]): Conversation[] {
  const map = new Map<string, Message[]>()
  for (const msg of messages) {
    const otherId = msg.fromId === demoUserId ? msg.toId : msg.fromId
    if (!map.has(otherId)) map.set(otherId, [])
    map.get(otherId)!.push(msg)
  }
  return Array.from(map.entries()).map(([userId, msgs]) => ({
    userId,
    messages: msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }))
}

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES)

  const sendMessage = useCallback((toId: string, body: string) => {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      fromId: demoUserId,
      toId,
      body,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, msg])
  }, [])

  const conversations = buildConversations(messages)

  const getConversation = useCallback(
    (userId: string): Conversation => {
      return conversations.find((c) => c.userId === userId) ?? { userId, messages: [] }
    },
    [conversations],
  )

  return (
    <MessagingContext.Provider value={{ conversations, sendMessage, getConversation, totalUnread: 0 }}>
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider')
  return ctx
}
