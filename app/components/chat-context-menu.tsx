"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Edit, Archive, Trash2 } from "lucide-react"

interface ChatContextMenuProps {
  chatId: string
  chatTitle: string
  onRename: (chatId: string, newTitle: string) => void
  onArchive: (chatId: string) => void
  onDelete: (chatId: string) => void
}

export function ChatContextMenu({ chatId, chatTitle, onRename, onArchive, onDelete }: ChatContextMenuProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(chatTitle)

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== chatTitle) {
      onRename(chatId, newTitle.trim())
    }
    setIsRenameOpen(false)
  }

  const handleRenameClick = () => {
    setNewTitle(chatTitle)
    setIsRenameOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-slate-600">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleRenameClick} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Переименовать
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive(chatId)} className="cursor-pointer">
            <Archive className="mr-2 h-4 w-4" />В архив
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(chatId)} className="cursor-pointer text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать чат</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Введите новое название..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename()
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleRename}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
