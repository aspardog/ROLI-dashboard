# For Claude Code: Designer Role Context

This file provides context for Claude Code when assisting the designer working on this project.

## Project Role: Designer

**User Role:** Designer (non-technical, focusing on visual design and UX improvements)

**Working Branch:** `design` (ALWAYS work here, NEVER on `main`)

**Permitted Actions:**
- ✅ Modify visual styles, colors, typography, spacing
- ✅ Adjust component layouts and responsiveness
- ✅ Improve user interface and user experience
- ✅ Create Pull Requests to `main` for Santiago's review
- ❌ DO NOT modify data pipeline, parsers, or core logic
- ❌ DO NOT work directly on `main` branch
- ❌ DO NOT modify configuration files (package.json, craco.config.js)

---

## CRITICAL: For Claude Code - Always Remind Designer to Sync

**IMPORTANT INSTRUCTION FOR CLAUDE CODE:**

When the designer identifies themselves and starts a new work session, you MUST:

1. **First action:** Remind them to sync their `design` branch with `main` before starting any work
2. **Execute the sync:** Offer to run the synchronization commands for them
3. **Verify branch:** Confirm they're on the `design` branch

**Standard greeting when designer starts session:**

"Hi! Before we start working on design changes, let's make sure your `design` branch is synchronized with the latest updates from `main`. This ensures you're working with Santiago's most recent changes. I'll run the sync commands for you."

Then execute:
```bash
git checkout design
git pull origin design
git pull origin main
```

**Why this matters:**
- Santiago frequently merges updates to `main` (new features, bug fixes, data updates)
- Working on outdated code can create merge conflicts later
- Syncing first prevents duplicate work and ensures design changes apply to current code

**When to skip sync:**
- If designer explicitly says they just synced
- If they're in the middle of resolving a conflict
- If they're just asking questions (not making changes)

---

## Files Designer Should Modify

### 🎨 Primary Design Files (modify freely):

**`src/constants.js`** (lines 52-62)
- **Purpose:** All color definitions, regions, variables
- **What to change:** Colors (HEX codes), palette adjustments
- **What NOT to change:** Variable names, structure, exported data

**`src/responsive.css`**
- **Purpose:** Mobile and responsive styles
- **What to change:** Font sizes, padding, margins, breakpoints, mobile layouts
- **What NOT to change:** Class names (can break component references)

**`App.js`** (inline styles)
- **Purpose:** Main dashboard structure and styling
- **What to change:** fontSize, fontWeight, color, margin, padding, borderRadius, backgroundColor
- **What NOT to change:** Component logic, state management, data flow, function names

**`src/InfoModal.js`**
- **Purpose:** "Learn about the Index" modal styling
- **What to change:** Modal appearance, typography, spacing, colors
- **What NOT to change:** Content structure, onClick handlers, component logic

**`src/HowToUseModal.js`**
- **Purpose:** "How to use" modal styling
- **What to change:** Similar to InfoModal - appearance only
- **What NOT to change:** Component logic

### 📊 Chart Components (modify styles only):

**`src/TopBottomChart.js`**
**`src/TimeSeriesChart.js`**
**`src/RadarChartView.js`**
**`src/FactorComparisonChart.js`**
- **What to change:** Container styles, titles, spacing, colors via COLORS constants
- **What NOT to change:** Recharts configuration, data processing, calculations

---

## Files Designer Should NOT Touch

❌ `package.json` - Dependencies configuration
❌ `craco.config.js` - Build configuration
❌ `src/parse-roli-data.js` - Data parser
❌ `src/svgExport.js` - SVG export logic
❌ Files in `data/` folder - Source data
❌ Files in `public/` folder (except index.html if designer knows HTML)
❌ `.github/workflows/` - CI/CD configuration

---

## Design System Reference

### Current Colors (from src/constants.js):
```javascript
COLORS = {
  top5: '#4a90e2',      // Blue for top 5 countries
  bottom5: '#e74c3c',   // Red for bottom 5
  background: '#f8f9fa',// Light gray background
  text: '#2c3e50',      // Dark gray text
  muted: '#7f8c8d',     // Muted gray for secondary text
  divider: '#e1e4e8'    // Light gray for dividers
}

TS_COLORS = {
  line: '#2c5aa0',      // Dark blue for main line
  regionalAvg: '#e67e22', // Orange for regional average
  dot: '#2c5aa0',       // Blue for data points
  grid: '#e1e4e8'       // Gray for grid lines
}
```

### Typography:
- **Font:** Inter Tight (Google Fonts)
- **Weights:** 400 (normal), 600 (semi-bold), 700 (bold)
- **Main title:** 32px, weight 700
- **Section titles:** 20px, weight 600
- **Body text:** 15-16px, weight 400
- **Labels:** 13px, weight 600, uppercase

### Spacing Scale:
- **Tight:** 8px, 12px
- **Standard:** 16px, 24px
- **Loose:** 32px, 48px

### Border Radius:
- **Buttons/Controls:** 8px
- **Cards:** 12px
- **Small elements:** 6px
- **Circular:** 50%

---

## Git Workflow for Designer

### Daily Workflow:

