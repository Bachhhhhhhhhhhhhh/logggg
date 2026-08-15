# Memory

Internal dashboard for an **agentic knowledge memory graph** — a local, demo-ready recreation of the idea Flexport described: logistics AI agents that accumulate reusable skills as a shared graph of subthemes, co-occurrence links, communities, and distilled learnings.

This first version is a complete frontend. It runs against a structured JSON snapshot so you can demo, teach, and iterate on the UX immediately. The data contract is the same one a real graph backend should emit later.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build     # production bundle
npm run preview   # serve the build
npm run generate  # regenerate src/data/snapshot.json
```

## What you get

| Tab | Role |
| --- | --- |
| **Graph** (default) | Force-directed 2D / 3D canvas (~88 subthemes, ~1,400 links). Orbit, zoom, shift-click multi-select, double-click a node for the detail drawer. |
| **Knowledge** | Distilled playbooks the agents “learned”, tagged back to graph nodes. |
| **Communities** | Simulated Leiden clusters with “View in graph”. |
| **Dev work** | Changelog of memory-system mutations (adds, merges, reindexes). |
| **Jobs** | Background pipelines that would keep the graph fresh. |

Search is lexical + synonym expansion over nodes and learnings (a stand-in for embedding retrieval). **Import snapshot** accepts any JSON with `nodes[]` and `links[]`. A ready-made file lives at `public/sample-snapshot.json`.

### Snapshot shape

```json
{
  "nodes": [
    {
      "id": "exceptions",
      "label": "Exceptions",
      "category": "operations",
      "size": 42,
      "description": "…",
      "degree": 61,
      "communityId": "exception_comms",
      "trend": [12, 18, 15]
    }
  ],
  "links": [
    { "source": "exceptions", "target": "external_messages", "weight": 178 }
  ]
}
```

`category` is one of `operations` | `documents` | `issues` | `finance`. `weight` is co-occurrence count. Node `size` is derived from weighted degree (finance nodes stay small on purpose).

Regenerate mock data with `npm run generate` (`scripts/generate-snapshot.mjs`, seeded).

## Architecture now

```
UI (React + Zustand)
        │
        ▼
 src/data/snapshot.json     ← mock, or file dropped via Import
        │
        ▼
 force graph (WebGL / canvas)
 knowledge / communities / jobs views
```

- **React + TypeScript + Vite + Tailwind CSS 4**
- **Zustand** holds the snapshot, tab, selection, search, and drawer
- **react-force-graph-3d** / **react-force-graph-2d** render the same `graphData` on a canvas/WebGL surface (not SVG) so ~1,400 edges stay interactive
- Views never fetch; they select from the store. Swapping the store’s loader for `GET /api/snapshot` is the production cutover

## Architecture later (real memory pipeline)

Do **not** keep generating this graph by hand. In production the snapshot is a materialized view of a graph store that agents write to continuously.

```
Agent traces · tickets · email · EDI · TMS events
        │
        ▼
 ┌────────────────── extraction ──────────────────┐
 │  LLM / NER: entities, relations, playbooks     │
 │  normalize aliases (“Container Track” →        │
 │  “Containers”), attach evidence spans          │
 └──────────────────┬─────────────────────────────┘
                    ▼
        Graph store (pick one)
        · Neo4j
        · Graphiti (temporal episodes)
        · Cognee
                    │
        nightly / 15-min jobs
        · co-occurrence rollup → link.weight
        · Leiden / Louvain → communities
        · distill learnings from clustered traces
        · embed nodes + learnings (vector index)
                    ▼
        GET /api/snapshot          (this UI)
        POST /api/search           (real semantic search)
        GET /api/nodes/:id         (drawer payload)
```

Suggested job mapping (already named in the Jobs tab):

| Job | Writes |
| --- | --- |
| `entity-extract-agent-logs` | nodes + evidence |
| `relation-cooccurrence` | links.weight |
| `learning-distill` | knowledge[] |
| `community-leiden` | communityId + communities[] |
| `embedding-reindex` | vector index for search |
| `node-dedup` | alias merges |
| `snapshot-export` | the JSON this app already consumes |

Frontend change when the backend exists:

1. Replace the static import in `src/store.ts` with `fetch('/api/snapshot')`.
2. Point `runSearch` at `POST /api/search` (keep the current function as a fallback).
3. Optionally stream job status from `/api/jobs`.

The visualization layer does not need to know about Neo4j.

## Design notes

Light, dense, internal-tool UI: white chrome, hairline borders, Inter, blue primary. Graph nodes are colored by operational area; orange finance nodes are intentionally smaller. Strongest-links is a ranked co-occurrence table, not a second graph.

## License

Internal / demo use.
