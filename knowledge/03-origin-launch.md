# Origin: Cursor's Git Forge for the Agentic Era

## What Origin is
- Announced June 16-17, 2026. Origin is a new Git forge from Cursor: code hosting, review, and collaboration. A direct alternative to GitHub and GitLab.
- Built by the Graphite team inside Cursor (the Origin Incubation team), on re-architected Graphite technology.
- Status at announcement: waitlist only, with general release targeted for fall 2026.

## The thesis
- GitHub was designed for human-paced development: one developer, one branch, occasional commits.
- With AI agents, code arrives constantly and in parallel. Dozens of agents can be committing to the same repo simultaneously. The hosting and coordination layer, not code generation, is now the bottleneck.
- Origin's pitch: a source control platform designed end to end for the world's fastest-moving engineering teams, where humans and agents collaborate as first-class citizens.
- Merrill Lutsky's framing: Graphite's greatest challenge was delivering its product on a platform it didn't own (GitHub). Origin completes the vision with a platform designed end to end.

## Technical differentiators to know
- Storage architecture: S3 as the source of truth with NVMe-backed Git fileservers, built for the scale and concurrency of agent-driven commit volume.
- Merge queues native to the platform, handling high-volume parallel changes safely.
- Machine-readable review states, enabling bulk approval workflows for agent-generated changes.
- Automated merge conflict resolution for parallel agent workloads.
- Extensibility as a first-class principle: full API surface plus MCP support, so agents and external tools can drive the forge programmatically.

## The three-layer Cursor stack
1. Create: Cursor (editor, Composer, background/cloud agents) is the editing and generation layer.
2. Review: Graphite (stacked PRs, AI review, merge queue) is the review and merge layer.
3. Host: Origin closes the loop as the hosting and collaboration layer.
Together: an end-to-end platform for building software with AI, owning the full inner and outer loop.

## Why it matters strategically
- Positions Cursor in direct competition with GitHub (Microsoft) for the coordination layer of software development.
- Industry observers (e.g. The Pragmatic Engineer's Gergely Orosz, a Graphite investor) have argued GitHub's biggest competitor could soon be Cursor, noting GitHub is adding stacked diffs in 2026, years behind Graphite.
- The wedge: Cursor's massive installed base of AI-forward engineering teams already feeling the review/merge bottleneck.
