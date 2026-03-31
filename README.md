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

## 🧱 Architecture

- **Frontend**: Next.js (App Router, React, TypeScript)
- **Blockchain**: tonweb (TON testnet)
- **Storage**: localStorage (mnemonic, recent addresses)
- **API**: toncenter public endpoint

No backend is used.

---

## 🔐 Security & UX Decisions

Since this is a frontend-only wallet, several lightweight protections were implemented:

### 1. Address Validation
- Basic format validation before sending

### 2. Clipboard Protection
- Detects if pasted address differs from original copied value
- Warns user before sending

### 3. New Address Warning
- Alerts user when sending to an unknown address

### 4. Confirmation Step
- User must confirm transaction details before sending

### 5. Address Similarity Check (basic)
- Detects addresses that are very similar to previously used ones
- Warns user about potential spoofing

### 6. UX Warnings Visibility
- Warnings are visually prominent and require explicit user confirmation before sending funds

---

## ⚖️ Trade-offs

- Mnemonic stored in localStorage (not secure, acceptable for testnet demo)
- No full phishing protection
- Uses public TON API (rate limits possible)
- No encryption layer

---

## 🤖 LLM-Assisted Development

This project was built using LLM tools (Trae IDE + Gemini 3 Flash).

### Workflow
- Decomposed tasks into small units
- Used LLM to generate modules (wallet, transactions, UI)
- Reviewed and refined outputs manually
- Implemented additional logic for edge cases and UX

### Example Prompts
- "Create TON wallet using tonweb with mnemonic generation"
- "Build React hook for fetching balance with polling"
- "Implement send transaction form with validation"
- "Add anti-scam checks for crypto wallet UI"

The LLM was used as a development agent, while I acted as orchestrator.

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
- Add QR code for receive
- Improve transaction decoding
- Add address book
- Better phishing detection heuristics
