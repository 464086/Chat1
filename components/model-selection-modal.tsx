"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Settings } from "lucide-react"

interface Model {
  id: string
  name: string
  provider: string
  displayName: string
}

interface ModelSelectionModalProps {
  selectedModel: Model
  apiKeys: Record<string, string>
  onSave: (model: Model, apiKeys: Record<string, string>) => void
}

const availableModels: Model[] = [
  // OpenAI Models
  { id: "gpt-4-turbo", name: "gpt-4-turbo", provider: "openai", displayName: "GPT-4 Turbo (OpenAI)" },
  { id: "gpt-4", name: "gpt-4", provider: "openai", displayName: "GPT-4 (OpenAI)" },
  { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", provider: "openai", displayName: "GPT-3.5 Turbo (OpenAI)" },

  // Anthropic Models
  {
    id: "claude-3-opus",
    name: "claude-3-opus-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Opus (Anthropic)",
  },
  {
    id: "claude-3-sonnet",
    name: "claude-3-sonnet-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Sonnet (Anthropic)",
  },
  {
    id: "claude-3-haiku",
    name: "claude-3-haiku-20240307",
    provider: "anthropic",
    displayName: "Claude 3 Haiku (Anthropic)",
  },

  // Google Models - Updated with correct model names
  { id: "gemini-2.0-flash", name: "gemini-2.0-flash", provider: "google", displayName: "Gemini 2.0 Flash (Google)" },
  {
    id: "gemini-2.5-flash-preview",
    name: "gemini-2.5-flash-preview-05-20",
    provider: "google",
    displayName: "Gemini 2.5 Flash Preview (Google)",
  },
  {
    id: "gemini-2.5-pro-preview",
    name: "gemini-2.5-pro-preview-06-05",
    provider: "google",
    displayName: "Gemini 2.5 Pro Preview (Google)",
  },
  { id: "gemini-pro", name: "gemini-pro", provider: "google", displayName: "Gemini Pro (Google)" },
  {
    id: "gemini-pro-vision",
    name: "gemini-pro-vision",
    provider: "google",
    displayName: "Gemini Pro Vision (Google)",
  },
]

export function ModelSelectionModal({ selectedModel, apiKeys, onSave }: ModelSelectionModalProps) {
  const [localModel, setLocalModel] = useState(selectedModel)
  const [localApiKeys, setLocalApiKeys] = useState(apiKeys)
  const [isOpen, setIsOpen] = useState(false)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)

  const handleSave = () => {
    onSave(localModel, localApiKeys)
    setIsOpen(false)
  }

  const handleApiKeyChange = (provider: string, value: string) => {
    setLocalApiKeys((prev) => ({ ...prev, [provider]: value }))
  }

  const testConnection = async (provider: string) => {
    const apiKey = localApiKeys[provider]
    if (!apiKey) {
      alert(`Пожалуйста, введите API ключ для ${provider}`)
      return
    }

    setTestingProvider(provider)
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Подключение к ${provider.toUpperCase()} успешно!`)
      } else {
        alert(`❌ Ошибка подключения к ${provider.toUpperCase()}: ${result.error}`)
      }
    } catch (error) {
      console.error("Test connection error:", error)
      alert(`❌ Ошибка тестирования ${provider.toUpperCase()}`)
    } finally {
      setTestingProvider(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700">
          <Settings className="w-4 h-4 mr-2" />
          Выбор Модели
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбор Модели ИИ</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Выберите модель:</Label>
            <RadioGroup
              value={localModel.id}
              onValueChange={(value) => {
                const model = availableModels.find((m) => m.id === value)
                if (model) setLocalModel(model)
              }}
              className="mt-2"
            >
              {availableModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.id} id={model.id} />
                  <Label htmlFor={model.id} className="cursor-pointer">
                    {model.displayName}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">API Ключи:</Label>

            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-sm font-medium">
                OpenAI API Key:
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="openai-key"
                  type="password"
                  value={localApiKeys.openai || ""}
                  onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection("openai")}
                  disabled={testingProvider === "openai"}
                >
                  {testingProvider === "openai" ? "..." : "Тест"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic-key" className="text-sm font-medium">
                Anthropic API Key:
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="anthropic-key"
                  type="password"
                  value={localApiKeys.anthropic || ""}
                  onChange={(e) => handleApiKeyChange("anthropic", e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection("anthropic")}
                  disabled={testingProvider === "anthropic"}
                >
                  {testingProvider === "anthropic" ? "..." : "Тест"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-key" className="text-sm font-medium">
                Google AI Studio API Key:
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="google-key"
                  type="password"
                  value={localApiKeys.google || ""}
                  onChange={(e) => handleApiKeyChange("google", e.target.value)}
                  placeholder="AI..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection("google")}
                  disabled={testingProvider === "google"}
                >
                  {testingProvider === "google" ? "..." : "Тест"}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Как получить API ключи:</h4>
            <ul className="text-xs space-y-1">
              <li>
                <strong>OpenAI:</strong> platform.openai.com → API Keys
              </li>
              <li>
                <strong>Anthropic:</strong> console.anthropic.com → API Keys
              </li>
              <li>
                <strong>Google:</strong> aistudio.google.com → Get API Key
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
