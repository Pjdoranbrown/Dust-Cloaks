# GitHub Deployment Guide

## Files Ready for Upload

Your game has been fully refactored into 16 modular files:

### Core Files (3)
- `index.html` - HTML structure (6.0K)
- `styles.css` - All styling (9.3K)
- `game.js` - Main entry point (5.5K)

### Configuration & Data (3)
- `config.js` - Game data, classes, races, upgrades (5.6K)
- `assets.js` - Image loading (815 bytes)
- `gameState.js` - State management & persistence (1.4K)

### Game Logic Modules (7)
- `entities.js` - Base Entity class (617 bytes)
- `squadmate.js` - Squad companion logic (9.2K)
- `enemy.js` - Enemy behavior (3.6K)
- `projectiles.js` - All 8 projectile types (5.9K)
- `pickups.js` - XP and Gold orbs (2.5K)
- `mainloop.js` - Main game loop (16K)
- `ui.js` - All menus and screens (9.9K)
- `utils.js` - Helper functions (584 bytes)

### Documentation (3)
- `README.md` - Complete project documentation
- `SETUP_INSTRUCTIONS.md` - Setup guide
- `GITHUB_DEPLOYMENT.md` - This file

**Total: ~82K of organized, modular code** (down from 2179 lines monolithic)

---

## Step-by-Step GitHub Deployment

### 1. Create GitHub Repository

```bash
# On GitHub.com:
# 1. Click "New Repository"
# 2. Name: "dust-cloaks"
# 3. Description: "Vampire Survivors-style squad combat game"
# 4. Public/Private: Your choice
# 5. DON'T initialize with README (we have our own)
# 6. Click "Create Repository"
```

### 2. Upload Files

**Option A: GitHub Web Interface (Easiest)**
1. Go to your new repository
2. Click "uploading an existing file"
3. Drag ALL files from `dust-cloaks-refactored` folder
4. Add commit message: "Initial commit - refactored modular structure"
5. Click "Commit changes"

**Option B: Git Command Line**
```bash
# In your dust-cloaks-refactored folder:
git init
git add .
git commit -m "Initial commit - refactored modular structure"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dust-cloaks.git
git push -u origin main
```

### 3. Add Your Image Files

**CRITICAL**: Don't forget to upload these images to the root of your repository:

```
tile_0087.png (SOLDIER)
tile_0084.png (MAGE)
tile_0098.png (CLERIC)
tile_0100.png (SCOUNDREL)
tile_0111.png (WITCH)
tile_0112.png (FOLK_HERO)
tile_0123.png (RAT)
tile_0120.png (BAT)
tile_0109.png (OGRE)
tile_0110.png (CRAB)
battlfield_tileset.png (BACKGROUND)
parchmentFoldedCrinkled.png (Menu background)
```

Upload these the same way you uploaded the code files.

### 4. Enable GitHub Pages

1. In your repository, click "Settings"
2. Scroll to "Pages" in left sidebar
3. Under "Source", select "main" branch
4. Click "Save"
5. Wait 1-2 minutes for deployment
6. Your game will be live at: `https://YOUR_USERNAME.github.io/dust-cloaks/`

---

## Testing Before Deployment

Before uploading to GitHub, test locally:

```bash
# In your dust-cloaks-refactored folder:
python -m http.server 8000

# Then open in browser:
http://localhost:8000
```

**Expected behavior:**
- Start screen loads with parchment background ✓
- Buttons work (RECRUIT, ROSTER, CAMP, MANUAL) ✓
- Character creation works ✓
- Game starts and runs smoothly ✓
- All sprites load correctly ✓

**If images don't load:**
- Verify all image files are in the same folder as index.html
- Check browser console (F12) for errors
- Verify filenames match EXACTLY (case-sensitive)

---

## Common Issues & Fixes