```bash
# 1. ALWAYS start by ensuring you're on design branch
git checkout design

# 2. Get latest changes from design branch
git pull origin design

# 3. 🔄 SYNC with main (CRITICAL - do this every session!)
git pull origin main

# 4. Make your design changes
# Edit files in VS Code, see changes at localhost:3000

# 5. Save your work
git add .
git commit -m "Descriptive message about what you changed"
git push origin design

# 6. When ready for Santiago's review
# Go to GitHub and create Pull Request: design → main
```

**Why sync with main every time?**
Santiago regularly updates `main` with new features, bug fixes, and data updates. Pulling from `main` ensures you're always working with the latest code, preventing merge conflicts and duplicate work.

### Important Git Rules:
- ✅ ALWAYS verify you're on `design` branch (run `git status`)
- ✅ Commit frequently with clear messages
- ✅ Test changes in browser before committing
- ❌ NEVER work on `main` branch
- ❌ NEVER use `git push --force`
- ❌ NEVER delete files without confirming with Santiago

---

## Common Design Tasks

### Change Dashboard Colors:

1. Open `src/constants.js`
2. Find `export const COLORS` (around line 52)
3. Change HEX values:
   ```javascript
   export const COLORS = {
     top5: '#YOUR_NEW_COLOR',  // Change this
     bottom5: '#YOUR_NEW_COLOR', // Or this
     // etc.
   };
   ```
4. Save and check browser (auto-refreshes)

### Change Font Sizes:

**Option A:** Global changes in `src/responsive.css`
```css
.dashboard-header h1 {
  font-size: 32px !important;  /* Change this */
}
```

**Option B:** Individual component in `App.js`
```javascript
style={{
  fontSize: '32px',  // Change this
  fontWeight: '700',
  color: COLORS.text
}}
```

### Adjust Spacing:

Look for `padding` and `margin` in component styles:
```javascript
style={{
  padding: '24px',      // Inner spacing
  margin: '0 auto 32px' // Outer spacing
}}
```

### Change Button Appearance:

In `App.js`, find button styles (around line 160+):
```javascript
style={{
  padding: '14px 20px',        // Size
  fontSize: '15px',            // Text size
  fontWeight: '600',           // Text weight
  backgroundColor: COLORS.top5, // Background
  color: 'white',              // Text color
  border: `2px solid ${COLORS.top5}`, // Border
  borderRadius: '8px',         // Rounded corners
  cursor: 'pointer'
}}
```

---

## When Working with Claude Code

### Tell Claude your role:

"I'm the designer working on visual improvements for the ROLI dashboard. I need to [your design task]. I should only work on the design branch and modify styling/visual files."

**Note:** When you identify yourself as the designer, Claude will automatically remind you to sync with `main` before starting work. This is intentional and important!

### Good prompts:

✅ "I want to change the color scheme to use a blue gradient instead of the current colors"
✅ "The buttons look too small on mobile, can you help me increase their size?"
✅ "I want more spacing between the chart and the controls"
✅ "Help me make the modal titles larger and bolder"

### Avoid these prompts:

❌ "Change how the data is processed"
❌ "Modify the Excel parser"
❌ "Update the build configuration"

---

## Testing Your Changes

### Before committing:

1. **Visual check:** Does it look good in the browser?
2. **Responsive check:** Resize browser window - does it work on mobile/tablet?
3. **Multiple browsers:** Test in Chrome, Firefox, Safari if possible
4. **All chart types:** Switch between Time Series, Top/Bottom, Radar, Factor Comparison
5. **Both modals:** Open "Learn about Index" and "How to Use" modals

### Taking screenshots:

Before creating a Pull Request, take screenshots:
- Desktop view (full width)
- Mobile view (narrow browser)
- Before/After comparison
- Attach to Pull Request for Santiago's review

---

## Getting Help

### From Santiago:
- Email/Slack/WhatsApp for questions
- Tag in Pull Request for review
- Schedule check-in calls if stuck

### From Claude Code:
- Ask for help with CSS/styling
- Ask to find where specific styles are defined
- Ask for responsive design suggestions
- Ask for accessibility improvements (color contrast, font sizes)

### Resources:
- `DESIGN_FILES_REFERENCE.md` - Quick reference of all files
- `DESIGN_GUIDE.md` - Complete step-by-step guide
- `START_HERE.md` - Initial setup guide

---

## Success Criteria

Your design changes are successful when:
- ✅ Visually appealing and professional
- ✅ Works on desktop, tablet, and mobile
- ✅ Maintains readability (good contrast, appropriate font sizes)
- ✅ Consistent with WJP Rule of Law Index brand
- ✅ No JavaScript errors in browser console
- ✅ npm start runs without errors
- ✅ Santiago approves the Pull Request

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────┐
│ DESIGNER QUICK REFERENCE                             │
├──────────────────────────────────────────────────────┤
│ Branch:        design (ALWAYS)                       │
│ Start session: SYNC with main (git pull origin main)│
│ Can modify:    Styles, colors, spacing, fonts       │
│ Cannot modify: Logic, data, configuration           │
│ Main files:    src/constants.js (colors)            │
│                src/responsive.css (mobile)          │
│                App.js (inline styles)               │
│ Workflow:      Sync → Edit → Save → Check browser  │
│                → Commit → Push → PR                 │
│ Test on:       Desktop, tablet, mobile              │
│                All 4 chart types, both modals       │
└──────────────────────────────────────────────────────┘
```

---

**Remember:** You're working on the visual design and user experience. Santiago handles the technical implementation and data processing. When in doubt, ask!
