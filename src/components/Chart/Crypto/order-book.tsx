"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const generateOrderBook = (basePrice: number, depth: number) => {
  const asks = []
  const bids = []

  for (let i = 0; i < depth; i++) {
    const askPrice = basePrice + i * 5 + Math.random() * 2
    const askAmount = +(Math.random() * 2).toFixed(4)
    asks.push({
      price: askPrice,
      amount: askAmount,
      total: +(askPrice * askAmount).toFixed(2),
      type: "sell",
    })

    const bidPrice = basePrice - i * 5 - Math.random() * 2
    const bidAmount = +(Math.random() * 2).toFixed(4)
    bids.push({
      price: bidPrice,
      amount: bidAmount,
      total: +(bidPrice * bidAmount).toFixed(2),
      type: "buy",
    })
  }

  return [...asks.reverse(), ...bids]
}

export default function OrderBook() {
  const [orders, setOrders] = useState(generateOrderBook(45000, 10))

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(generateOrderBook(45000, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="text-xl font-bold text-gray-100 mb-4">Order Book</div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Price (USDT)</TableHead>
            <TableHead className="text-gray-400 text-right">Amount (BTC)</TableHead>
            <TableHead className="text-gray-400 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={index} className="border-gray-800 hover:bg-gray-800/50">
              <TableCell className={`font-medium ${order.type === "sell" ? "text-red-500" : "text-green-500"}`}>
                {order.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-gray-300">{order.amount.toFixed(4)}</TableCell>
              <TableCell className="text-right text-gray-300">{order.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

