import fs from "fs/promises"
import path from "path"

const cemPath = "./custom-elements.json"
const outputDir = "./src/react-wrappers"

type CemEvent = { name: string }
type CemDecl = {
  kind: string
  customElement?: boolean
  tagName?: string
  name?: string
  events?: CemEvent[]
}
type Cem = { modules?: { declarations?: CemDecl[] }[] }

async function generate() {
  const cem: Cem = JSON.parse(await fs.readFile(cemPath, "utf-8"))

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })

  const indexLines: string[] = []

  for (const mod of cem.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (decl.kind !== "class" || !decl.customElement) continue
      if (!decl.tagName || !decl.name) continue

      const tagName = decl.tagName
      const className = decl.name
      const reactName = pascalFromTag(tagName)
      const fileBase = tagName
      const fileName = `${fileBase}.react.tsx`

      const events: Record<string, string> = {}
      for (const ev of decl.events ?? []) {
        const reactEvent = `on${ev.name
          .split("-")
          .map((p) => p[0].toUpperCase() + p.slice(1))
          .join("")}`
        events[reactEvent] = ev.name
      }

      const content = `import { createComponent } from '@lit/react'
import * as React from 'react'
import { ${className} } from '../components'

export const ${reactName} = createComponent({
  react: React as any,
  tagName: '${tagName}',
  elementClass: ${className},
  events: ${JSON.stringify(events, null, 2).replace(/"/g, "'")},
  displayName: '${reactName}',
})
`

      await fs.writeFile(path.join(outputDir, fileName), content)
      indexLines.push(`export * from './${fileBase}.react'`)
      console.log(`Generated ${fileName} (${reactName})`)
    }
  }

  indexLines.sort()
  await fs.writeFile(
    path.join(outputDir, "index.ts"),
    indexLines.join("\n") + "\n",
  )
  console.log(`Generated index.ts (${indexLines.length} wrappers)`)
}

function pascalFromTag(tag: string): string {
  return tag
    .split("-")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("")
}

generate().catch((err) => {
  console.error(err)
  process.exit(1)
})
