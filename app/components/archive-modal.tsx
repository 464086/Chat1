"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Archive, RotateCcw, Trash2 } from "lucide-react"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

interface ArchiveModalProps {
  archivedChats: ChatSession[]
  onRestore: (chatId: string) => void
  onDeletePermanently: (chatId: string) => void
}

export function ArchiveModal({ archivedChats, onRestore, onDeletePermanently }: ArchiveModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700">
          <Archive className="w-4 h-4 mr-2" />
          Архив чатов ({archivedChats.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Архив чатов</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {archivedChats.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Архив пуст</div>
          ) : (
            archivedChats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-sm text-gray-500">{chat.createdAt.toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRestore(chat.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Восстановить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeletePermanently(chat.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
