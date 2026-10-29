export const JSON_TEMPLATE = {
  format: 'upgrade-myself-pack',
  version: 1,
  title: 'Security deep-dive',
  weeks: [
    {
      title: 'Auth & Secrets',
      subtitle: 'How logins and keys really work',
      emoji: '🔐',
      outcome: 'Explain sessions, tokens and where secrets belong.',
      concepts: [
        {
          id: 'passkeys',
          title: 'Passkeys',
          emoji: '🗝️',
          minutes: 8,
          tldr: 'A passkey replaces your password with a cryptographic key pair stored on your device.',
          explain: 'Your device keeps a **private key**; the website only stores the matching **public key**. To log in you unlock the device (Face ID, fingerprint) and it signs a challenge.\n\n- Nothing secret is sent over the network\n- Phishing sites cannot reuse it\n- Syncs across devices through your platform account',
          analogy: 'Like a door lock that only opens for a key that never leaves your pocket — the lock keeps just the key’s shape.',
          why: 'When an AI assistant proposes password auth, you can ask: “can we use passkeys / OAuth instead?”',
          example: '```text\nBrowser → site: "prove you own this account" (challenge)\nDevice  → site: signature made with the private key\nSite verifies with the stored public key ✓\n```',
          takeaways: ['Private key never leaves the device', 'Passkeys resist phishing', 'Based on the WebAuthn standard'],
          glossary: [
            { term: 'WebAuthn', def: 'The browser standard behind passkeys.' },
            { term: 'Public-key cryptography', def: 'Two linked keys: one signs, the other verifies.' },
          ],
          quiz: [
            {
              q: 'Where does the private key of a passkey live?',
              options: ['On the website’s server', 'On your device', 'In a cookie', 'In the URL'],
              answer: 1,
              why: 'Only the public key is stored by the site; the private key stays on your device.',
            },
          ],
        },
      ],
    },
  ],
}

export const MD_TEMPLATE = `---
title: Security deep-dive
---

# Week: Auth & Secrets

## Passkeys {#passkeys}
<!-- emoji: 🗝️ | minutes: 8 | related: auth-sessions-jwt-oauth -->

**TL;DR:** A passkey replaces your password with a cryptographic key pair stored on your device.

### Explain
Your device keeps a **private key**; the website only stores the matching **public key**. To log in you unlock the device and it signs a challenge.

- Nothing secret travels over the network
- Phishing sites cannot reuse it

### Analogy
A lock that only opens for a key that never leaves your pocket.

### Why it matters
When an assistant proposes password auth, you can ask for passkeys or OAuth instead.

### Example
\`\`\`text
Browser → site: challenge
Device  → site: signature (private key)
Site verifies with the public key ✓
\`\`\`

### Takeaways
- The private key never leaves the device
- Passkeys resist phishing
- Built on the WebAuthn standard

### Glossary
- **WebAuthn** — the browser standard behind passkeys.
- **Public-key cryptography** — two linked keys: one signs, the other verifies.

### Quiz
**Q:** Where does the private key of a passkey live?
- [ ] On the website's server
- [x] On your device
- [ ] In a cookie
- [ ] In the URL
*Why:* Only the public key is stored by the site.
`

export const AI_PROMPT = `Create a learning pack for me about: [TOPIC / paste your notes here].

Return ONLY valid JSON (no prose, no code fences) in exactly this shape:
{
  "format": "upgrade-myself-pack", "version": 1,
  "title": "<pack title>",
  "weeks": [
    {
      "title": "<week title>", "subtitle": "<one line>", "emoji": "<emoji>", "outcome": "By the end you can …",
      "concepts": [
        {
          "id": "kebab-case-id", "title": "<concept>", "emoji": "<emoji>", "minutes": 8,
          "tldr": "<one plain sentence, max 28 words>",
          "explain": "<110-190 words, markdown allowed>",
          "analogy": "<1-2 sentences>",
          "why": "<why it matters to someone who builds with AI assistants and doesn't memorise syntax>",
          "example": "<concrete scenario, prompt or short code block>",
          "takeaways": ["…", "…", "…"],
          "glossary": [{"term": "…", "def": "…"}],
          "quiz": [{"q": "…", "options": ["…","…","…","…"], "answer": 0, "why": "…"}]
        }
      ]
    }
  ]
}
Rules: 6-8 concepts per week, plain language, define jargon on first use, 2 quiz questions per concept ("answer" is the zero-based index of the correct option), and vary which option is correct. If a concept already exists in my course, reuse its id so it updates in place.`
