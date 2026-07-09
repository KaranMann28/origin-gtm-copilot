# Competitive Landscape and Common Objections

## Primary competitor: GitHub
- Owns the default position: hosting, PRs, review, Actions CI, packages, and network effects (open source lives there).
- Backed by Microsoft, bundled into enterprise agreements, deeply entrenched in compliance and procurement.
- Weaknesses Origin attacks: PR model built for human pace, no native stacked diffs until 2026 (playing catch-up to Graphite), review and merge tooling not designed for parallel agent workloads.

## Secondary: GitLab, Bitbucket
- GitLab strong in self-hosted/regulated environments and DevSecOps bundling. Same human-paced PR paradigm.
- Bitbucket declining relevance, mostly Atlassian ecosystem inertia.

## AI code review adjacents
- CodeRabbit and Greptile compete with Graphite's AI Reviewer specifically, not with Origin's hosting layer.
- Cursor's advantage: owning create + review + host means review intelligence can learn from both the editor and the forge.

## The objections a GTM person will hear (and response angles)

### "Why would we ever move our repos?"
- Don't sell a migration, sell a wedge. Start with teams already on Cursor + Graphite feeling merge-queue pain. Origin can begin as the platform for agent-heavy repos or new projects, not a rip-and-replace.
- The history of dev tools shows hosting does move when the workflow advantage is big enough (SVN to Git, on-prem to GitHub).

### "GitHub is good enough."
- True at human pace. The question to ask in discovery: how many PRs did agents open in your org last quarter vs a year ago, and what happened to review latency and merge conflicts?
- If the answer is "it's becoming a mess," good enough is expiring.

### "Too risky / too new."
- The team behind it ran review infrastructure for Shopify, Snowflake, Figma, and Perplexity at Graphite scale. Origin is a re-architecture by the people who hit GitHub's limits professionally for five years.

### "Lock-in concerns."
- It's still Git. Repos remain portable by design, and the platform is API/MCP extensible rather than closed.

## First adopter profile (hypothesis for discovery)
- AI-forward engineering orgs already standardized on Cursor, high agent usage, platform engineering leader as champion.
- Pain signals: review queue backlogs, merge conflict volume from parallel agents, homegrown scripts patching GitHub workflows.
