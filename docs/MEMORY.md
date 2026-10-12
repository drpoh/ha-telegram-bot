# Memory Design

## Types
- conversation: recent turns and references
- home/device: stable facts and aliases
- behavioral: patterns and user corrections
- operational: proposed/executed actions and verification

## Retrieval
Return only memory relevant to the current entities, areas, people, time and intent. Rank by relevance, recency, confidence and importance.

## Learning
Candidate facts should carry provenance/time/confidence where practical. Conflicting current HA state overrides stale memory.

## Backend
Start with SQLite and lightweight text/indexed search. Keep a MemoryStore interface so embeddings/vector retrieval can be added later on stronger hardware.

## Privacy
Runtime memory is not committed to Git. Backups are private data and should be protected accordingly.
