"use client"

import { Card } from "@/components/ui/card"

export function FoodAnalysisLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-800 text-center">
        {/* Animated Scanner */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-3xl" />
          <div className="absolute inset-0 border-4 border-[#c9fa5f] rounded-3xl animate-pulse" />
          <div className="absolute inset-4 bg-[#c9fa5f]/20 rounded-2xl animate-pulse" />
          
          {/* Scanning Line */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="h-1 w-full bg-[#c9fa5f] animate-scan" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Food</h3>
        <p className="text-sm text-gray-400 mb-6">
          Our AI is examining your meal...
        </p>

        {/* Progress Steps */}
        <div className="space-y-3 text-left">
          {[
            { label: "Identifying ingredients", delay: 0 },
            { label: "Calculating nutrition", delay: 1 },
            { label: "Generating insights", delay: 2 },
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 animate-fadeIn"
              style={{ animationDelay: `${step.delay * 0.3}s` }}
            >
              <div className="w-2 h-2 rounded-full bg-[#c9fa5f] animate-pulse" />
              <span className="text-sm text-gray-300">{step.label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This usually takes 5-8 seconds
        </p>
      </Card>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(120px);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}