# TON Agent Wallet

Frontend-only self-custodial wallet for TON testnet.  
Built with LLM-assisted development.

---

## ✨ Features

- Create new wallet (mnemonic-based)
- Import existing wallet
- View wallet address
- View balance (auto-updating)
- Transaction history with search
- Send TON with validation
- Clear success/error feedback after transaction submission
- Receive TON (copy address)
- Basic anti-scam protection

---

## 🚀 Implementation Completeness

The core wallet functionality is fully implemented:

- Wallet creation and import using mnemonic phrases
- Real-time balance polling via TON API
- Transaction history with basic search
- End-to-end send flow with validation and confirmation
- Receive flow via address copy

Additional safety features:
- Clipboard tampering detection
- Warnings for unknown or suspicious addresses
- Basic address similarity checks

### Limitations

- Mnemonic is stored unencrypted in `localStorage` (acceptable for testnet/demo scope)
- No backend or secure key management
- Uses public TON API (possible rate limits)
- Limited phishing detection heuristics

---

## 📱 UI/UX & Safety

The application is designed with a mobile-first, wallet-like experience in mind.

Key UX decisions:

- **Clear transaction flow**: input → validation → confirmation → result
- **Prevention of accidental actions**:
    - explicit confirmation step before sending
    - disabled actions during async operations
- **Real-time validation**:
    - address format
    - amount constraints (including insufficient balance)
- **Safety-first UX**:
    - warnings for unknown or suspicious addresses
    - detection of similar-looking addresses (anti-spoofing)
- **Feedback system**:
    - loading states during network operations
    - clear success/error notifications after transactions

---

## 🧪 Testing

Basic automated tests are implemented for critical logic and key UI behaviors.

Covered areas:

- **Validation logic**
    - invalid address format
    - invalid or excessive amount

- **Business logic**
    - preventing transactions with insufficient balance
    - successful transaction updates balance state

- **UI behavior**
    - disabled actions when input is invalid
    - loading/processing states during transaction flow

### Tools

- Vitest
- React Testing Library

Testing approach focuses on high-risk areas rather than full coverage.

---

## ⚖️ Trade-offs

Several intentional trade-offs were made to keep the implementation simple and focused:

- **localStorage for mnemonic**
    - Chosen for simplicity and zero-backend architecture
    - Not secure, but acceptable for a testnet/demo wallet

- **Client-side only architecture**
    - Improves privacy and reduces infrastructure complexity
    - Increases bundle size due to crypto libraries

- **Public TON API (toncenter)**
    - Allows fast integration without backend
    - May introduce rate limits and lower reliability under load

- **Limited security layer**
    - Focus on UX-level protections instead of full cryptographic security
    - Prioritized clarity and usability over production-grade hardening

---

## 🏗️ Architecture & Stack

### Stack

- Next.js (App Router, React, TypeScript)
- TonWeb (TON blockchain interaction)
- Tailwind CSS + Shadcn UI
- Public TON API (toncenter)

### Structure

The project follows a modular, separation-of-concerns approach:

- `components/` — UI components
- `hooks/` — business logic (balance, transactions)
- `lib/` — TON integration and utilities

### Rationale

- **Next.js** — fast setup, good DX, scalable if backend is added later
- **TonWeb** — stable and widely used TON library
- **Hooks-based architecture** — keeps UI and logic decoupled
- **No backend** — reduces complexity and aligns with assignment scope

The architecture is easily extensible to a full-stack solution if needed.

---

## 🤖 LLM-Assisted Development

LLM tools were used as a productivity layer during development.

- Used for scaffolding and generating repetitive code (hooks, UI blocks)
- Assisted with TON integration patterns and API usage
- All critical logic (transactions, validation, UX decisions) was reviewed and refined manually

The LLM acted as a development assistant, while architectural and security decisions were made explicitly.

---

## 🛠️ Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 🚧 Possible Improvements
- Encrypt mnemonic in storage
- Improve transaction decoding
- Add address book
- Better phishing detection heuristics
