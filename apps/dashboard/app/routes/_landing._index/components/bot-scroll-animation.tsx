"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { AnimatedBot } from "./bot-icon"
import { Button } from "@/components/ui/button"
import { Shield, Zap, Lock, GitBranch } from "lucide-react"

interface Bot {
  id: number
  x: number
  y: number
  delay: number
  variant: 1 | 2 | 3 | 4
}

export function ScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bots, setBots] = useState<Bot[]>([])
  const [isExiting, setIsExiting] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isComplete, setIsComplete] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const maxBots = 120

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const allBotPositions = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return []

    return Array.from({ length: maxBots }, (_, i) => ({
      id: i,
      x: 50 + Math.random() * (dimensions.width - 100),
      y: 50 + Math.random() * (dimensions.height - 100),
      delay: Math.random() * 0.8,
      variant: ((i % 4) + 1) as 1 | 2 | 3 | 4,
    }))
  }, [dimensions])

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      if (progress < 0.5) {
        setIsExiting(false)
        setShowMessage(false)
        setIsComplete(false)
        const numBots = Math.floor((progress * maxBots) / 0.5)
        setBots(allBotPositions.slice(0, numBots))
      } else if (progress >= 0.5 && progress < 0.6) {
        if (!isExiting) setIsExiting(true)
      } else if (progress >= 0.6) {
        setShowMessage(true)
        setIsComplete(true)
      }
    })

    return () => unsubscribe()
  }, [scrollYProgress, allBotPositions, isExiting])

  useEffect(() => {
    const onScroll = (e: Event) => {
      if (e.target !== document) return

      if (window.scrollY >= 8200) {
        setShowMessage(false)
        setIsComplete(false)
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const messageOpacity = useTransform(scrollYProgress, [0.6, 0.95], [0, 1])
  const messageScale = useTransform(scrollYProgress, [0.6, 0.95], [0.9, 1])

  return (
    <div ref={containerRef} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />

        <div className="fixed inset-0">
          <AnimatePresence>
            {bots.map((bot) => (
              <AnimatedBot
                key={bot.id}
                id={bot.id}
                initialX={bot.x}
                initialY={bot.y}
                delay={bot.delay}
                variant={bot.variant}
                isExiting={isExiting}
                isComplete={isComplete}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          style={{ opacity: messageOpacity, scale: messageScale }}
          className="fixed inset-0 flex flex-col items-center justify-center z-20 px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={showMessage ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative"
          >
            <motion.div
              className="fixed inset-0 rounded-full bg-primary/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              style={{
                width: 200,
                height: 200,
                margin: "auto",
                left: 0,
                right: 0,
                top: -40,
              }}
            />

            <Shield className="w-20 h-20 md:w-28 md:h-28 text-primary mx-auto mb-8 relative z-10" />
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-foreground mb-4 text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Say goodbye to bots
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl mb-8 text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Protect your application with our advanced bot detection solution
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button size="lg" className="gap-2 text-lg px-8">
              <Zap className="w-5 h-5" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 bg-transparent"
            >
              <GitBranch className="w-5 h-5" />
              Learn More
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12"
            initial={{ opacity: 0 }}
            animate={showMessage ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {[
              { label: "Regional Scaling", icon: Shield },
              { label: "Human-Backed Trust", icon: Zap },
              { label: "Private", icon: Lock },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm md:text-base">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
