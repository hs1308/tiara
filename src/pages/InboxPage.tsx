import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useUsers } from '../hooks/useTiaraData'
import { useMessaging } from '../state/MessagingContext'
import { demoUserId } from '../data/mockData'
import { formatDate } from '../lib/format'

export function InboxPage() {
  const { userId: activeUserId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const { data: users = [] } = useUsers()
  const { conversations, sendMessage, getConversation } = useMessaging()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentUser = users.find((u) => u.id === demoUserId)

  const activeConversation = activeUserId ? getConversation(activeUserId) : null
  const activeUser = activeUserId ? users.find((u) => u.id === activeUserId) : null

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  function handleSend() {
    if (!draft.trim() || !activeUserId) return
    sendMessage(activeUserId, draft.trim())
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  // On mobile: show chat when activeUserId, list otherwise
  // On wider: show both side by side (handled via CSS)

  return (
    <div className="inbox-layout">
      {/* Conversation list */}
      <aside className={`inbox-sidebar${activeUserId ? ' inbox-sidebar--hidden-mobile' : ''}`}>
        <div className="inbox-sidebar-header">
          <h2 className="inbox-title">Messages</h2>
        </div>

        {conversations.length === 0 ? (
          <p className="empty-label" style={{ padding: '20px' }}>No messages yet.</p>
        ) : (
          <div className="inbox-conversation-list">
            {conversations.map((conv) => {
              const other = users.find((u) => u.id === conv.userId)
              if (!other) return null
              const last = conv.messages[conv.messages.length - 1]
              const isActive = conv.userId === activeUserId
              return (
                <button
                  key={conv.userId}
                  type="button"
                  className={`inbox-conversation-item${isActive ? ' inbox-conversation-item--active' : ''}`}
                  onClick={() => navigate(`/inbox/${conv.userId}`)}
                >
                  <img src={other.avatar} alt={other.name} className="avatar-sm" />
                  <div className="inbox-conversation-body">
                    <div className="inbox-conversation-name">{other.name}</div>
                    {last && (
                      <div className="inbox-conversation-preview">
                        {last.fromId === demoUserId ? 'You: ' : ''}{last.body}
                      </div>
                    )}
                  </div>
                  {last && (
                    <div className="inbox-conversation-time">{formatDate(last.createdAt)}</div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </aside>

      {/* Chat pane */}
      {activeUserId && activeUser ? (
        <div className="inbox-chat">
          {/* Chat header */}
          <div className="inbox-chat-header">
            <button
              type="button"
              className="icon-button inbox-back-btn"
              onClick={() => navigate('/inbox')}
              aria-label="Back to inbox"
            >
              <ArrowLeft size={17} />
            </button>
            <img src={activeUser.avatar} alt={activeUser.name} className="avatar-sm" />
            <div className="inbox-chat-header-info">
              <button
                type="button"
                className="inbox-chat-username"
                onClick={() => navigate(`/user/${activeUserId}`)}
              >
                {activeUser.name}
              </button>
              <span className="meta-line">@{activeUser.username} · {activeUser.city}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="inbox-messages">
            {activeConversation && activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((msg) => {
                const isOwn = msg.fromId === demoUserId
                const sender = users.find((u) => u.id === msg.fromId)
                return (
                  <div key={msg.id} className={`inbox-message${isOwn ? ' inbox-message--own' : ''}`}>
                    {!isOwn && (
                      <img src={sender?.avatar} alt={sender?.name} className="avatar-xs inbox-message-avatar" />
                    )}
                    <div className="inbox-message-bubble">
                      <p>{msg.body}</p>
                      <span className="inbox-message-time">{formatDate(msg.createdAt)}</span>
                    </div>
                    {isOwn && (
                      <img src={currentUser?.avatar} alt="You" className="avatar-xs inbox-message-avatar" />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="inbox-empty-chat">
                <img src={activeUser.avatar} alt={activeUser.name} className="inbox-empty-avatar" />
                <p>Start a conversation with <strong>{activeUser.name}</strong></p>
                <span className="meta-line">{activeUser.city} · @{activeUser.username}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="inbox-compose">
            <textarea
              className="inbox-compose-input"
              placeholder={`Message ${activeUser.name}...`}
              value={draft}
              rows={1}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="inbox-send-btn"
              disabled={!draft.trim()}
              onClick={handleSend}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="inbox-empty-state">
          <MessageCircleIcon />
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  )
}

function MessageCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', marginBottom: '12px' }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
