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

## For Your Claude Code

Your Claude Code will automatically remind you to run `./sync-design.sh` after commits/merges to `main`.
