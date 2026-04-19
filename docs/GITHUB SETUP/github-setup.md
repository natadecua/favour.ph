1. Repo Structure
Since Nathan is frontend, James is backend, and Milo touches both — go monorepo. One repo, two folders, less coordination overhead.
favour-app/
├── client/          # Nathan — Next.js frontend
├── server/          # James — API, DB, schema
├── docs/            # Shared — PRDs, meeting notes, decisions
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/   # CI later
├── .gitignore
└── README.md

2. Branch Strategy
Three permanent branches, feature branches off dev.
main        ← production only. never push here directly.
dev         ← integration branch. all features merge here first.
feature/*   ← individual work. branch off dev, PR back to dev.
Naming convention for feature branches:
feature/nathan-provider-profile
feature/james-booking-schema
fix/nathan-search-filter-bug
chore/milo-update-readme

3. Branch Protection Rules
Go to Settings → Branches → Add rule and apply these to both main and dev.
For main:

✅ Require pull request before merging
✅ Require 2 approving reviews
✅ Require status checks to pass
✅ Do not allow force pushes
✅ Restrict who can push — only Milo (PM merges to main)

For dev:

✅ Require pull request before merging
✅ Require 1 approving review (any team member)
✅ Do not allow force pushes
❌ Don't restrict push — all three can merge to dev after review


4. Team Roles on GitHub
Go to Settings → Collaborators and teams.
PersonRoleAccessNathanMaintainPush, merge PRs to devJamesMaintainPush, merge PRs to devMiloAdminFull access, merges to main

5. Labels
Delete the default GitHub labels and create these. Go to Issues → Labels → New label.
Type:

type: feature — #0047CC blue
type: bug — #D92121 red
type: chore — #9CA3AF gray
type: design — #7C3AED purple

Owner:

owner: nathan — #BFDBFE light blue
owner: james — #BBF7D0 light green
owner: milo — #FEF08A yellow

Status:

status: blocked — #F97316 orange
status: needs review — #A855F7 purple
status: ready — #22C55E green

Priority:

priority: high — #DC2626 red
priority: low — #6B7280 gray


6. GitHub Projects Setup
You already have a project connected. Structure your board like this:
Columns (Board view):
📋 Backlog → 🎯 This Sprint → 🔨 In Progress → 👀 In Review → ✅ Done
Custom fields to add:

Owner — Person field (Nathan / James / Milo)
Sprint — Iteration field (Sprint 1, Sprint 2…)
Area — Single select (Frontend / Backend / Design / PM)
Priority — Single select (High / Medium / Low)

Views to create:

Board — default kanban view
By Owner — group by Owner field so each person sees their own work
By Sprint — filter to current sprint only
Backlog — sorted by Priority, no sprint assigned