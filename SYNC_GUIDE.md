# Branch Sync Guide for Santiago

## Quick Reference

After merging a Pull Request from `design` to `main`, run:

```bash
./sync-design.sh
```

This will automatically:
1. ✅ Update your local `main` branch
2. ✅ Switch to `design` branch
3. ✅ Merge `main` into `design`
4. ✅ Push updated `design` to GitHub
5. ✅ Return you to your original branch

## When to Sync

**Required:** After every merge to `main`
- Just merged a PR from designer → Run `./sync-design.sh`
- Just committed your own changes to `main` → Run `./sync-design.sh`

**Why:** This keeps the designer's branch updated with your latest code, preventing merge conflicts and ensuring she works with current code.

## Troubleshooting

### If conflicts occur:

The script will stop and give you options:

```
❌ ¡Conflictos detectados!

Opciones:
1. Resolver conflictos manualmente y luego:
   git add .
   git commit
   git push origin design

2. Abortar el merge:
   git merge --abort
```

**To resolve conflicts:**

1. Open conflicted files in VS Code (marked with `<<<<<<<`, `=======`, `>>>>>>>`)
2. Choose which changes to keep
3. Save files
4. Run:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts from main"
   git push origin design
   ```

### Common Issues

**Error: "fetch first"**
- Someone pushed to `design` while you were syncing
- Solution: Run the script again

**Error: "uncommitted changes"**
- You have uncommitted work
- Solution: Commit or stash your changes first

## Alternative: Automatic Sync

If you prefer, you can enable automatic syncing via GitHub Actions:

The workflow `.github/workflows/sync-design-branch.yml` is already in place but not actively used. Every push to `main` would automatically merge to `design`.

**To enable:** It's already enabled! Just push to `main` and it will auto-sync.

**To disable:** Delete or comment out the workflow file.

**Recommendation:** Stick with manual sync (Option 2) for now. You have more control and can catch conflicts early.

## Quick Commands

```bash
# Sync design branch with main
./sync-design.sh

# Check sync status
git checkout design
git log --oneline -5

# See what's different between main and design
git checkout design
git log main..design --oneline
```

## For Claude Code

When Santiago mentions "just merged a PR" or "committed to main", remind him to run `./sync-design.sh` to keep the designer's branch updated.
