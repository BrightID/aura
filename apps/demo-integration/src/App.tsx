import { useCallback, useEffect, useMemo, useRef, useState } from "react"

/**
 * The message contract the Aura verification embed posts to `window.parent`.
 * Mirrors `packages/widgets/src/verification/index.ts` (`_handleContinue`) and
 * the listener on the interface `/dev` page (`apps/interface/src/routes/dev.ts`).
 *
 * The embed posts a JSON *string*, so the parent must `JSON.parse(e.data)`.
 */
interface VerificationSignature {
  r: string
  s: string
  v: number
}

interface AuraMessage {
  app: "aura-get-verified"
  type: "app-ready" | "verification-success"
  data?: {
    brightId?: string
    signature?: VerificationSignature
    auraLevel?: number
    auraScore?: number
  }
}

interface LogEntry {
  ts: string
  origin: string
  raw: string
  parsed?: AuraMessage
}

const DEFAULT_BASE_URL =
  (import.meta.env.VITE_AURA_EMBED_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "https://aura-get-verified.vercel.app"

const DEFAULT_PROJECT_ID = Number(import.meta.env.VITE_AURA_PROJECT_ID ?? 9)

function originOf(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return ""
  }
}

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className={`copy${done ? " done" : ""}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setDone(true)
        window.setTimeout(() => setDone(false), 1200)
      }}
    >
      {done ? "✓ Copied" : "Copy"}
    </button>
  )
}

export function App() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID)
  const [committed, setCommitted] = useState({
    baseUrl: DEFAULT_BASE_URL,
    projectId: DEFAULT_PROJECT_ID,
  })
  const [iframeKey, setIframeKey] = useState(0)

  const [result, setResult] = useState<AuraMessage["data"] | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const embedSrc = useMemo(
    () =>
      `${committed.baseUrl.replace(/\/$/, "")}/embed/projects/${committed.projectId}`,
    [committed],
  )
  const expectedOrigin = useMemo(() => originOf(committed.baseUrl), [committed])

  const onMessage = useCallback(
    (e: MessageEvent) => {
      // Only trust messages coming from the embed's own origin.
      if (expectedOrigin && e.origin !== expectedOrigin) return
      if (typeof e.data !== "string") return

      let parsed: AuraMessage | undefined
      try {
        parsed = JSON.parse(e.data) as AuraMessage
      } catch {
        return
      }
      if (parsed.app !== "aura-get-verified") return

      setLog((prev) =>
        [
          {
            ts: new Date().toLocaleTimeString(),
            origin: e.origin,
            raw: e.data,
            parsed,
          },
          ...prev,
        ].slice(0, 50),
      )

      if (parsed.type === "verification-success") {
        setResult(parsed.data ?? null)
      }
    },
    [expectedOrigin],
  )

  useEffect(() => {
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [onMessage])

  const applyConfig = () => {
    setResult(null)
    setLog([])
    setCommitted({ baseUrl: baseUrl.trim().replace(/\/$/, ""), projectId })
    setIframeKey((k) => k + 1)
  }

  const reloadIframe = () => {
    setResult(null)
    setIframeKey((k) => k + 1)
  }

  return (
    <div className="page">
      <header className="header">
        <div className="mark">🛡️</div>
        <div>
          <h1>
            Aura Verification
            <span className="tag">Demo Integration</span>
          </h1>
          <p className="sub">
            A third-party site embedding the Aura verification iframe. Complete
            the flow in the frame below; on success the embed posts the{" "}
            <code>brightId</code>, verification <code>signature</code>, level
            and score back to this page.
          </p>
        </div>
      </header>

      <div className="grid">
        <section className="panel">
          <div className="panel-head">
            <span className="dot live" />
            <h2>Embed</h2>
          </div>

          <div className="config">
            <label>
              <span>Base URL</span>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://aura-get-verified.vercel.app"
              />
            </label>
            <label className="short">
              <span>Project ID</span>
              <input
                type="number"
                value={projectId}
                onChange={(e) => setProjectId(Number(e.target.value))}
              />
            </label>
            <button className="primary" onClick={applyConfig}>
              Load
            </button>
            <button onClick={reloadIframe}>Reload</button>
          </div>

          <p className="src">
            <span className="method">GET</span>
            <code>{embedSrc}</code>
          </p>

          <div className="frame-wrap">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="Aura verification"
              src={embedSrc}
              height={600}
              allow="clipboard-write; publickey-credentials-get *; publickey-credentials-create *"
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className={`dot${result ? " live" : ""}`} />
            <h2>Result</h2>
          </div>
          {result ? (
            <div className="result">
              <div className="badge ok">✓ verification-success received</div>
              <dl>
                <div className="row">
                  <dt>BrightID</dt>
                  <dd>
                    <span className="val mono">{result.brightId ?? "—"}</span>
                    {result.brightId && <CopyButton value={result.brightId} />}
                  </dd>
                </div>
                <div className="row">
                  <dt>Aura level</dt>
                  <dd>{result.auraLevel ?? "—"}</dd>
                </div>
                <div className="row">
                  <dt>Aura score</dt>
                  <dd className="mono">{result.auraScore ?? "—"}</dd>
                </div>
                <div className="row">
                  <dt>Signature</dt>
                  <dd>
                    {result.signature ? (
                      <>
                        <pre className="sig mono">
                          {JSON.stringify(result.signature, null, 2)}
                        </pre>
                        <CopyButton value={JSON.stringify(result.signature)} />
                      </>
                    ) : (
                      <span className="muted">
                        no signature (unverified / API failed)
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="empty">
              <span className="glyph">⏳</span>
              <p>Waiting for the user to finish verification…</p>
            </div>
          )}

          <div className="log-head">
            <h3>Message log</h3>
            {log.length > 0 && <span className="count">{log.length}</span>}
          </div>
          {log.length === 0 ? (
            <div className="empty">
              <span className="glyph">📡</span>
              <p>
                No <code>aura-get-verified</code> messages yet.
              </p>
            </div>
          ) : (
            <ul className="log">
              {log.map((entry, i) => (
                <li key={i}>
                  <span className="ts">{entry.ts}</span>
                  <span
                    className={`type ${entry.parsed?.type === "verification-success" ? "success" : "ready"}`}
                  >
                    {entry.parsed?.type}
                  </span>
                  <span className="origin">{entry.origin}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
