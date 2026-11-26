# mw-lore

MoonWitness Creative Narrative Canon, Character Bible (MW II / MW XII / V10), GOD PROMISE Editorial Workbench & Interactive World Explorer.

## Locked Canon Governance (CAN-0001..CAN-0015)

- **Status Preservation**: `draft`, `review`, and `published` states are strictly preserved and never flattened.
- **CAN-0004 (Alias Non-Auto-Merge)**: Character aliases remain explicit arrays inside lore records and are never auto-merged into real-world or religious figures.
- **CAN-0011 (Visual Boundary Guard)**: Rejects any visual depiction request involving Allah, Prophet Muhammad, or Isa/Yesus.
- **Scripture Separation**: Creative fiction is strictly separated from scripture and tafsir. All scripture references use `mw-corpus` SHA-256 reference identifiers rather than copying raw scripture text.

## Endpoints

Default port: `MW_LORE_PORT=4450`

- `GET /` — Minimal RIOT/CHAOS HTML World Explorer
- `GET /health` — Service health & canon rule count
- `GET /api/eras` — MoonWitness II 8 Eras (`BEFORE LIGHT` published; 7 subsequent eras draft)
- `GET /api/functions` — 13 Narrative Functions (`Storytelling`..`Promoting`)
- `GET /api/world-rules` — 10 World Rules
- `GET /api/characters` — Character Registry (`status: 'review'`, `canonLevel: 'lore'`)
- `GET /api/xii` — MoonWitness XII Cast & 33-patch register metadata
- `POST /api/god-promise/validate` — Validates & renders GOD PROMISE editorial reflection cards under CAN-0011 and corpus-ref separation rules

## Development

```bash
bun install
bun test
bun run start
```
