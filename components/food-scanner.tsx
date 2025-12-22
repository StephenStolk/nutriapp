"use client"

import { useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Barcode, FileText, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FoodScannerProps {
  onScanComplete: (image: string, scanType: 'food' | 'barcode' | 'label') => void
  isAnalyzing: boolean
}

export function FoodScanner({ onScanComplete, isAnalyzing }: FoodScannerProps) {
  const [selectedMode, setSelectedMode] = useState<'food' | 'barcode' | 'label'>('food')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Camera error:", error)
      alert("Unable to access camera. Please use file upload instead.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setPreview(imageData)
      stopCamera()
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setPreview(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScan = () => {
    if (preview) {
      onScanComplete(preview, selectedMode)
    }
  }

  const modes = [
    { id: 'food', label: 'Scan Food', icon: Camera, color: 'bg-[#c9fa5f]' },
    { id: 'barcode', label: 'Barcode', icon: Barcode, color: 'bg-blue-500' },
    { id: 'label', label: 'Food Label', icon: FileText, color: 'bg-purple-500' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all",
                selectedMode === mode.id
                  ? `${mode.color} border-transparent text-black`
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
              )}
            >
              <Icon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs font-semibold">{mode.label}</p>
            </button>
          )
        })}
      </div>

      {/* Camera/Preview Area */}
      <Card className="relative aspect-[4/3] bg-black border-gray-800 rounded-3xl overflow-hidden">
        {!preview && !isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#c9fa5f]/10 flex items-center justify-center mb-4">
              <Camera className="h-10 w-10 text-[#c9fa5f]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {selectedMode === 'food' && "Scan Your Meal"}
              {selectedMode === 'barcode' && "Scan Barcode"}
              {selectedMode === 'label' && "Scan Nutrition Label"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {selectedMode === 'food' && "Point camera at your food"}
              {selectedMode === 'barcode' && "Align barcode in the frame"}
              {selectedMode === 'label' && "Capture the nutrition facts"}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={startCamera}
                className="bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
              >
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Upload Image
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {isCameraActive && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[80%] aspect-[4/3]">
                <div className="absolute inset-0 border-4 border-[#c9fa5f] rounded-3xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#c9fa5f] rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#c9fa5f] rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#c9fa5f] rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#c9fa5f] rounded-br-3xl" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="w-16 h-16 rounded-full bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <Button
                onClick={stopCamera}
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-gray-700 text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}

        {preview && (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
              <Button
                onClick={handleScan}
                disabled={isAnalyzing}
                size="lg"
                className="bg-[#c9fa5f] text-black hover:bg-[#b8e954] min-w-[140px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Food
                  </>
                )}
              </Button>
              <Button
                onClick={() => setPreview(null)}
                size="lg"
                variant="outline"
                className="border-gray-700 text-white"
                disabled={isAnalyzing}
              >
                Retake
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Tips */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <h4 className="text-sm font-semibold text-white mb-2">Tips for best results:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          {selectedMode === 'food' && (
            <>
              <li>• Ensure good lighting</li>
              <li>• Capture the entire plate</li>
              <li>• Keep camera steady</li>
            </>
          )}
          {selectedMode === 'barcode' && (
            <>
              <li>• Align barcode in center</li>
              <li>• Avoid glare and shadows</li>
              <li>• Hold camera steady</li>
            </>
          )}
          {selectedMode === 'label' && (
            <>
              <li>• Capture full nutrition facts panel</li>
              <li>• Ensure text is clear and readable</li>
              <li>• Avoid glare on packaging</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  )
}