"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mic, ArrowLeft, Plus } from "lucide-react"

type Entry = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  body: string
  createdAt: string
  updatedAt: string
  audioDataUrl?: string // optional base64-encoded voice note
}

function formatDateLabel(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any
    SpeechRecognition?: any
  }
}

export function Journal({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [date, setDate] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [body, setBody] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState<string>("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nutriscan-journal")
      if (raw) {
        const parsed = JSON.parse(raw) as Entry[]
        const normalized = parsed.map((e: any) => ({
          ...e,
          date: e.date || new Date().toISOString().slice(0, 10),
          title: e.title || "",
          body: e.body || "",
          audioDataUrl: e.audioDataUrl || undefined,
        }))
        setEntries(normalized)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
        recognitionRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("nutriscan-journal", JSON.stringify(entries))
  }, [entries])

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) =>
      a.date === b.date ? b.updatedAt.localeCompare(a.updatedAt) : b.date.localeCompare(a.date),
    )
  }, [entries])

  async function startRecording() {
    try {
      setVoiceError(null)
      setInterimTranscript("")
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SR) {
        setVoiceError("Speech Recognition is not supported in this browser.")
        setIsRecording(false)
        return
      }

      const rec = new SR()
      recognitionRef.current = rec
      rec.continuous = true
      rec.interimResults = true
      rec.lang = navigator.language || "en-US"

      rec.onresult = (event: any) => {
        let interim = ""
        let finalText = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            finalText += res[0].transcript
          } else {
            interim += res[0].transcript
          }
        }
        if (finalText) {
          setBody((prev) => (prev ? `${prev} ${finalText.trim()}` : finalText.trim()))
        }
        setInterimTranscript(interim)
      }

      rec.onerror = (e: any) => {
        setVoiceError(e?.error || "Speech recognition error.")
      }
      rec.onend = () => {
        setIsRecording(false)
        setInterimTranscript("")
      }

      rec.start()
      setIsRecording(true)
    } catch (err: any) {
      setVoiceError(err?.message || "Could not start speech recognition.")
      setIsRecording(false)
    }
  }

  function stopRecording() {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    } catch {
      // no-op
    } finally {
      setIsRecording(false)
      setInterimTranscript("")
    }
  }

  function stopRecordingIfActive() {
    if (isRecording) stopRecording()
  }

  const startNew = () => {
    setEditingId(null)
    setDate(new Date().toISOString().slice(0, 10))
    setTitle("")
    setBody("")
    setInterimTranscript("")
    setIsEditorOpen(true)
  }

  const startEdit = (id: string) => {
    const e = entries.find((x) => x.id === id)
    if (!e) return
    setEditingId(id)
    setDate(e.date)
    setTitle(e.title)
    setBody(e.body)
    setInterimTranscript("")
    setIsEditorOpen(true)
  }

  const cancelEdit = () => {
    setIsEditorOpen(false)
    setEditingId(null)
    setTitle("")
    setBody("")
    stopRecordingIfActive()
    setInterimTranscript("")
    setVoiceError(null)
  }

  const saveEntry = () => {
    if (!title.trim() && !body.trim()) {
      return
    }
    if (editingId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? {
                ...e,
                title: title.trim(),
                body: body.trim(),
                date: date || new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString(),
              }
            : e,
        ),
      )
    } else {
      const now = new Date().toISOString()
      const newEntry: Entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: date || now.slice(0, 10),
        title: title.trim(),
        body: body.trim(),
        createdAt: now,
        updatedAt: now,
      }
      setEntries((prev) => [newEntry, ...prev])
    }
    cancelEdit()
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8" aria-label="Back" title="Back">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-light text-balance">Journal</h1>
          </div>
          {!isEditorOpen && (
            <Button
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={startNew}
              aria-label="New Entry"
              title="New Entry"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Entry</span>
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">Capture quick reflections from your day</p>
      </div>

      {isEditorOpen ? (
        <div className="px-3 space-y-3 animate-slide-up">
          <Card className="bg-card border p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 rounded-md border bg-background px-2 text-xs"
                aria-label="Entry date"
              />
              <div className="flex items-stretch gap-2">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  className="h-9 px-2 text-xs"
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={isRecording ? "Stop dictation" : "Start voice dictation"}
                  title={isRecording ? "Stop dictation" : "Start voice dictation"}
                >
                  <Mic className="h-4 w-4 mr-1.5" />
                  {isRecording ? "Stop" : "Voice"}
                </Button>
              </div>
            </div>

            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
              aria-label="Entry title"
            />
            <Textarea
              placeholder="Write your thoughts..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-40 text-sm"
              aria-label="Entry text"
            />

            {isRecording && (
              <div className="text-xs text-muted-foreground">
                Listening… {interimTranscript ? <span>{interimTranscript}</span> : null}
              </div>
            )}
            {voiceError && <div className="text-xs text-destructive">{voiceError}</div>}

            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={saveEntry}>
                Save
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="px-3 space-y-2">
          {sorted.length === 0 ? (
            <Card className="bg-muted/40 border p-4">
              <p className="text-muted-foreground text-sm">No entries yet. Tap the plus button to start journaling.</p>
            </Card>
          ) : (
            sorted.map((e) => {
              const excerpt = e.body.length > 120 ? `${e.body.slice(0, 120)}…` : e.body
              return (
                <Card key={e.id} className="bg-card border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{formatDateLabel(e.date)}</div>
                      <h3 className="text-sm font-medium truncate">{e.title || "Untitled"}</h3>
                      {!!excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{excerpt}</p>}
                    </div>
                    <div className="flex-shrink-0 flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => startEdit(e.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => deleteEntry(e.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
