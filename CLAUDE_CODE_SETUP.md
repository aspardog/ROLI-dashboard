# Claude Code Setup for Designer

This guide explains how to set up and use Claude Code **locally on your computer** (not on GitHub).

## Why Use Claude Code Locally?

- ✅ **Your own quota:** Uses your Claude account, not Santiago's
- ✅ **Full privacy:** Your conversations stay on your computer
- ✅ **Faster responses:** No GitHub Actions delays
- ✅ **More control:** Unlimited conversations with your quota

## Option 1: Claude Code CLI (Recommended)

### Installation

**Mac/Linux:**
```bash
# Install via curl
curl -fsSL https://install.claude.ai/code | sh

# Or via Homebrew
brew install anthropics/claude/claude-code
```

**Windows:**
```powershell
# Download installer from:
# https://claude.ai/code
```

### Setup

1. **Log in to your Claude account:**
   ```bash
   claude auth login
   ```
   This will open your browser to authenticate.

2. **Navigate to project folder:**
   ```bash
   cd /path/to/roli-dashboard
   ```

3. **Start Claude Code:**
   ```bash
   claude
   ```

4. **Tell Claude your role:**
   ```
   I'm the designer working on visual improvements for the ROLI dashboard.
   I want to [your task here].
   ```

### Usage

**Starting a session:**
```bash
cd ~/Documents/GitHub/roli-dashboard
claude
```

**Example prompts:**
```
"I'm the designer. I want to change the button colors to match our brand."

"Help me make the modal titles bigger and bolder."

"The spacing between charts looks too tight on mobile. Can you help fix it?"
```

**Exiting:**
- Type `exit` or press `Ctrl+D`

## Option 2: VS Code Extension

### Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "Claude Code"
4. Install the official extension by Anthropic

### Usage

1. Open the ROLI dashboard folder in VS Code
2. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
3. Type "Claude" and select "Claude: Start Chat"
4. Tell Claude: "I'm the designer working on visual improvements..."

## Option 3: Web Interface (claude.ai)

While not integrated with your local files, you can:

1. Go to https://claude.ai
2. Copy/paste code from your files
3. Ask Claude for design suggestions
4. Apply changes manually

**Limitation:** Cannot directly modify files, requires manual copy/paste.

## What NOT to Do

❌ **Don't use @claude on GitHub**
- Won't work (restricted to Santiago only)
- Would use Santiago's API quota if it worked
- GitHub Actions is slower than local use

❌ **Don't share your Claude login**
- Each person should use their own account
- Keeps usage separate and manageable

## Billing & Quota

### Free Tier
- Claude offers a free tier with usage limits
- Check your usage at: https://claude.ai/settings

### Paid Plans
- If you exceed free tier, you can upgrade
- Pay only for what you use
- Independent from Santiago's quota

### Checking Your Usage
1. Go to https://claude.ai
2. Click on your profile/settings
3. View usage and billing information

## Getting Help

### Claude Code Issues
- Documentation: https://docs.anthropic.com/claude-code
- GitHub: https://github.com/anthropics/claude-code

### Project-Specific Help
- Ask Santiago for clarification on technical decisions
- Use Claude Code for design/styling help
- Refer to `DESIGNER_README.md` for guidelines

## Best Practices

1. **Always identify your role:**
   ```
   "I'm the designer working on the ROLI dashboard. I need to..."
   ```

2. **Work on the design branch:**
   - Claude will help ensure you're on the right branch
   - Never work directly on main

3. **Sync before starting:**
   - Claude will remind you to run:
     ```bash
     git pull origin main
     ```

4. **Test changes locally:**
   - Run `npm start` to see changes in browser
   - Check mobile responsiveness

5. **Commit frequently:**
   - Claude can help draft commit messages
   - Push to `design` branch regularly

## Example Workflow

```bash
# 1. Navigate to project
cd ~/Documents/GitHub/roli-dashboard

# 2. Start Claude Code
claude

# 3. Introduce yourself
"I'm the designer. I want to update the color scheme to use warmer tones."

# 4. Claude helps you:
# - Identifies color constants in src/constants.js
# - Suggests new color values
# - Shows you how to test changes

# 5. You apply changes and test
npm start
# Check browser at localhost:3000

# 6. Commit when satisfied
git add .
git commit -m "Update color scheme to warmer tones"
git push origin design

# 7. Create Pull Request on GitHub for Santiago's review
```

## Summary

| Feature | GitHub @claude | Local Claude Code |
|---------|----------------|-------------------|
| **Speed** | Slower (GitHub Actions) | Fast (instant) |
| **Quota** | Santiago's | Yours |
| **Privacy** | Public (in PR comments) | Private (local) |
| **File access** | Limited | Full project access |
| **Who can use** | Only Santiago | You! |
| **Cost to Santiago** | Yes | No |

**Recommendation:** Use Claude Code locally for all your design work. It's faster, private, and uses your own quota.

---

**Questions?** Ask Santiago or refer to:
- `DESIGNER_README.md` — Designer role and guidelines
- `DESIGN_GUIDE.md` — Complete design workflow
- `START_HERE.md` — Quick setup guide
