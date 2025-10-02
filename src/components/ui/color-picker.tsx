"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  className?: string
}

// Predefined beautiful color palette
const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#a855f7', // Violet
  '#22c55e', // Green
  '#eab308', // Yellow
  '#e11d48', // Rose
  '#64748b', // Slate
]

// Function to generate a random hex color
const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Function to validate hex color
const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

// Function to normalize hex color (convert 3-digit to 6-digit)
const normalizeHex = (hex: string): string => {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  return hex.toUpperCase()
}

// Function to get contrasting text color
const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

export function ColorPicker({ value = '#3b82f6', onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isValidInput, setIsValidInput] = useState(true)

  useEffect(() => {
    setInputValue(value)
    setIsValidInput(isValidHex(value))
  }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    
    if (isValidHex(newValue)) {
      setIsValidInput(true)
      const normalized = normalizeHex(newValue)
      onChange(normalized)
    } else {
      setIsValidInput(false)
    }
  }

  const handlePresetSelect = (color: string) => {
    setInputValue(color)
    setIsValidInput(true)
    onChange(color)
  }

  const handleGenerateRandom = () => {
    const randomColor = generateRandomColor()
    setInputValue(randomColor)
    setIsValidInput(true)
    onChange(randomColor)
  }

  const currentColor = isValidInput ? value : '#3b82f6'

  return (
    <div className={cn("space-y-4", className)}>
      {/* Color Preview */}
      <div className="flex items-center gap-4">
        <div 
          className="size-12 rounded-lg border-2 border-red-500 shadow-sm flex items-center justify-center transition-all duration-200"
          style={{ backgroundColor: currentColor }}
        >
          <Palette 
            className="w-6 h-6" 
            style={{ color: getContrastColor(currentColor) }}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="color-input" className="text-sm font-medium">
            Primary Color
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            This color will be used for branding and UI elements
          </p>
        </div>
      </div>

      {/* Hex Input */}
      <div className="space-y-2">
        <Label htmlFor="color-input">Hex Color Code</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="color-input"
              type="text"
              placeholder="#3b82f6"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={cn(
                "font-mono pr-10",
                !isValidInput && "border-red-500 focus:ring-red-500"
              )}
            />
            {isValidInput && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGenerateRandom}
            className="shrink-0"
            title="Generate random color"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        {!isValidInput && (
          <p className="text-sm text-red-600">
            Please enter a valid hex color (e.g., #3b82f6 or #fff)
          </p>
        )}
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <Label>Quick Select Colors</Label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetSelect(color)}
              className={cn(
                "w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                value === color 
                  ? "border-gray-900 shadow-lg scale-110" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {value === color && (
                <Check 
                  className="w-4 h-4 mx-auto" 
                  style={{ color: getContrastColor(color) }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Info */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <p className="font-medium mb-1">Color Preview:</p>
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-1 rounded text-xs font-mono"
            style={{ 
              backgroundColor: currentColor, 
              color: getContrastColor(currentColor) 
            }}
          >
            {currentColor}
          </span>
          <span className="text-muted-foreground">
            This is how your brand color will look in the interface
          </span>
        </div>
      </div>
    </div>
  )
}