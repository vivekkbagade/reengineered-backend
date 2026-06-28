# Shopping Cart Reengineered Backend

This is the reengineered Express backend application built with SQLite and customized seed data.

## Knowledge Graph & Git Hooks

This repository uses **Graphify** and **Code Review Graph (CRG)** to maintain a persistent, token-efficient knowledge graph of the codebase structure.

### Features
*   **Graphify**: Reconstructs the semantic and dependency relationship graph of the codebase files.
*   **Code Review Graph (CRG)**: Extracts local AST trees and manages clusters (using the `Leiden` algorithm) to compute structural context for code reviews.
*   **Auto-Wiki**: Wiki documentation is compiled inside `.code-review-graph/wiki/`.

### Configured Hooks
1.  **Post-Commit Hook** (`.git/hooks/post-commit`): Automatically updates the codebase graphs in the background on commit.
2.  **Branch Switch Hook** (`.git/hooks/post-checkout`): Automatically determines files checked out on branch switch. If $\le$ 5 files change, runs an incremental update; if > 5 files change, runs a full graph rebuild in the background.
3.  **Claude Stop Hook** (configured via `settings.local.json`): Runs the PID-guarded `stop-hook.py` script after every AI turn to update index states.
