import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatWithLokvia, getProactiveSuggestion } from '@/lib/ai'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { AIContext, AIMessage } from '@/types'

interface LokAIProps {
  context: AIContext
  contextData?: Record<string, unknown>
  variant?: 'floating' | 'inline'
  initialMessage?: string
  className?: string
}

const QUICK_PROMPTS: Record<AIContext, string[]> = {
  home_search: ['Espaços em SP para 2 pessoas', 'Coworkings em Floripa', 'Casas pet-friendly'],
  space_detail: ['Política de cancelamento?', 'Tem estacionamento?', 'Aceita longa temporada?'],
  post_booking: ['Eventos de tech na cidade', 'Restaurantes próximos', 'Como chegar ao espaço?'],
  host_dashboard: ['Como aumentar reservas?', 'Como precificar melhor?', 'Melhorar meu anúncio'],
  city_explore: ['O que fazer em SP?', 'Melhores bairros', 'Eventos essa semana'],
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-forest-900/6 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-forest-900/40"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatPanel({
  context,
  contextData,
  initialMessage,
  onClose,
  isFloating,
}: {
  context: AIContext
  contextData?: Record<string, unknown>
  initialMessage?: string
  onClose?: () => void
  isFloating: boolean
}) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProactiveSuggestion(context, contextData).then(setSuggestion)
  }, [context, contextData])

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        },
      ])
    }
  }, [initialMessage, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await chatWithLokvia([...messages, userMsg], context, contextData)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col', isFloating ? 'h-[460px] w-[350px]' : 'h-[420px]')}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-forest-900/8">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center shrink-0"
            animate={{ boxShadow: ['0 0 0px rgba(200,232,106,0)', '0 0 12px rgba(200,232,106,0.4)', '0 0 0px rgba(200,232,106,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={14} className="text-forest-900" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-forest-900 leading-none">LokIA</p>
            <p className="text-xs text-forest-900/50 mt-0.5">Assistente de IA</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Fechar">
            <X size={15} className="text-forest-900/40" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.length === 0 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-forest-900/60 leading-relaxed">
                {suggestion || 'Como posso ajudar?'}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS[context].map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-forest-900/12 text-forest-900/60 hover:bg-forest-900/5 hover:text-forest-900 hover:border-forest-900/20 transition-all duration-200"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                layout
              >
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-forest-900 text-white rounded-br-sm'
                      : 'bg-forest-900/6 text-forest-900 rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>{loading && <TypingDots />}</AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-forest-900/8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="input text-xs py-2 flex-1 min-w-0"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0 h-9 w-9"
            aria-label="Enviar"
          >
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  )
}

export function LokAI({
  context,
  contextData,
  variant = 'floating',
  initialMessage,
  className,
}: LokAIProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'inline') {
    return (
      <div className={cn('rounded-2xl border border-forest-900/5 bg-white shadow-card ai-glow overflow-hidden', className)}>
        <ChatPanel
          context={context}
          contextData={contextData}
          initialMessage={initialMessage}
          isFloating={false}
        />
      </div>
    )
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="mb-4 rounded-2xl border border-forest-900/5 bg-white shadow-card-hover ai-glow overflow-hidden origin-bottom-right"
          >
            <ChatPanel
              context={context}
              contextData={contextData}
              initialMessage={initialMessage}
              onClose={() => setIsOpen(false)}
              isFloating
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200',
          isOpen ? 'bg-forest-900' : 'bg-lime-400'
        )}
        whileHover={{ scale: 1.08, boxShadow: '0 0 24px rgba(200,232,106,0.4)' }}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir assistente LokIA'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={20} className="text-forest-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
