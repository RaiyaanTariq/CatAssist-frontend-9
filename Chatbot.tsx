'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

type Msg = { role: 'user' | 'assistant'; text: string }

export default function Chatbot() {
  const { user } = useAuth() // <-- get the current user
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: "Hi! I'm CatAssist 🐱. Ask about your curriculum, schedule, or scenario." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = [
    "What is my curriculam?",
    "What classes should I take next semester?",
    "How many credits do I need for next semester?",
    "Which professors are available for the classes am taking next semester?",
    "Where are classes located that I am taking next semester?",
    "Am I missing any required classes from the curriculam that I should have taken by now?",
  ]

  async function sendMessage(msg?: string) {
    const text = (msg ?? input).trim()
    if (!text) return
    if (!user?.email) {
      setMessages(m => [...m, { role: 'assistant', text: 'Please sign in to use the planner.' }])
      return
    }

    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch('/data/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,   // <-- use the real signed-in user's email
          message: text,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'server error')
      setMessages(m => [...m, { role: 'assistant', text: data.reply }])
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', text: e.message || 'Network error.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3">CatAssist – AI Planner</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-green-700/40 self-end text-right' : 'bg-slate-800/70'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-slate-400 italic text-sm">Thinking…</div>}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask CatAssist anything…"
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm"
        >
          Send
        </button>
      </div>

      <div className="mt-4 text-slate-400 text-xs">SUGGESTIONS</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-2 text-left text-sm text-slate-200"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
