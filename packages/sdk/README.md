# Aura Verified App

### web components and utility functionalities for aura verification system.

---

### What is Aura?

Aura is a decentralized platform for verifiying human uniqueness and identity

### [More on whats Aura](https://brightid.gitbook.io/aura)

<br>

## Get started

1. Install the package

Bun

```bash
bun add aura-get-verified
```

Yarn

```bash
yarn add aura-get-verified
```

npm

```bash
npm i aura-get-verified --save
```

<br>

2. Usage

- React

```tsx
import { AuraReactIFrameVerification } from 'aura-get-verified/react'

function VerificationFunction() {
  const onFrameReady = () => {
    console.log('Iframe verification is ready')
  }

  const onUserVerified = ({
    _s,
    _r
  }: {
    timestamp: number
    _v: number
    _r: number
    _s: number
  }) => {
    console.log('user is verified')
  }
  return (
    <AuraReactIFrameVerification
      onReady={onFrameReady}
      verificationSuccess={onUserVerified}
      height={550}
      projectId={4}
    ></AuraReactIFrameVerification>
  )
}
```

- Vue / Angular / Lit

```tsx
import 'aura-get-verified'

import { html } from 'lit'

// render this tag inside your html template

html`<iframe-project-verification
  onReady="{onFrameReady}"
  verificationSuccess="{onUserVerified}"
  height="{550}"
  projectId="{4}"
></iframe-project-verification>`
```

For getting a project id contact us on the [discord channel](https://discord.gg/kjjE5epB)
