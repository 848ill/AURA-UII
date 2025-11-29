"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useN8nTrigger } from "@/hooks/useN8nTrigger"
import { useChatRealtime } from "@/hooks/useChatRealtime"
import { useAuth } from "@/hooks/useAuth"
import { cn, cleanMarkdown, formatRelativeTime } from "@/lib/utils"
import { typeWriterEffect } from "@/lib/typingeffect"
import type { ChatMessage, ChatSession, ChatFile } from "@/lib/supabase"
import {
  Send,
  Loader2,
  Edit3,
  Trash2,
  Check,
  X,
  RefreshCw,
  Paperclip,
  File,
  Image as ImageIcon,
  XCircle,
  Menu,
  MessageSquare,
  Search,
  Copy,
  CheckCircle2,
  RotateCcw,
} from "lucide-react"

interface ChatInterfaceProps {
  initialSessions: ChatSession[]
  initialMessages: ChatMessage[]
  initialSessionId?: string | null
}

type UILocalMessage = ChatMessage & {
  isPlaceholder?: boolean
  files?: ChatFile[]
}

function ChatInterface({
  initialSessions,
  initialMessages,
  initialSessionId = null,
}: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [messages, setMessages] = useState<UILocalMessage[]>(
    initialMessages.length ? initialMessages : []
  )
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessionId
  )
  const [inputValue, setInputValue] = useState("")
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [sessionActionLoading, setSessionActionLoading] = useState<
    string | null
  >(null)
  const [isRefreshingSessions, setIsRefreshingSessions] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isSessionListOpen, setIsSessionListOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const { trigger, isLoading } = useN8nTrigger()
  const { user } = useAuth()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!sessionError) return
    const timeout = setTimeout(() => setSessionError(null), 6000)
    return () => clearTimeout(timeout)
  }, [sessionError])

  // Fetch sessions on mount if user is authenticated and no initial sessions
  useEffect(() => {
    if (user?.id && sessions.length === 0 && initialSessions.length === 0) {
      fetchSessions()
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K: New chat
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        handleNewChat()
        return
      }

      // Escape: Close session list on mobile
      if (e.key === "Escape" && isSessionListOpen) {
        setIsSessionListOpen(false)
        return
      }

      // Cmd+/ or Ctrl+/: Focus search (optional)
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        // Focus search input if exists
        const searchInput = document.querySelector('input[placeholder*="Cari sesi"]') as HTMLInputElement
        searchInput?.focus()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSessionListOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSessions = useCallback(async () => {
    if (!user?.id) {
      setSessions([])
      return []
    }

    setIsLoadingSessions(true)
    try {
      const response = await fetch(`/api/chat/sessions?userId=${user.id}`)
      if (!response.ok) throw new Error("Failed to load sessions")
      const data = await response.json()
      const fetched: ChatSession[] = data.sessions ?? []
      
      // Additional client-side filter to ensure only user's sessions are shown
      // Exclude sessions with NULL user_id and ensure strict matching
      const userSessions = fetched.filter(
        (session) => {
          // Strict validation: must have user_id and match current user
          if (!session.user_id || session.user_id !== user.id) {
            console.warn("🚫 Filtered out session:", {
              id: session.id,
              title: session.title,
              session_user_id: session.user_id,
              current_user_id: user.id,
            })
            return false
          }
          return true
        }
      )
      
      console.log("📋 Filtered sessions:", {
        total: fetched.length,
        filtered: userSessions.length,
        userId: user.id,
        sessions: userSessions.map((s) => ({ id: s.id, title: s.title, user_id: s.user_id })),
      })
      
      setSessions(userSessions)
      
      if (
        editingSessionId &&
        !userSessions.some((session) => session.id === editingSessionId)
      ) {
        setEditingSessionId(null)
        setEditingTitle("")
      }
      return userSessions
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      setSessionError("Gagal memuat daftar sesi.")
      return []
    } finally {
      setIsLoadingSessions(false)
    }
  }, [editingSessionId, user?.id])

  const refreshSessions = useCallback(async () => {
    setIsRefreshingSessions(true)
    try {
      await fetchSessions()
    } finally {
      setIsRefreshingSessions(false)
    }
  }, [fetchSessions])

  const createSessionOnDemand = useCallback(async (titleSeed: string) => {
    if (!user?.id) {
      setSessionError("Anda harus login untuk membuat sesi chat.")
      return null
    }

    setIsCreatingSession(true)
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleSeed, userId: user.id }),
      })

      if (!response.ok) throw new Error("Unable to create session")

      const data = await response.json()
      const session: ChatSession = data.session
      setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)])
      setActiveSessionId(session.id)
      return session.id
    } catch (error) {
      console.error("createSessionOnDemand error:", error)
      setSessionError("Tidak bisa membuat sesi chat baru. Cek konfigurasi Supabase.")
      return null
    } finally {
      setIsCreatingSession(false)
    }
  }, [user])

  const persistMessage = useCallback(
    async (payload: {
      sessionId: string
      role: "user" | "assistant"
      content: string
    }) => {
      try {
        const response = await fetch(
          `/api/chat/sessions/${payload.sessionId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: payload.role,
              content: payload.content,
            }),
          }
        )

        if (!response.ok) throw new Error("Failed to store message")
        const data = await response.json()
        return data.message as ChatMessage
      } catch (error) {
        console.error("persistMessage error:", error)
        setSessionError("Tidak bisa menyimpan pesan. Pastikan Supabase siap.")
        return null
      }
    },
    []
  )

  const loadSession = useCallback(async (sessionId: string) => {
    if (sessionId === activeSessionId) return
    if (!user?.id) {
      setSessionError("Anda harus login untuk memuat sesi chat.")
      return
    }

    setHistoryLoading(true)
    setSessionError(null)
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages?userId=${user.id}`)
      if (!response.ok) {
        if (response.status === 403) {
          setSessionError("Anda tidak memiliki akses ke sesi ini.")
        } else {
          throw new Error("Failed to load chat history")
        }
        return
      }
      const data = await response.json()
      setMessages(data.messages ?? [])
      setActiveSessionId(sessionId)
    } catch (error) {
      console.error("loadSession error:", error)
      setSessionError("Gagal memuat riwayat chat.")
    } finally {
      setHistoryLoading(false)
    }
  }, [activeSessionId, user?.id])

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setSessionError(null)
    setInputValue("")
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const determineAssistantReply = (result: any) => {
    if (!result) {
      console.error("❌ determineAssistantReply: result is null/undefined");
      return "Gagal mendapatkan balasan dari AI. Cek log N8N."
    }

    console.log("🔍 determineAssistantReply - result structure:", JSON.stringify(result).substring(0, 300));

    // Format 1: { success: true, data: { text: "..." } }
    if (result.data?.text) {
      const text = result.data.text.trim();
      if (text) return text;
    }

    // Format 2: { data: "string langsung" }
    if (typeof result.data === "string") {
      const text = result.data.trim();
      if (text) return text;
    }

    // Format 3: { data: { message: "..." } }
    if (result.data?.message) {
      const text = String(result.data.message).trim();
      if (text) return text;
    }

    // Format 4: { text: "..." }
    if (result.text) {
      const text = String(result.text).trim();
      if (text) return text;
    }

    // Format 5: { message: "..." }
    if (result.message) {
      const text = String(result.message).trim();
      if (text) return text;
    }

    // Format 6: Array response (n8n format)
    if (Array.isArray(result.data) && result.data.length > 0) {
      const first = result.data[0];
      if (first?.json?.output) return String(first.json.output).trim();
      if (first?.json?.text) return String(first.json.text).trim();
      if (first?.text) return String(first.text).trim();
    }

    // Format 7: Raw object, try to stringify
    if (result.data && typeof result.data === "object") {
      const str = JSON.stringify(result.data);
      if (str && str !== "{}") return str;
    }

    console.error("❌ determineAssistantReply: Could not extract text from result:", result);
    return "Gagal mendapatkan balasan dari AI. Format response tidak dikenali. Cek log browser console."
  }

  const handleSend = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading || uploadingFiles) return

    const trimmed = inputValue.trim()
    setInputValue("")
    setSessionError(null)

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = await createSessionOnDemand(trimmed || "Chat dengan file")
      if (!sessionId) return
      await fetchSessions()
    }

    // Upload files first
    let uploadedFiles: ChatFile[] = []
    if (attachedFiles.length > 0) {
      try {
        uploadedFiles = await uploadFiles(sessionId, null)
        setAttachedFiles([]) // Clear attached files after upload
      } catch (error) {
        console.error("Failed to upload files:", error)
        return
      }
    }

    // Create message content with file references
    const fileReferences = uploadedFiles.length > 0
      ? `\n\n[File terlampir: ${uploadedFiles.map((f) => f.file_name).join(", ")}]`
      : ""
    const messageContent = trimmed + fileReferences

    const storedUserMessage = await persistMessage({
      sessionId,
      role: "user",
      content: messageContent,
    })

    if (storedUserMessage) {
      setMessages((prev) => [...prev, { ...storedUserMessage, files: uploadedFiles }])
    }

    const placeholderId = `assistant-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        session_id: sessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isPlaceholder: true,
      },
    ])

    try {
      console.log("📤 Sending message to N8N:", trimmed.substring(0, 100));
      
      // Prepare file data for N8N
      const fileData = uploadedFiles.map((f) => ({
        id: f.id || `file-${Date.now()}`,
        fileName: f.file_name,
        fileType: f.file_type,
        fileSize: f.file_size,
        url: f.storage_url,
        metadata: f.metadata,
      }))

      console.log("📎 Files to send to N8N:", fileData.length > 0 ? fileData : "No files")

      const result = await trigger({
        message: trimmed,
        sessionId,
        files: fileData.length > 0 ? fileData : undefined,
      })
      console.log("📥 Received result from N8N:", JSON.stringify(result).substring(0, 300));
      
      let aiResponseText = determineAssistantReply(result)
      console.log("✅ Extracted AI response (raw):", aiResponseText.substring(0, 200));

      // Bersihkan markdown formatting
      aiResponseText = cleanMarkdown(aiResponseText)
      console.log("✅ Extracted AI response (cleaned):", aiResponseText.substring(0, 200));

      // Validasi response tidak kosong
      if (!aiResponseText || aiResponseText.trim() === "" || aiResponseText.includes("Gagal mendapatkan")) {
        throw new Error(`Invalid AI response: ${aiResponseText}`)
      }

      const storedAssistant = await persistMessage({
        sessionId,
        role: "assistant",
        content: aiResponseText,
      })

      if (!storedAssistant) {
        console.warn("⚠️ Failed to persist assistant message, but continuing with display");
      }

      // Update placeholder dengan message yang tersimpan atau buat temporary
      const finalMessage = storedAssistant || {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        role: "assistant" as const,
        content: "",
        created_at: new Date().toISOString(),
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId ? { ...finalMessage, content: "" } : msg
        )
      )

      await typeWriterEffect(aiResponseText, (partial) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === finalMessage.id ? { ...msg, content: partial } : msg
          )
        )
      })
    } catch (error) {
      console.error("❌ handleSend error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      
      setMessages((prev) => prev.filter((msg) => msg.id !== placeholderId))
      setSessionError(`Terjadi kesalahan: ${errorMessage.substring(0, 100)}`)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          session_id: sessionId!,
          role: "assistant",
          content: `Maaf, permintaan gagal diproses. Error: ${errorMessage.substring(0, 150)}`,
          created_at: new Date().toISOString(),
        },
      ])
    }
  }

  const handleRegenerateResponse = useCallback(async (assistantMessageId: string) => {
    if (!activeSessionId || isLoading) return

    // Find the assistant message and the user message before it
    const messageIndex = messages.findIndex((msg) => msg.id === assistantMessageId)
    if (messageIndex === -1) return

    // Find the previous user message
    let userMessageIndex = -1
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessageIndex = i
        break
      }
    }

    if (userMessageIndex === -1) {
      setSessionError("Tidak dapat menemukan pesan user sebelumnya.")
      return
    }

    const userMessage = messages[userMessageIndex]
    const userMessageContent = userMessage.content.replace(/\n\n\[File terlampir:.*?\]/g, "").trim()

    // Remove the assistant message and any messages after it (until next user message)
    const messagesToKeep = messages.slice(0, messageIndex)
    setMessages(messagesToKeep)

    // Re-send the user message
    const placeholderId = `assistant-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        session_id: activeSessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isPlaceholder: true,
      },
    ])

    try {
      const result = await trigger({
        message: userMessageContent,
        sessionId: activeSessionId,
        files: undefined, // Files are already in the message
      })

      let aiResponseText = determineAssistantReply(result)
      aiResponseText = cleanMarkdown(aiResponseText)

      if (!aiResponseText || aiResponseText.trim() === "" || aiResponseText.includes("Gagal mendapatkan")) {
        throw new Error(`Invalid AI response: ${aiResponseText}`)
      }

      const storedAssistant = await persistMessage({
        sessionId: activeSessionId,
        role: "assistant",
        content: aiResponseText,
      })

      const finalMessage = storedAssistant || {
        id: `temp-${Date.now()}`,
        session_id: activeSessionId,
        role: "assistant" as const,
        content: "",
        created_at: new Date().toISOString(),
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId ? { ...finalMessage, content: "" } : msg
        )
      )

      await typeWriterEffect(aiResponseText, (partial) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === finalMessage.id ? { ...msg, content: partial } : msg
          )
        )
      })
    } catch (error) {
      console.error("Regenerate error:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== placeholderId))
      setSessionError("Gagal meregenerate respons. Coba lagi.")
    }
  }, [activeSessionId, messages, isLoading, trigger, persistMessage])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setSessionError(`File ${file.name} terlalu besar (max 10MB)`)
        return false
      }
      return true
    })

    setAttachedFiles((prev) => [...prev, ...validFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (sessionId: string, messageId: string | null): Promise<ChatFile[]> => {
    if (attachedFiles.length === 0) return []

    if (!user?.id) {
      setSessionError("Anda harus login untuk mengupload file.")
      throw new Error("User not authenticated")
    }

    setUploadingFiles(true)
    const uploadedFiles: ChatFile[] = []

    try {
      for (const file of attachedFiles) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("sessionId", sessionId)
        formData.append("userId", user.id)
        if (messageId) formData.append("messageId", messageId)

        const response = await fetch("/api/chat/files/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to upload file")
        }

        const data = await response.json()
        if (data.file) {
          uploadedFiles.push(data.file)
        }
      }
    } catch (error) {
      console.error("File upload error:", error)
      setSessionError("Gagal mengupload file. Coba lagi.")
      throw error
    } finally {
      setUploadingFiles(false)
    }

    return uploadedFiles
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRenameSession = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title ?? "Untitled chat")
    setSessionError(null)
  }

  const cancelRenameSession = () => {
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const handleRenameSubmit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!editingSessionId) return

    const trimmed = editingTitle.trim()
    if (!trimmed) {
      setSessionError("Nama sesi tidak boleh kosong.")
      return
    }

    const previousSessions = sessions
    setSessionActionLoading(editingSessionId)
    setSessions((prev) =>
      prev.map((session) =>
        session.id === editingSessionId ? { ...session, title: trimmed } : session
      )
    )

    if (!user?.id) {
      setSessionError("Anda harus login untuk rename sesi.")
      setSessions(previousSessions)
      setSessionActionLoading(null)
      return
    }

    try {
      const response = await fetch(`/api/chat/sessions/${editingSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, userId: user.id }),
      })

      if (!response.ok) {
        if (response.status === 403) {
          setSessionError("Anda tidak memiliki akses ke sesi ini.")
        } else {
          throw new Error("Failed to rename session")
        }
      }
      cancelRenameSession()
    } catch (error) {
      console.error("handleRenameSubmit error:", error)
      setSessions(previousSessions)
      setSessionError("Rename gagal. Coba lagi.")
    } finally {
      setSessionActionLoading(null)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Hapus sesi ini beserta seluruh percakapan?")
    ) {
      return
    }

    const previousSessions = sessions
    const remaining = previousSessions.filter((session) => session.id !== sessionId)
    const fallbackSessionId = remaining[0]?.id ?? null

    setSessionActionLoading(sessionId)
    setSessions(remaining)

    const wasActive = sessionId === activeSessionId
    if (wasActive) {
      setActiveSessionId(null)
      setMessages([])
    }

    if (!user?.id) {
      setSessionError("Anda harus login untuk menghapus sesi.")
      setSessions(previousSessions)
      setSessionActionLoading(null)
      return
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}?userId=${user.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete session")

      if (wasActive) {
        if (fallbackSessionId) {
          await loadSession(fallbackSessionId)
        } else {
          handleNewChat()
        }
      }
    } catch (error) {
      console.error("handleDeleteSession error:", error)
      setSessions(previousSessions)
      setSessionError("Gagal menghapus sesi. Coba lagi.")
    } finally {
      setSessionActionLoading(null)
    }
  }

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const renderMessageBubble = (message: UILocalMessage) => {
    const isUser = message.role === "user"
    const files = message.files || []
    const isCopied = copiedMessageId === message.id

    return (
      <div
        key={message.id}
        className={cn("flex flex-col gap-2 group", isUser ? "items-end" : "items-start")}
      >
        {/* File attachments */}
        {files.length > 0 && (
          <div className={cn("flex flex-wrap gap-2 max-w-[72%]")}>
            {files.map((file) => (
              <a
                key={file.id}
                href={file.storage_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition",
                  isUser
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                )}
              >
                {file.file_type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="truncate max-w-[200px]">{file.file_name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Message content */}
        {message.content && (
          <div
            className={cn(
              "relative max-w-[72%] rounded-2xl px-4 py-2.5",
              "transition-all duration-200",
              isUser ? "bg-black text-white" : "bg-gray-100 text-gray-900"
            )}
          >
            <p className={cn("text-sm leading-relaxed whitespace-pre-wrap")}>
              {message.content || (message.isPlaceholder ? "⋯" : "")}
            </p>
            {/* Action buttons - show on hover */}
            {!message.isPlaceholder && (
              <div className={cn(
                "absolute -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                isUser ? "-left-16" : "-right-16"
              )}>
                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className={cn(
                    "p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md",
                    "border border-gray-200"
                  )}
                  aria-label="Copy message"
                >
                  {isCopied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-600" />
                  )}
                </button>
                {/* Regenerate button - only for assistant messages */}
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleRegenerateResponse(message.id)}
                    disabled={isLoading}
                    className={cn(
                      "p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md",
                      "border border-gray-200",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Regenerate response"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 text-gray-600 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.created_at && !message.isPlaceholder && (
          <span
            className={cn(
              "text-xs text-gray-400 px-2",
              isUser ? "text-right" : "text-left"
            )}
          >
            {formatRelativeTime(message.created_at)}
          </span>
        )}
      </div>
    )
  }

  const formatSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title
    return "Untitled chat"
  }

  const handleRealtimeInsert = useCallback(
    (message: ChatMessage) => {
      if (!message || message.session_id !== activeSessionId) return
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return [...prev, message]
      })
    },
    [activeSessionId]
  )

  useChatRealtime(activeSessionId, handleRealtimeInsert)

  return (
    <div className={cn("relative grid gap-6 lg:grid-cols-[280px_1fr]")}>
      {/* Mobile overlay backdrop */}
      {isSessionListOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
            isSessionListOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsSessionListOpen(false)}
        />
      )}

      {/* Session List Sidebar */}
      <aside
        className={cn(
          "bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col",
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-[280px]",
          "transform transition-transform duration-300 ease-in-out",
          isSessionListOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("p-4 border-b border-gray-100 space-y-3")}>
          <div className={cn("flex items-center gap-2")}>
            <Button
              className={cn(
                "flex-1 bg-black text-white hover:bg-gray-800",
                "min-h-[44px] touch-manipulation"
              )}
              onClick={() => {
                handleNewChat()
                setIsSessionListOpen(false)
              }}
              disabled={isLoading || isCreatingSession}
            >
              {isCreatingSession ? "Menyiapkan..." : "New Chat"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={refreshSessions}
              disabled={isRefreshingSessions}
              aria-label="Refresh sessions"
              className={cn("min-h-[44px] min-w-[44px] touch-manipulation")}
            >
              {isRefreshingSessions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className={cn("text-xs text-muted-foreground")}>
            Semua sesi tersimpan otomatis di Supabase.
          </p>
          {/* Search bar */}
          <div className={cn("relative")}>
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400")} />
            <Input
              type="text"
              placeholder="Cari sesi chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 pr-3 h-9 text-sm border-gray-200 focus:border-black focus:ring-black",
                "min-h-[36px]"
              )}
            />
          </div>
        </div>

        <div className={cn("flex-1 overflow-y-auto p-3 space-y-2")}>
          {isLoadingSessions ? (
            // Skeleton loaders for sessions
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={cn("rounded-lg border border-gray-100 bg-white p-3 space-y-2")}
              >
                <Skeleton className={cn("h-4 w-3/4")} />
                <Skeleton className={cn("h-3 w-1/2")} />
              </div>
            ))
          ) : sessions.length === 0 ? (
            <div className={cn("px-2 py-8 text-center space-y-2")}>
              <MessageSquare className={cn("h-8 w-8 text-gray-300 mx-auto")} />
              <p className={cn("text-xs text-gray-500 font-medium")}>
                Belum ada riwayat chat
              </p>
              <p className={cn("text-xs text-gray-400")}>
                Klik "New Chat" untuk memulai percakapan
              </p>
            </div>
          ) : sessions.filter((session) => {
              // Apply same filters as in the map function
              if (!user?.id || !session.user_id || session.user_id !== user.id) {
                return false
              }
              if (searchQuery.trim()) {
                const title = formatSessionTitle(session).toLowerCase()
                const query = searchQuery.toLowerCase().trim()
                if (!title.includes(query)) {
                  return false
                }
              }
              return true
            }).length === 0 ? (
            <div className={cn("px-2 py-8 text-center space-y-2")}>
              <Search className={cn("h-8 w-8 text-gray-300 mx-auto")} />
              <p className={cn("text-xs text-gray-500 font-medium")}>
                Tidak ada sesi yang cocok
              </p>
              <p className={cn("text-xs text-gray-400")}>
                {searchQuery.trim()
                  ? `Tidak ada sesi dengan judul "${searchQuery}"`
                  : "Belum ada riwayat. Mulai percakapan baru."}
              </p>
            </div>
          ) : (
            sessions
              .filter((session) => {
                // Strict filter: only show sessions that belong to current user
                if (!user?.id) {
                  console.warn("No user ID, filtering out session:", session.id)
                  return false
                }
                if (!session.user_id) {
                  console.warn("Session has no user_id, filtering out:", session.id)
                  return false
                }
                if (session.user_id !== user.id) {
                  console.warn("Session user_id mismatch, filtering out:", {
                    sessionId: session.id,
                    sessionUserId: session.user_id,
                    currentUserId: user.id,
                  })
                  return false
                }
                // Search filter: filter by session title
                if (searchQuery.trim()) {
                  const title = formatSessionTitle(session).toLowerCase()
                  const query = searchQuery.toLowerCase().trim()
                  if (!title.includes(query)) {
                    return false
                  }
                }
                return true
              })
              .map((session) => {
              const isActive = session.id === activeSessionId
              const isEditing = session.id === editingSessionId
              return (
                <div
                  key={session.id}
                  className={cn(
                    "rounded-lg border transition bg-white",
                    isActive
                      ? "border-gray-900 shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  {isEditing ? (
                    <form
                      onSubmit={handleRenameSubmit}
                      className={cn("p-3 space-y-2")}
                    >
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        placeholder="Nama sesi"
                      />
                      <div className={cn("flex items-center gap-2")}>
                        <Button
                          type="submit"
                          size="icon"
                          className={cn(
                            "bg-black text-white hover:bg-gray-800",
                            "min-h-[44px] min-w-[44px] touch-manipulation"
                          )}
                          disabled={sessionActionLoading === session.id}
                        >
                          {sessionActionLoading === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={cancelRenameSession}
                          className={cn("min-h-[44px] min-w-[44px] touch-manipulation")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className={cn("flex items-center gap-2 p-3")}>
                      <button
                        type="button"
                        onClick={() => {
                          loadSession(session.id)
                          // Close session list on mobile after selecting
                          setIsSessionListOpen(false)
                        }}
                        className={cn(
                          "flex-1 text-left min-h-[44px] touch-manipulation",
                          isActive ? "text-gray-900" : "text-gray-800"
                        )}
                      >
                        <p className={cn("text-sm font-medium line-clamp-2")}>
                          {formatSessionTitle(session)}
                        </p>
                        {session.created_at && (
                          <span className={cn("text-xs text-gray-500")}>
                            {new Date(session.created_at).toLocaleString()}
                          </span>
                        )}
                      </button>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-gray-500"
                        )}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => startRenameSession(session)}
                          aria-label="Rename chat"
                          className={cn("min-h-[44px] min-w-[44px] touch-manipulation")}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSession(session.id)}
                          aria-label="Delete chat"
                          disabled={sessionActionLoading === session.id}
                          className={cn("min-h-[44px] min-w-[44px] touch-manipulation")}
                        >
                          {sessionActionLoading === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm",
          "h-[calc(100vh-200px)] lg:h-[620px]"
        )}
      >
        {/* Mobile header with menu button */}
        <div className={cn("lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200")}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsSessionListOpen(true)}
            className={cn("min-h-[44px] min-w-[44px] touch-manipulation")}
            aria-label="Open sessions"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className={cn("flex items-center gap-2 flex-1")}>
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className={cn("text-sm font-semibold text-gray-900")}>
              {activeSessionId
                ? sessions.find((s) => s.id === activeSessionId)?.title || "Chat"
                : "New Chat"}
            </h2>
          </div>
        </div>

        {sessionError && (
          <div
            className={cn(
              "px-6 py-3 border-b border-red-100 bg-red-50 text-sm text-red-600 flex items-center justify-between gap-4"
            )}
          >
            <span>{sessionError}</span>
            <button
              type="button"
              className={cn("text-xs underline")}
              onClick={() => setSessionError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className={cn("flex-1 overflow-y-auto px-6 py-8 space-y-4 relative")}>
          {historyLoading ? (
            // Skeleton loaders for messages
            <div className={cn("space-y-4")}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`message-skeleton-${index}`}
                  className={cn(
                    "flex flex-col gap-2",
                    index % 2 === 0 ? "items-end" : "items-start"
                  )}
                >
                  <Skeleton
                    className={cn(
                      "rounded-2xl",
                      index % 2 === 0 ? "w-1/2 h-16" : "w-2/3 h-20"
                    )}
                  />
                  <Skeleton className={cn("h-3 w-16", index % 2 === 0 ? "ml-auto" : "")} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
              <div
                className={cn(
                "flex flex-col items-center justify-center h-full text-center px-6 space-y-4"
                )}
              >
              <div className={cn("space-y-3 max-w-md")}>
                <div className={cn("flex items-center justify-center")}>
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"
                  )}>
                    <MessageSquare className={cn("h-8 w-8 text-gray-400")} />
                  </div>
                </div>
                <h3 className={cn("text-lg font-semibold text-gray-900")}>
                  Selamat Datang di AURA!
                </h3>
                <p className={cn("text-gray-500 text-sm leading-relaxed")}>
                  Saya AURA, asisten virtual resmi Universitas Islam Indonesia. 
                  Saya siap membantu Anda dengan pertanyaan tentang kampus, layanan, 
                  dan informasi UII lainnya.
                </p>
                <p className={cn("text-gray-400 text-xs mt-4")}>
                  Mulai percakapan baru atau pilih riwayat di samping untuk melihat chat sebelumnya.
                </p>
              </div>
            </div>
          ) : (
            messages.map(renderMessageBubble)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={cn("border-t border-gray-200 bg-white px-6 py-4")}>
          {/* Attached files preview */}
          {attachedFiles.length > 0 && (
            <div className={cn("mb-3 flex flex-wrap gap-2")}>
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-100 border border-gray-200"
                  )}
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <File className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="text-gray-700 truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className={cn("text-gray-400 hover:text-gray-600")}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={cn("flex gap-3 items-center")}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt,.csv"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadingFiles}
              className={cn(
                "rounded-full h-11 w-11 min-h-[44px] min-w-[44px] touch-manipulation"
              )}
              aria-label="Attach file"
            >
              {uploadingFiles ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
              placeholder="Tanyakan apa saja tentang kampus, layanan, dll."
              disabled={isLoading || uploadingFiles}
              className={cn(
                "flex-1 border-gray-300 focus:border-black focus:ring-black rounded-full",
                "min-h-[44px] text-base"
              )}
          />
          <Button
            onClick={handleSend}
              disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading || uploadingFiles}
            size="icon"
              className={cn(
                "bg-black text-white hover:bg-gray-800 rounded-full h-11 w-11",
                "min-h-[44px] min-w-[44px] touch-manipulation"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
