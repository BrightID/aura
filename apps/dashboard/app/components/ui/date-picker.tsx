import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

export default function DatePicker({
  label = "",
  name = "date",
  defaultValue,
  onChange,
}: {
  label?: string
  name?: string
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(defaultValue)
  const [month, setMonth] = React.useState<Date | undefined>(defaultValue)
  const [value, setValue] = React.useState(formatDate(defaultValue))

  const handleSelect = (d: Date | undefined) => {
    setDate(d)
    setValue(formatDate(d))
    setOpen(false)
    onChange?.(d)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <Label htmlFor={name} className="px-1">
        {label}
      </Label>
      <div className="relative flex gap-2 w-full">
        <Input
          id={name}
          name={name}
          value={value}
          placeholder="Select date"
          className="bg-background pr-10"
          onChange={(e) => {
            const d = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(d)) {
              setDate(d)
              setMonth(d)
              onChange?.(d)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
