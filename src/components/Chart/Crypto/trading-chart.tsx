"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

const generateData = (count: number, interval: number) => {
  const data = []
  let price = 45000
  let date = new Date()

  for (let i = 0; i < count; i++) {
    const open = price + Math.random() * 200 - 100
    const close = open + Math.random() * 200 - 100
    const high = Math.max(open, close) + Math.random() * 100
    const low = Math.min(open, close) - Math.random() * 100
    const volume = Math.floor(Math.random() * 1000) + 500

    data.push({
      time: date.getTime() / 1000,
      open,
      high,
      low,
      close,
      volume,
    })

    date = new Date(date.getTime() - interval * 60000)
    price = close
  }

  return data.reverse()
}

export default function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [interval, setInterval] = useState(15)
  const [data, setData] = useState(generateData(100, interval))
  const [hoveredCandle, setHoveredCandle] = useState<any>(null)
  const [selectedCandle, setSelectedCandle] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseOnChart, setIsMouseOnChart] = useState(false)

  useEffect(() => {
    setData(generateData(100, interval))
  }, [interval])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawChart = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const padding = { top: 20, right: 50, bottom: 30, left: 50 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom

      const minPrice = Math.min(...data.map((d) => d.low))
      const maxPrice = Math.max(...data.map((d) => d.high))
      const priceRange = maxPrice - minPrice

      // Grid lines
      ctx.strokeStyle = "#2d3748"
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let i = 1; i < 5; i++) {
        const y = padding.top + (i * chartHeight) / 5
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
      }
      ctx.stroke()

      // Candlesticks
      const candleWidth = chartWidth / data.length
      data.forEach((candle, i) => {
        const x = padding.left + i * candleWidth
        const openY = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight + padding.top
        const closeY = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight + padding.top
        const highY = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight + padding.top
        const lowY = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight + padding.top

        // Body
        ctx.fillStyle = candle.open > candle.close ? "#ef4444" : "#22c55e"
        ctx.fillRect(x, Math.min(openY, closeY), candleWidth - 1, Math.abs(closeY - openY))

        // Wick
        ctx.strokeStyle = ctx.fillStyle
        ctx.beginPath()
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()

        // Volume
        const volumeHeight = (candle.volume / 1000) * 20 // Adjust the multiplier to change volume bar height
        ctx.fillStyle = candle.open > candle.close ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)"
        ctx.fillRect(x, canvas.height - padding.bottom - volumeHeight, candleWidth - 1, volumeHeight)
      })

      // Price axis
      ctx.fillStyle = "#9ca3af"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i * chartHeight) / 5
        const price = maxPrice - (i * priceRange) / 5
        ctx.fillText(price.toFixed(2), canvas.width - padding.right + 5, y)
      }

      // Time axis
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      const timeFormat = interval >= 1440 ? "MMM dd" : interval >= 60 ? "HH:mm" : "HH:mm:ss"
      for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 5))) {
        const x = padding.left + i * candleWidth
        const date = new Date(data[i].time * 1000)
        ctx.fillText(format(date, timeFormat), x, canvas.height - padding.bottom + 5)
      }

      // Selected candle
      if (selectedCandle) {
        const index = data.findIndex((d) => d.time === selectedCandle.time)
        const x = padding.left + index * candleWidth + candleWidth / 2
        ctx.strokeStyle = "#60a5fa"
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, canvas.height - padding.bottom)
        const y = chartHeight - ((selectedCandle.close - minPrice) / priceRange) * chartHeight + padding.top
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Crosshair
      if (hoveredCandle && isMouseOnChart) {
        const index = data.findIndex((d) => d.time === hoveredCandle.time)
        const x = padding.left + index * candleWidth + candleWidth / 2
        const y = mousePosition.y

        ctx.strokeStyle = "#60a5fa"
        ctx.lineWidth = 0.5
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, canvas.height - padding.bottom)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    drawChart()

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const candleWidth = (canvas.width - 100) / data.length
      const index = Math.floor((x - 50) / candleWidth)

      setMousePosition({ x, y })
      setIsMouseOnChart(true)

      if (index >= 0 && index < data.length) {
        setHoveredCandle(data[index])
      } else {
        setHoveredCandle(null)
      }
      drawChart()
    }

    const handleMouseLeave = () => {
      setIsMouseOnChart(false)
      drawChart()
    }

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const candleWidth = (canvas.width - 100) / data.length
      const index = Math.floor((x - 50) / candleWidth)

      if (index >= 0 && index < data.length) {
        setSelectedCandle(data[index])
      } else {
        setSelectedCandle(null)
      }
      drawChart()
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("click", handleClick)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("click", handleClick)
    }
  }, [data, hoveredCandle, selectedCandle, mousePosition, interval, isMouseOnChart])

  const CandleInfo = ({ candle, isSelected = false }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`absolute top-4 left-4 bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg ${isSelected ? "border-blue-500" : ""}`}
    >
      <p className="text-gray-200 font-bold mb-1">{format(new Date(candle.time * 1000), "MMMM dd, yyyy HH:mm")}</p>
      <p className="text-gray-200">
        Open: <span className="font-mono">{candle.open.toFixed(2)}</span>
      </p>
      <p className="text-gray-200">
        High: <span className="font-mono">{candle.high.toFixed(2)}</span>
      </p>
      <p className="text-gray-200">
        Low: <span className="font-mono">{candle.low.toFixed(2)}</span>
      </p>
      <p className="text-gray-200">
        Close: <span className="font-mono">{candle.close.toFixed(2)}</span>
      </p>
      <p className="text-gray-200">
        Volume: <span className="font-mono">{candle.volume.toFixed(2)}</span>
      </p>
    </motion.div>
  )

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-2xl font-bold text-gray-100 mb-2 sm:mb-0">BTC/USDT</div>
        <div className="flex flex-wrap justify-center gap-2">
          {[5, 15, 30, 60, 240, 1440].map((int) => (
            <motion.button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-3 py-1 rounded ${
                interval === int ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {int === 1440 ? "1d" : int === 60 ? "1h" : int === 240 ? "4h" : `${int}m`}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-[300px] sm:h-[400px]" />
        <AnimatePresence>
          {isMouseOnChart && hoveredCandle && <CandleInfo candle={hoveredCandle} />}
          {!isMouseOnChart && selectedCandle && <CandleInfo candle={selectedCandle} isSelected={true} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

