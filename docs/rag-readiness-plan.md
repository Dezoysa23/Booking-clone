# Pearlora — AI / RAG Readiness Plan

_Status: **planning document only.** No AI/RAG code, dependencies, models, or vector store exist
in the project today. Nothing here is built. This is the architecture to follow **if/when** an AI
assistant or document-search feature is approved._

---

## 0. Current state (audited)
- **No** AI/LLM/embedding dependencies in `package.json` (no OpenAI, Anthropic, Cohere, LangChain).
- **No** vector store (no `pgvector`, Pinecone, Weaviate, Supabase Vector).
- **No** `lib/ai` / `lib/search`, no document/chunk/embedding/message Prisma models.
- Search today = Prisma `contains`/ILIKE filters on properties ([results route](../app/api/properties/route.ts)). That is keyword-only and non-AI.

**Recommendation:** do not add a RAG stack until there is a concrete user need. When there is, the
smallest viable footprint is Neon `pgvector` (no new infra) + one LLM provider behind a flag.

---

## 1. What a Pearlora assistant would realistically do
Likely first use-cases, in priority order:
1. **Guest support assistant** (user-facing): answers from property details, house rules, booking
   policies, FAQs, "how it works" / host guides. Must **never** invent prices, availability, or
   payment status — those come from live DB queries, not the LLM.
2. **Host helper** (host-only): summarize their listing performance, explain subscription/plan docs.
3. **Admin ops assistant** (internal): search across platform docs/policies.

Each has a different data scope and audience → drives the privacy model (§5).

---

## 2. Proposed architecture (when built)
```
User query
  → auth + role resolved server-side (reuse lib/auth.ts, lib/security/api-auth.ts)
  → build retrieval filter from {userId, role, ownership}
  → Hybrid retrieval:  keyword (Postgres FTS / trigram)  +  vector (pgvector)  → merged top-N
  → (optional) cross-encoder rerank → top-K
  → context assembly (dedupe, token budget, citations)
  → LLM answer with strict "use only provided context; else say you don't know" system prompt
  → semantic cache write (keyed by role+scope+normalized query)
```
All of it behind `AI_ENABLED` (default **false**) so it can be killed instantly (see rollback doc).

---

## 3. Checklist items — design decisions

### A. Document chunking
- Semantic chunks by heading/section where source has structure (house rules, guides); else
  ~800–1,000 tokens with ~15% overlap.
- Store per-chunk metadata: `ownerId`/`hostId` (nullable for public docs), `documentId`,
  `visibility` (PUBLIC / USER / HOST / ADMIN), `source`, `propertyId?`, `createdAt`.
- **Never** mix private data from different owners in one chunk.

### B. Hybrid retrieval
- Keyword: Postgres full-text (`tsvector`) or `pg_trgm`. Vector: `pgvector` cosine.
- Merge with weighted score (start 0.5/0.5) or Reciprocal Rank Fusion.
- **Every** query carries a mandatory ownership/role filter applied in SQL (not post-filtered).

### C. Cross-encoder rerank
- Optional second stage behind a `RerankService` interface (default no-op). Only add a real
  cross-encoder (hosted API or small model) if retrieval precision proves insufficient. Keep it
  configurable; don't add a heavy dependency up front.

### D. Context-window management
- Cap retrieved chunks (e.g. top-6 after rerank); dedupe near-identical chunks; track a token
  budget and truncate lowest-scored first; attach `source`/`documentId` for citations.

### E. Data privacy & filtering (non-negotiable)
- Retrieval filter derived **only** from the server-verified session (reuse existing auth). Never
  from client input — same rule as the rest of the API.
- USER → only PUBLIC docs + their own data. HOST → PUBLIC + their own properties' data.
  ADMIN/SUPER_ADMIN → platform-wide only via protected routes.
- Never embed or place secrets/tokens/PII-beyond-need into chunks or LLM context.
- Log queries without storing raw private content in plaintext logs.

### F. "I don't know" handling
- System prompt: answer **only** from provided context; if insufficient, say so and offer an
  escalation path (support email / contact host). Set a retrieval-score threshold below which the
  system returns a canned "I don't have enough information" rather than calling the LLM.
- Never let the LLM state prices, availability, or payment status — fetch those live from Prisma
  and inject as structured facts, or answer with a deterministic DB lookup instead.

### G. HNSW indexing for scale
- With `pgvector`, start with a flat/IVFFlat index for small data; move to **HNSW**
  (`CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)`) as volume grows.
- Document the migration; it is additive and safe, but still a manual migration — apply per the
  rollback doc's migration guidance (reconcile drift first).

### H. Semantic caching
- Cache answers in Upstash Redis (if adopted) or a Postgres table, keyed by
  `hash(role + scope + normalizedQuery)` — **role/scope in the key is mandatory** so one user's
  cached answer can never leak to another.
- TTL (e.g. 1–24h depending on data volatility); invalidate on source-document update. Never cache
  answers derived from live, user-specific data (bookings, payments).

---

## 4. Minimal dependency footprint (only when approved)
- Vector store: **Neon `pgvector`** (no new infra).
- LLM: one provider via **Vercel AI Gateway** (`"provider/model"` strings) or a single SDK.
- Optional cache: **Upstash Redis** (shared with rate limiting).
- New Prisma models: `Document`, `DocumentChunk` (with `embedding vector`), optionally
  `AssistantMessage` for history.
- New env (all optional, default-off): `AI_ENABLED`, `AI_PROVIDER_API_KEY`, `EMBEDDING_MODEL`.

## 5. Rollout guardrails
- Ship behind `AI_ENABLED=false`; enable for internal/admin first, then hosts, then guests.
- Rate-limit the assistant endpoint (reuse `checkRateLimit`).
- Red-team the privacy filter with cross-user queries before any public exposure.
- Kill switch: `AI_ENABLED=false` disables the feature with zero code change.
