import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LevelBadge } from "./level-badge"
import type { AuraPlayer } from "./types"

interface FindPlayersStepProps {
  userId?: string
  onBack: () => void
  onSelectPlayer: (playerId: string) => void
}

// Mock data for demo - will be resolved from contact book in production
const mockPlayers: AuraPlayer[] = [
  {
    id: "aura_1",
    name: "Alex Chen",
    level: 3,
    isOnline: true,
    mutualConnections: 5,
  },
  {
    id: "aura_2",
    name: "Jordan Lee",
    level: 2,
    isOnline: true,
    mutualConnections: 3,
  },
  {
    id: "aura_3",
    name: "Sam Rivera",
    level: 2,
    isOnline: false,
    mutualConnections: 2,
  },
  {
    id: "aura_4",
    name: "Taylor Kim",
    level: 1,
    isOnline: true,
    mutualConnections: 1,
  },
  {
    id: "aura_5",
    name: "Morgan Wu",
    level: 3,
    isOnline: false,
    mutualConnections: 4,
  },
]

export function FindPlayersStep({
  userId,
  onBack,
  onSelectPlayer,
}: FindPlayersStepProps) {
  const [showQR, setShowQR] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPlayers = mockPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `aura://connect/${userId || "new-user"}`
  )}&bgcolor=1a1a2e&color=4ade80`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="font-semibold text-foreground">Find Aura Players</h2>
      </div>

      {/* QR Code Section */}
      <div className="relative">
        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between hover:bg-secondary/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Show my QR Code
              </p>
              <p className="text-xs text-muted-foreground">
                Let others scan to connect
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${showQR ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showQR && (
          <div className="mt-3 p-4 bg-card rounded-xl border border-border flex flex-col items-center gap-3">
            <div className="p-3 bg-[#1a1a2e] rounded-xl">
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="Your Aura QR Code"
                className="w-[180px] h-[180px] rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Others can scan this to connect and evaluate you
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Players List */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground px-1">
          From your contacts ({filteredPlayers.length})
        </p>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className="w-full p-3 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border/50 flex items-center gap-3 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {player.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                {player.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-aura-success rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">
                  {player.name}
                </p>
                <div className="flex items-center gap-2">
                  <LevelBadge level={player.level} size="xs" />
                  {player.mutualConnections && (
                    <span className="text-xs text-muted-foreground">
                      {player.mutualConnections} mutual
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Scan QR Button */}
      <Button variant="outline" className="w-full bg-transparent" size="sm">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Scan QR Code
      </Button>
    </div>
  )
}
