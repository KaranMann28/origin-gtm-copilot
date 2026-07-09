# Graphite: Product Fundamentals

## What Graphite is
Graphite is a code review platform built for high-velocity engineering teams. It sits on top of GitHub today and is used by hundreds of thousands of engineers at more than 500 companies, including Shopify, Snowflake, Figma, and Perplexity.

## Core concepts

### Stacked PRs (stacked diffs)
- The signature feature. A developer breaks a large change into a stack of small, dependent pull requests. Each PR in the stack can be reviewed independently while the developer keeps building on top of it.
- Solves the classic bottleneck: without stacking, an engineer must wait for PR approval before starting dependent work. With stacking, review happens in parallel with continued development.
- Small PRs also get reviewed faster and more thoroughly, improving both speed and quality.
- The Graphite CLI (gt) manages the stack: gt create makes a new branch stacked on the current one, gt modify amends mid-stack and restacks everything above automatically, gt submit opens or updates the PRs.

### AI Reviewer (Diamond)
- AI-powered first-pass review: catches security vulnerabilities, performance issues, and violations of team-specific style and documentation standards.
- Positioned as a complement to human review, not a replacement. Handles the mechanical layer so humans focus on design and intent.
- Post-acquisition plan: merge with Cursor's Bugbot into the strongest AI reviewer on the market.

### Merge queue
- Automates safe merging at scale: queues approved PRs, rebases, runs CI, and lands changes in order without engineers babysitting merges.
- Critical for monorepos and high-commit-volume teams, and increasingly critical when AI agents generate many parallel changes.

## Business trajectory
- Founded ~2021 by Merrill Lutsky, Greg Foster, and Tomas Reimers.
- Grew from $0 to $17MM ARR before the December 2025 acquisition by Cursor (per the Head of Sales & Operations who led that GTM motion and moved to Cursor GTM Leadership with the acquisition).
- Raised a $52M Series B in March 2025 at a $290M valuation. Backers included Accel, a16z, Anthropic, and Neo.
- Adjacent competitors in AI code review: CodeRabbit (valued $550M in Sept 2025) and Greptile ($25M Series A in fall 2025).
