"use client"
import { useState, useEffect, useCallback } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InstructionsModal } from "./instructions-modal"
import { ModelSelectionModal } from "./model-selection-modal"
import { ChatContextMenu } from "./chat-context-menu"
import { ArchiveModal } from "./archive-modal"
import { Plus, MessageSquare, ExternalLink, AlertCircle } from "lucide-react"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

interface Model {
  id: string
  name: string
  provider: string
  displayName: string
}

export default function EnhancedChatInterface() {
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [archivedChats, setArchivedChats] = useState<ChatSession[]>([])
  const [instructions, setInstructions] = useState("")
  const [selectedModel, setSelectedModel] = useState<Model>({
    id: "gemini-2.0-flash",
    name: "gemini-2.0-flash",
    provider: "google",
    displayName: "Gemini 2.0 Flash (Google)",
  })
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionError, setConnectionError] = useState<string>("")

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      instructions: instructions,
      selectedModel: selectedModel,
      apiKeys: apiKeys,
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setConnectionError(error.message || "Произошла ошибка при отправке сообщения")
    },
    onResponse: (response) => {
      if (!response.ok) {
        setConnectionError("Ошибка сервера. Проверьте API ключи и настройки модели.")
      } else {
        setConnectionError("")
      }
    },
  })

  const emojis = [
    "😊",
    "🤗",
    "🥰",
    "👍",
    "👏",
    "🤣",
    "😉",
    "🤩",
    "🚀",
    "🌟",
    "😎",
    "💪",
    "🤝",
    "💼",
    "🤔",
    "🤷",
    "🙈",
    "🤦",
    "😢",
    "🙏",
    "❤️",
  ]

  const quickLinks = [
    { name: "Википедия", url: "https://ru.wikipedia.org" },
    { name: "Ссылка 2", url: "#" },
    { name: "Ссылка 3", url: "#" },
    { name: "Ссылка 4", url: "#" },
    { name: "Ссылка 5", url: "#" },
    { name: "Ссылка 6", url: "#" },
    { name: "Ссылка 7", url: "#" },
    { name: "Ссылка 8", url: "#" },
    { name: "Ссылка 9", url: "#" },
    { name: "Ссылка 10", url: "#" },
  ]

  const formatTimestamp = useCallback((date: Date) => {
    return date.toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }, [])

  const getTitle = useCallback((msgs: any[]) => {
    const firstUserMessage = msgs.find((m) => m.role === "user")
    return firstUserMessage ? firstUserMessage.content.slice(0, 30) + "..." : "Новый чат"
  }, [])

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString()
    const newChat: ChatSession = {
      id: newChatId,
      title: "Новый чат",
      messages: [],
      createdAt: new Date(),
    }

    setChatSessions((prev) => {
      const updated = [newChat, ...prev]
      localStorage.setItem("chatSessions", JSON.stringify(updated))
      return updated
    })

    setCurrentChatId(newChatId)
    setMessages([])
    setConnectionError("")
  }, [setMessages])

  const hasRequiredApiKey = useCallback(() => {
    const requiredKey = apiKeys[selectedModel.provider]
    return !!requiredKey
  }, [apiKeys, selectedModel.provider])

  useEffect(() => {
    const initializeData = () => {
      const savedChats = localStorage.getItem("chatSessions")
      const savedArchivedChats = localStorage.getItem("archivedChats")
      const savedInstructions = localStorage.getItem("assistantInstructions")
      const savedModel = localStorage.getItem("selectedModel")
      const savedApiKeys = localStorage.getItem("apiKeys")

      let initialChats: ChatSession[] = []
      let initialArchivedChats: ChatSession[] = []

      if (savedChats) {
        initialChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }))
      }

      if (savedArchivedChats) {
        initialArchivedChats = JSON.parse(savedArchivedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }))
      }

      if (savedInstructions) {
        setInstructions(savedInstructions)
      }

      if (savedModel) {
        setSelectedModel(JSON.parse(savedModel))
      }

      if (savedApiKeys) {
        setApiKeys(JSON.parse(savedApiKeys))
      }

      if (initialChats.length === 0) {
        const firstChatId = Date.now().toString()
        const firstChat: ChatSession = {
          id: firstChatId,
          title: "Новый чат",
          messages: [],
          createdAt: new Date(),
        }
        initialChats = [firstChat]
        localStorage.setItem("chatSessions", JSON.stringify(initialChats))
        setCurrentChatId(firstChatId)
      } else {
        setCurrentChatId(initialChats[0].id)
        setMessages(initialChats[0].messages)
      }

      setChatSessions(initialChats)
      setArchivedChats(initialArchivedChats)
      setIsInitialized(true)
    }

    initializeData()
  }, [setMessages])

  useEffect(() => {
    if (!isInitialized || messages.length === 0) return

    const saveCurrentChat = () => {
      setChatSessions((prev) => {
        const updated = prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages, title: getTitle(messages) } : chat,
        )
        localStorage.setItem("chatSessions", JSON.stringify(updated))
        return updated
      })
    }

    const timeoutId = setTimeout(saveCurrentChat, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, currentChatId, isInitialized, getTitle])

  const switchToChat = useCallback(
    (chatId: string) => {
      const chat = chatSessions.find((c) => c.id === chatId)
      if (chat) {
        setCurrentChatId(chatId)
        setMessages(chat.messages)
        setConnectionError("")
      }
    },
    [chatSessions, setMessages],
  )

  const handleRenameChat = useCallback((chatId: string, newTitle: string) => {
    setChatSessions((prev) => {
      const updated = prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      localStorage.setItem("chatSessions", JSON.stringify(updated))
      return updated
    })
  }, [])

  const handleArchiveChat = useCallback(
    (chatId: string) => {
      const chatToArchive = chatSessions.find((chat) => chat.id === chatId)
      if (!chatToArchive) return

      setChatSessions((prev) => {
        const updated = prev.filter((chat) => chat.id !== chatId)
        localStorage.setItem("chatSessions", JSON.stringify(updated))

        if (chatId === currentChatId && updated.length > 0) {
          setCurrentChatId(updated[0].id)
          setMessages(updated[0].messages)
        } else if (updated.length === 0) {
          createNewChat()
        }

        return updated
      })

      setArchivedChats((prev) => {
        const updated = [chatToArchive, ...prev]
        localStorage.setItem("archivedChats", JSON.stringify(updated))
        return updated
      })
    },
    [chatSessions, currentChatId, setMessages, createNewChat],
  )

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      if (!confirm("Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.")) {
        return
      }

      setChatSessions((prev) => {
        const updated = prev.filter((chat) => chat.id !== chatId)
        localStorage.setItem("chatSessions", JSON.stringify(updated))

        if (chatId === currentChatId && updated.length > 0) {
          setCurrentChatId(updated[0].id)
          setMessages(updated[0].messages)
        } else if (updated.length === 0) {
          createNewChat()
        }

        return updated
      })
    },
    [currentChatId, setMessages, createNewChat],
  )

  const handleRestoreFromArchive = useCallback(
    (chatId: string) => {
      const chatToRestore = archivedChats.find((chat) => chat.id === chatId)
      if (!chatToRestore) return

      setArchivedChats((prev) => {
        const updated = prev.filter((chat) => chat.id !== chatId)
        localStorage.setItem("archivedChats", JSON.stringify(updated))
        return updated
      })

      setChatSessions((prev) => {
        const updated = [chatToRestore, ...prev]
        localStorage.setItem("chatSessions", JSON.stringify(updated))
        return updated
      })
    },
    [archivedChats],
  )

  const handleDeleteFromArchive = useCallback((chatId: string) => {
    if (!confirm("Вы уверены, что хотите окончательно удалить этот чат? Это действие нельзя отменить.")) {
      return
    }

    setArchivedChats((prev) => {
      const updated = prev.filter((chat) => chat.id !== chatId)
      localStorage.setItem("archivedChats", JSON.stringify(updated))
      return updated
    })
  }, [])

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      const textarea = document.querySelector("textarea")
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = input.slice(0, start) + emoji + input.slice(end)
        handleInputChange({ target: { value: newValue } } as any)

        setTimeout(() => {
          textarea.setSelectionRange(start + emoji.length, start + emoji.length)
          textarea.focus()
        }, 0)
      }
    },
    [input, handleInputChange],
  )

  const handleInstructionsSave = useCallback((newInstructions: string) => {
    setInstructions(newInstructions)
    localStorage.setItem("assistantInstructions", newInstructions)
  }, [])

  const handleModelSave = useCallback((model: Model, keys: Record<string, string>) => {
    setSelectedModel(model)
    setApiKeys(keys)
    localStorage.setItem("selectedModel", JSON.stringify(model))
    localStorage.setItem("apiKeys", JSON.stringify(keys))
    setConnectionError("")
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  const reversedMessages = [...messages].reverse()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/5 bg-slate-700 text-white p-4 overflow-y-auto">
        <Button onClick={createNewChat} className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Создать Новый Чат
        </Button>

        <ArchiveModal
          archivedChats={archivedChats}
          onRestore={handleRestoreFromArchive}
          onDeletePermanently={handleDeleteFromArchive}
        />

        <div>
          <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-white">История чатов</h2>
          <div className="space-y-2">
            {chatSessions.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  currentChatId === chat.id ? "bg-white text-slate-700" : "hover:bg-slate-600"
                }`}
              >
                <Button
                  variant="ghost"
                  className={`flex-1 text-left justify-start p-0 h-auto ${
                    currentChatId === chat.id ? "text-slate-700" : "text-white hover:bg-transparent"
                  }`}
                  onClick={() => switchToChat(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs opacity-70">{chat.createdAt.toLocaleDateString()}</div>
                  </div>
                </Button>
                <ChatContextMenu
                  chatId={chat.id}
                  chatTitle={chat.title}
                  onRename={handleRenameChat}
                  onArchive={handleArchiveChat}
                  onDelete={handleDeleteChat}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/5 bg-white p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-700 mb-4 pb-2 border-b-2 border-blue-500">
          ИИ Чат-Ассистент ({selectedModel.displayName})
        </h1>

        {!hasRequiredApiKey() && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для работы с моделью {selectedModel.displayName} требуется API ключ {selectedModel.provider.toUpperCase()}
              . Настройте его в разделе "Выбор Модели".
            </AlertDescription>
          </Alert>
        )}

        {connectionError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap justify-center gap-1 mb-4 p-2 bg-gray-50 rounded-lg">
          {emojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-xl hover:scale-110 transition-transform p-1 h-auto"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Введите ваше сообщение..."
            className="min-h-[80px] border-2 border-blue-500 focus:border-blue-600"
            disabled={isLoading || !hasRequiredApiKey()}
          />
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading || !input.trim() || !hasRequiredApiKey()}
          >
            {isLoading ? "Отправка..." : "Отправить"}
          </Button>
        </form>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {hasRequiredApiKey()
                ? "Начните новый диалог! Напишите сообщение выше."
                : "Настройте API ключ для начала общения с ИИ."}
            </div>
          ) : (
            reversedMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg mb-3 last:mb-0 ${
                  message.role === "user"
                    ? "bg-green-50 border-l-4 border-green-500 ml-8"
                    : "bg-blue-50 border-l-4 border-blue-500 mr-8"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold">{message.role === "user" ? "Вы:" : "Ассистент:"}</div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(new Date(message.createdAt || Date.now()))}
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-blue-50 border-l-4 border-blue-500 mr-8 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold">Ассистент:</div>
                <div className="text-xs text-gray-500">{formatTimestamp(new Date())}</div>
              </div>
              <div className="text-sm">Печатает...</div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/5 bg-slate-700 text-white p-4 overflow-y-auto">
        <InstructionsModal instructions={instructions} onSave={handleInstructionsSave} />

        <ModelSelectionModal selectedModel={selectedModel} apiKeys={apiKeys} onSave={handleModelSave} />

        <div>
          <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-white">Быстрые ссылки</h2>
          <div className="space-y-2">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start text-white hover:bg-slate-600 p-2"
                onClick={() => window.open(link.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {link.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
