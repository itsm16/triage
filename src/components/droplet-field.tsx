"use client";

import { useEffect, useRef } from "react"

interface Droplet {
  baseX: number
  baseY: number
  r: number
  phase: number
}

const COLOR = "56, 85, 255"

export function DropletField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = window.devicePixelRatio || 1
    let droplets: Droplet[] = []

    const initDroplets = () => {
      const s = Math.min(w, h)
      droplets = [
        { baseX: w * 0.2, baseY: h * 0.25 - 10, r: s * 0.28, phase: 0 },
        { baseX: w * 0.8, baseY: h * 0.75 + 10, r: s * 0.28, phase: Math.PI },
      ]
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initDroplets()
    }
    resize()
    window.addEventListener("resize", resize)

    const animate = (ts: number) => {
      const t = ts * 0.0004
      ctx.clearRect(0, 0, w, h)

      for (const d of droplets) {
        const xOff = Math.sin(t * 0.6 + d.phase) * 40
        const yOff = Math.cos(t * 0.5 + d.phase) * 30
        const cx = d.baseX + xOff
        const cy = d.baseY + yOff

        ctx.beginPath()
        ctx.arc(cx, cy, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR}, 0.3)`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{ backdropFilter: "blur(10px)" }}
      />
    </div>
  )
}
