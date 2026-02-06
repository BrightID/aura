"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  baseVx: number
  baseVy: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)

    const particleCount = 100
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const baseVx = (Math.random() - 0.5) * 0.5
      const baseVy = (Math.random() - 0.5) * 0.5
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseVx,
        baseVy,
        vx: baseVx,
        vy: baseVy,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        hue: Math.random() * 60 + 220, // Blue to purple range
      })
    }

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        const dx = particle.x - mousePosRef.current.x
        const dy = particle.y - mousePosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        // Only apply subtle force when mouse is near
        if (distance < maxDistance && distance > 0) {
          const force = (maxDistance - distance) / maxDistance
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance

          const targetVx = particle.baseVx + forceDirectionX * force * 0.15
          const targetVy = particle.baseVy + forceDirectionY * force * 0.15

          particle.vx += (targetVx - particle.vx) * 0.02
          particle.vy += (targetVy - particle.vy) * 0.02
        } else {
          particle.vx += (particle.baseVx - particle.vx) * 0.01
          particle.vy += (particle.baseVy - particle.vy) * 0.01
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        )
        gradient.addColorStop(
          0,
          `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`
        )
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  )
}
