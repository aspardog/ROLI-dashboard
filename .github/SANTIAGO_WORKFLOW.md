# Santiago's Daily Workflow

## After Merging PR to Main

**ALWAYS run this after merging any PR:**

```bash
./sync-design.sh
```

This keeps the designer's `design` branch synchronized with your latest changes in `main`.

## Why This Matters

- Designer always works with your current code
- Prevents merge conflicts
- Avoids duplicate work
- Ensures design changes apply to latest implementation

## Quick Reference

### Daily Commands

```bash
# After merging PR to main
./sync-design.sh

# Check what's on design branch
git checkout design && git log --oneline -5 && git checkout main

# See differences between main and design
git log main..design --oneline
```

### When Conflicts Occur

The script will stop and show instructions. To resolve:

1. Open conflicted files in VS Code
2. Choose which changes to keep
3. Save and commit:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   git push origin design
   ```

## Complete Guides

- `SYNC_GUIDE.md` — Detailed sync instructions and troubleshooting
- `CLAUDE.md` — Full project documentation
- `README.md` — Project overview

## Using @claude on GitHub

### GitHub Actions Integration

You can mention `@claude` in GitHub Issues, Pull Requests, and comments to get Claude's help directly in GitHub.

**How it works:**
1. Comment `@claude [your question]` on any PR, Issue, or review
2. GitHub Actions runs Claude Code using your `CLAUDE_CODE_OAUTH_TOKEN`
3. Claude responds with suggestions, code reviews, or fixes

**Important: Rate Limits & Billing**
- ⚠️ **You pay for all @claude usage on GitHub** (uses YOUR API quota)
- This includes when you OR the designer mention @claude (though designer is currently restricted)
- Current limit: Max 10 turns per invocation, 30 minute timeout
- Monitor your usage at: https://console.anthropic.com

**Current Restrictions:**
- ✅ Only YOU (aspardog) can invoke @claude on GitHub
- ❌ Designer cannot use @claude on GitHub (uses your quota)
- ✅ Designer should use Claude Code locally (their own quota)

**To check your quota usage:**
- Visit Anthropic Console: https://console.anthropic.com
- Check "Usage" section for API calls and costs

### Workflow Configuration

Located in `.github/workflows/claude.yml`:
- Triggers on: Issues, PRs, comments, reviews
- Requires: `@claude` mention + your username (aspardog)
- Uses: Your `CLAUDE_CODE_OAUTH_TOKEN` secret
- Max turns: 10 (configurable via `claude_args`)

## For Your Claude Code

Your Claude Code will automatically remind you to run `./sync-design.sh` after commits/merges to `main`.
