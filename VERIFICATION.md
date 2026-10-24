# SCRIBE Verification Manifest

> Every row must show ✅ VERIFIED (test passing), 🟡 IN PROGRESS (code exists, test failing/incomplete), or ⚪ NOT STARTED.
> Nothing moves to the deck until it's ✅.

## Foundation
| Feature | Status | Verification |
|---|---|---|
| Turso DB connected | ✅ | `scripts/push-schema.mjs` succeeded |
| Ledger: hash chain + Ed25519 | ✅ | `scripts/test-ledger.ts` passes |
| Tamper detection | ✅ | test-ledger: edit record → verify fails at #2 |
| Reconciliation engine | ✅ | test-reconcile: 8-unit variance, refuses without count |
| Consistency Score | ✅ | test-score: range + counterfactuals + invariance |
| Seeded demo (18 records) | ✅ | seed-demo prints chain intact, variance −8 |
| Judge Mode API (5 routes) | ✅ | test-judge-api: inject → variance changes; tamper → chain breaks; reset → restored |
| Auth (login/signup/logout/session) | 🟡 | Code exists, end-to-end browser test pending |
| Multi-business per user | 🟡 | Schema + /dashboard list exists, business switching UI pending |
| Onboarding (empty-state, no fake numbers) | 🟡 | /onboarding exists, empty dashboard state pending |

## Themba
| Feature | Status | Verification |
|---|---|---|
| Grounded answers with cited records | ✅ | test-themba-v2 (TBD) |
| Pre-flight refusals (credit, advice, theft) | ✅ | test-themba: 4 refusal tests |
| Deterministic fallback (no LLM) | ✅ | test-themba (fallback mode) |
| **Flexible, conversational answers** | 🟡 | This delivery |
| **Multi-turn conversation memory** | 🟡 | This delivery |
| **Suggested actions (draft message, plan, task)** | 🟡 | This delivery |
| **Explicit reasoning about trade-offs and flaws** | 🟡 | This delivery |

## Records & Evidence
| Feature | Status | Verification |
|---|---|---|
| Forensic ledger view | ✅ | /demo/[id] → Records tab |
| Evidence tier display | ✅ | Tiers visible on all records |
| Capture entry modal | 🟡 | API exists, verification test pending |
| Evidence workspace (split view) | ⚪ | Not started |
| Upload receipt via camera/file | ⚪ | Not started |
| OCR extraction + confirm card | ⚪ | Not started |

## Reports & Exports
| Feature | Status | Verification |
|---|---|---|
| CSV export | 🟡 | Button exists, end-to-end test pending |
| Stylized financial statement | ⚪ | Not started |
| Evidence index | ⚪ | Not started |
| PDF export (print-friendly) | ⚪ | Not started |

## Growth Studio
| Feature | Status | Verification |
|---|---|---|
| Insights tab (deterministic patterns) | 🟡 | Text placeholder, not data-driven |
| Goals + plans + tasks | ⚪ | Not started |
| Scenario planner | ⚪ | Not started |
| Outcome tracking | ⚪ | Not started |

## Scam Shield
| Feature | Status | Verification |
|---|---|---|
| Rule-based scam signals | ⚪ | Not started |

## Channels
| Feature | Status | Verification |
|---|---|---|
| PWA installable | ⚪ | Manifest not configured |
| Telegram bot | ⚪ | Not integrated |
| WhatsApp bot | ⚪ | Not started |
| Android APK | ⚪ | Not started |

## Cross-cutting
| Feature | Status | Verification |
|---|---|---|
| SSDL security controls | 🟡 | Auth in place, MFA and rate limiting pending |
| POPIA notice + consent | ⚪ | Not started |
| Accessibility pass | ⚪ | Not started |
| isiXhosa / Afrikaans | ⚪ | Not started |
| Fairness invariance test | ✅ | test-score asserts identical score across locales |
| Evaluation page | ⚪ | Not started |