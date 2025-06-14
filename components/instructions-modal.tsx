"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface InstructionsModalProps {
  instructions: string
  onSave: (instructions: string) => void
}

export function InstructionsModal({ instructions, onSave }: InstructionsModalProps) {
  const [localInstructions, setLocalInstructions] = useState(instructions)
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    onSave(localInstructions)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700">Инструкции для Ассистента</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Инструкции для Ассистента</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            placeholder="Введите инструкции для ассистента..."
            className="min-h-[200px]"
          />
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
