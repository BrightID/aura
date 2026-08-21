export type Step = {
  icon: string
  title: string
  body: string
  href: string
  linkLabel: string
}

export const steps: Step[] = [
  {
    icon: "smartphone",
    title: "Step 1: Get BrightID",
    body: "Download the free BrightID app — your identity anchor, independent of any single product. It's the only account you'll need across the entire Aura network.",
    href: "https://brightid.gitbook.io/aura/getting-started/get-brightid",
    linkLabel: "Get BrightID",
  },
  {
    icon: "users",
    title: "Step 2: Make Real Connections",
    body: "Connect with people who actually know you — in person or online. A couple of trusted recovery connections go a long way toward a strong Aura score.",
    href: "https://brightid.gitbook.io/aura/getting-started/get-brightid",
    linkLabel: "See the connection guide",
  },
  {
    icon: "qr-code",
    title: "Step 3: Link to Aura",
    body: "Open Aura Verified and log in by scanning your BrightID QR code — no signup form, no password, no personal details to type in.",
    href: "/interface/login",
    linkLabel: "Open Aura Verified",
  },
  {
    icon: "eye-off",
    title: "Step 4: Get Evaluated",
    body: "People who already know you confirm you're a real, unique person. Nothing new about you is ever shared — Aura's privacy-preserving proofs see to that.",
    href: "https://brightid.gitbook.io/aura",
    linkLabel: "How evaluation works",
  },
  {
    icon: "sparkles",
    title: "Step 5: You're Verified",
    body: "Your Aura attestation is ready to use — log in, claim a grant, vote, or pass any check that needs a real human, anywhere Aura is accepted.",
    href: "/interface/login",
    linkLabel: "Get Verified now",
  },
]

export const faqItems = [
  {
    question: "Do I need to share my ID or a selfie?",
    answer:
      "No. Aura never asks for a government ID, a biometric scan, or any document. Verification comes from people who already know you, confirming what they already know.",
  },
  {
    question: "What is BrightID and why do I need it?",
    answer:
      "BrightID is the free app that anchors your identity through your social connections. It's the foundation Aura verification is built on — set it up once, and use it everywhere Aura is accepted.",
  },
  {
    question: "What do my connections actually see or share about me?",
    answer:
      "Nothing new. Evaluators only confirm things they already know — that you're a real, unique person. Aura's privacy-preserving proofs keep that confirmation from leaking any extra information, even to Aura itself.",
  },
  {
    question: "Can I use one Aura verification across multiple apps?",
    answer:
      "Yes. Verification is a portable attestation — get verified once in Aura Verified, then reuse the same proof anywhere that accepts Aura, from logins to governance votes to grant programs.",
  },
  {
    question: "Is Aura only for crypto apps?",
    answer:
      "No. Aura is domain-agnostic — it can verify uniqueness, certifications, community membership, and more, making it just as useful for grant programs and communities as it is for on-chain apps.",
  },
  {
    question: "Is Aura decentralized?",
    answer:
      "Yes. Evaluation is performed by an open network of independent participants, not a single company, so no one party controls who counts as verified.",
  },
]
