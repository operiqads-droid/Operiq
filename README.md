# Operiq

Shared Solana proof-of-attention and anti-fraud quality attribution for advertising and user acquisition.

Operiq is a public scoring contract, not a private ad black box. Every impression is scored the same way for advertisers and publishers. SOL settles only when the composite clears 62 and hard fraud flags (replayed nonce, Sybil cluster) are absent.

## What it does

- **Proof of attention** — dwell, interactions, velocity, and a one-time nonce.
- **Wallet quality** — age, program breadth, volume, counterparties, cluster size, retained actions.
- **Attribution** — funnel from scored impression to engaged, quality-pass, and settled SOL.
- **Verifier** — change the inputs and see the same decision the ledger uses.

## Demo surfaces

| Route | Role |
| --- | --- |
| `/` | Network overview and live campaigns |
| `/campaigns` | Launch, pause, and settle campaigns |
| `/wallets` | Inspect shared wallet quality |
| `/attribution` | Funnel and hold reasons |
| `/protocol` | Rules and interactive verifier |

Scoring lives in `src/lib/operiq/score.ts`. The demo ledger is local to the browser.
