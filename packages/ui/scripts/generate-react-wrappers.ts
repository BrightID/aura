import fs from "fs/promises"
import path from "path"

const cemPath = "./custom-elements.json"
const outputDir = "./src/react-wrappers"

async function generate() {
  const cem = JSON.parse(await fs.readFile(cemPath, "utf-8"))

  await fs.mkdir(outputDir, { recursive: true })

  let indexFileContent = ""

  for (const mod of cem.modules || []) {
    for (const decl of mod.declarations || []) {
      if (decl.kind !== "class" || !decl.customElement) continue

      const tagName = decl.tagName
      const className = decl.name
      const fileName = `${toKebabCase(className)}.react.tsx`

      indexFileContent += `export * from './${toKebabCase(className)}.react'\n`

      // Build events map (onEventName → "event-name")
      const events: Record<string, string> = {}

      for (const ev of decl.events || []) {
        const reactName = `on${ev.name
          .split("-")
          .map((p: string) => p[0].toUpperCase() + p.slice(1))
          .join("")}`
        events[reactName] = ev.name
      }
      const content = `\
import { createComponent } from '@lit/react';
import * as React from 'react';
import { ${className} } from '../components';

export const ${className}React = createComponent({
  react: React as any,
  tagName: '${tagName}',
  elementClass: ${className},
  events: ${JSON.stringify(events, null, 2).replace(/"/g, "'")},
  displayName: '${className}',
});
`

      const outPath = path.join(outputDir, fileName)
      await fs.writeFile(outPath, content)
      console.log(`Generated ${fileName}`)
    }
  }

  await fs.writeFile(path.join(outputDir, "index.ts"), indexFileContent)
  console.log(`Generated index.ts`)
  console.log(`Done `)
}

function toKebabCase(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase → camel-Case
    .replace(/[_\s]+/g, "-") // spaces & underscores → hyphen
    .replace(/[^a-zA-Z0-9-]/g, "") // remove non-alphanumerics
    .replace(/--+/g, "-") // collapse multiple hyphens
    .toLowerCase()
}

generate().catch(console.error)
