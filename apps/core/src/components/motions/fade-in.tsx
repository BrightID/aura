import type { ParentProps } from "solid-js"
import { Motion } from "solid-motionone"

export interface FadeInProps extends ParentProps {
  delay: number
}

export default function FadeIn({ children, delay }: FadeInProps) {
  return (
    <Motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 1, easing: "ease-in-out", delay }}
    >
      {children}
    </Motion.div>
  )
}