### Issue: "CORS error" or "Module not found"
**Cause**: Opening index.html directly (file://)
**Fix**: MUST use a web server (see Testing section above)

### Issue: Buttons don't work
**Cause**: game.js not loading
**Fix**: 
1. Check browser console (F12) for errors
2. Verify all .js files are in same folder as index.html
3. Clear browser cache (Ctrl+Shift+R)

### Issue: Images don't load
**Cause**: Missing or misnamed image files
**Fix**:
1. Verify ALL 12 images are uploaded
2. Check filenames match exactly (case-sensitive)
3. Open browser console to see which images failed

### Issue: Game works locally but not on GitHub Pages
**Cause**: Missing files in repository
**Fix**:
1. Check all 16 code files are uploaded
2. Check all 12 image files are uploaded
3. Wait 5 minutes, GitHub Pages can be slow

---

## File Structure in Repository

```
dust-cloaks/
├── index.html              (Entry point)
├── styles.css              (All styles)
├── game.js                 (Main coordinator)
├── config.js               (Game data)
├── assets.js               (Image loader)
├── gameState.js            (State & saves)
├── utils.js                (Helpers)
├── entities.js             (Base class)
├── squadmate.js            (Squad logic)
├── enemy.js                (Enemy AI)
├── projectiles.js          (Weapons)
├── pickups.js              (XP & Gold)
├── mainloop.js             (Game loop)
├── ui.js                   (All menus)
├── README.md               (Documentation)
├── tile_0087.png           (SOLDIER sprite)
├── tile_0084.png           (MAGE sprite)
├── tile_0098.png           (CLERIC sprite)
├── tile_0100.png           (SCOUNDREL sprite)
├── tile_0111.png           (WITCH sprite)
├── tile_0112.png           (FOLK_HERO sprite)
├── tile_0123.png           (RAT sprite)
├── tile_0120.png           (BAT sprite)
├── tile_0109.png           (OGRE sprite)
├── tile_0110.png           (CRAB sprite)
├── battlfield_tileset.png  (Background)
└── parchmentFoldedCrinkled.png (Menu BG)
```

---

## Module Architecture

### Import/Export Flow
```
game.js (Entry Point)
├─> imports ALL modules
├─> injects dependencies (breaks circular refs)
├─> initializes game
└─> exposes UI functions to window.gameUI

Individual modules:
- Export their classes/functions
- Import only what they need
- Receive complex dependencies via injection
- No circular imports!
```

### Why This Structure?

**Before (Original):**
- 2179 lines in one file
- Hard to maintain
- Hard to debug
- Hard to expand
- Hard to collaborate

**After (Refactored):**
- 16 focused modules
- Clear separation of concerns
- Easy to find code
- Easy to modify individual systems
- Team-friendly
- Godot/Java conversion ready

---

## Next Steps After Deployment

### 1. Verify Live Deployment
Visit `https://YOUR_USERNAME.github.io/dust-cloaks/`
- Test all features
- Try on mobile
- Share with friends

### 2. Update Repository
Any time you make changes:
```bash
git add .
git commit -m "Description of changes"
git push
```
Wait 1-2 minutes, changes go live automatically.

### 3. Expand Your Game
Now that code is modular:
- Add new classes in `config.js`
- Add new projectiles in `projectiles.js`
- Add new enemies in `enemy.js`
- Add new upgrades in `config.js`
- Each change isolated to one file!

---

## Getting Help

**If deployment fails:**
1. Check browser console (F12 → Console tab)
2. Copy any error messages
3. Check filenames are exact
4. Verify GitHub Pages is enabled
5. Wait 5 minutes and try again

**Game works locally but not on GitHub:**
- Verify ALL files uploaded (16 code + 12 images)
- Check GitHub Pages settings
- Try incognito/private browsing (clears cache)

---

## Success Checklist

Before considering deployment complete:

- [ ] All 16 code files uploaded to GitHub
- [ ] All 12 image files uploaded to GitHub
- [ ] GitHub Pages enabled
- [ ] Game loads at github.io URL
- [ ] Start screen displays correctly
- [ ] All buttons work
- [ ] Character creation works
- [ ] Game plays correctly
- [ ] Sprites load
- [ ] Save/load works
- [ ] No console errors

---

**Congratulations!** Your game is now modular, maintainable, and deployed! 🎮
