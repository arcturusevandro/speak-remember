<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Evandro Development Standard

This repository follows engineering practices aligned with current OpenAI Skills/Plugins guidance.

## Core workflow
1. Inspect the existing implementation before changing it.
2. Preserve working behavior and make the smallest useful change.
3. Run lint, type/build checks and relevant tests after changes.
4. Validate user-facing flows functionally and visually when UI changes are made.
5. Inspect runtime errors/logs before considering work complete.
6. Document meaningful architecture, behavior, security and operational changes.
7. Keep Git history truthful, incremental and descriptive. Never fabricate retroactive development history.

## Product reliability
Voztrace must not invent reminder dates or times. Ambiguous or incomplete temporal information must be confirmed with the user before persistence. Reliability takes priority over apparent intelligence.

## React / frontend
- Avoid unnecessary request waterfalls and excessive client bundles.
- Prefer clear component boundaries and predictable data flow.
- Reuse existing components and project conventions before introducing alternatives.
- Validate responsive behavior and accessibility for UI changes.

## Supabase
- Treat RLS and authorization as security-critical.
- Review schema, indexes, query patterns and access paths when data behavior changes.
- Never expose privileged service-role credentials to client code.
- Keep environment-specific credentials out of the repository.

## Secrets and AI integrations
Never print, commit, paste into documentation, or expose API keys, tokens, passwords or environment secrets. Use environment variables and safe secret-management mechanisms.

## QA
A change is not complete merely because it compiles. When applicable, validate reminder creation, confirmation, editing, persistence, ambiguity handling, responsive UI, error states and runtime logs.

## Platform portability
The project originated in Lovable. Preserve the existing Lovable synchronization requirements while connected. Prefer portable, project-owned infrastructure for new architecture and avoid introducing unnecessary additional platform lock-in. Existing platform-specific dependencies must only be removed after their usage and replacement are verified.
