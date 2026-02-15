# Dust Cloaks - Refactored

Your 2179-line game has been refactored into 14 modular files for easier maintenance and expansion.

## 📁 File Structure

```
dust-cloaks-refactored/
├── README.md               # This file
├── index.html              # HTML structure (~150 lines)
├── styles.css              # All CSS (~400 lines)
├── config.js               # Game data & constants (~160 lines)
├── assets.js               # Image loading (~20 lines)
├── gameState.js            # State & persistence (~60 lines)
├── utils.js                # Helper functions (~15 lines)
├── player.js               # Player initialization (~30 lines)
├── entities.js             # Base Entity class (~15 lines)
├── squadmate.js            # Squad logic (~150 lines)
├── enemy.js                # Enemy behavior (~100 lines)
├── projectiles.js          # All projectile types (~250 lines)
├── pickups.js              # XP and gold (~80 lines)
├── ui.js                   # All menus & screens (~450 lines)
└── game.js                 # Main loop & rendering (~300 lines)
```

**Total:** ~2000 lines (organized vs 2179 unorganized)

## 🚀 How to Run

### Option 1: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

### Option 2: GitHub Pages
1. Upload all files to your repository
2. Enable GitHub Pages in Settings
3. Deploy from main branch
4. Access at `https://yourusername.github.io/repository-name/`

## 📦 Required Image Files

Make sure these files are in the same directory:
- `tile_0087.png` (SOLDIER)
- `tile_0084.png` (MAGE)
- `tile_0098.png` (CLERIC)
- `tile_0100.png` (SCOUNDREL)
- `tile_0111.png` (WITCH)
- `tile_0112.png` (FOLK_HERO)
- `tile_0123.png` (RAT)
- `tile_0120.png` (BAT)
- `tile_0109.png` (OGRE)
- `tile_0110.png` (CRAB)
- `battlfield_tileset.png` (BACKGROUND)
- `parchmentFoldedCrinkled.png` (Menu background)

## 🔧 Module Guide

### **config.js** - All Game Data
Contains:
- CONFIG (game constants)
- CLASS_DEFS (all character classes)
- ENEMY_DEFS (enemy types)
- RACES (player races)
- NAMES (name pools)
- UPGRADES (camp upgrades)

**When to edit:** Balance changes, new classes/enemies/races

### **assets.js** - Image Loading
Loads all game images with exact original filenames.

**When to edit:** Adding new sprites

### **gameState.js** - State Management
- GAME object (current run state)
- META object (persistent data)
- keys object (input)
- save/load functions

**When to edit:** Adding new persistent upgrades

### **utils.js** - Helpers
- getRandomName()
- checkCollision()

**When to edit:** Adding utility functions

### **player.js** - Player Initialization
Sets up the player object based on chosen class/race.

**When to edit:** Player-specific mechanics

### **entities.js** - Base Entity Class
Simple base class for all game entities.

**When to edit:** Core entity behavior

### **squadmate.js** - Squad Logic
- SquadMate class
- Formation logic (WEDGE/SHIELD)
- Squad upgrades
- Combat behavior

**When to edit:** Squad mechanics, formations

### **enemy.js** - Enemy Behavior
- Enemy class
- Movement AI
- Status effects (poison, fear, slow)
- Spawning logic

**When to edit:** Enemy behavior, difficulty

### **projectiles.js** - All Projectile Types
- Base Projectile class
- MeleeSwipe (Soldier)
- DaggerMelee (Scoundrel)
- MagicMissile (Mage)
- Shockwave (Cleric)
- PoisonBolt (Witch)
- StraightShot (Folk Hero)
- FireballZone
- Trap

**When to edit:** Weapon behavior, special effects

### **pickups.js** - Drops
- XPOrb class
- GoldOrb class
- Magnetic pickup

**When to edit:** Drop rates, pickup behavior

### **ui.js** - All Screens
- Character creation
- Roster management
- Camp upgrades
- Manual/help
- Level up
- Game over/win
- HUD updates

**When to edit:** UI changes, new screens

### **game.js** - Main Loop
- Game loop (update/draw/animate)
- Input handling
- Entity updates
- Collision detection
- Win/lose conditions

**When to edit:** Core gameplay loop

## 🎯 Common Tasks

### Add a New Class
1. Open `config.js`
2. Add to `CLASS_DEFS`
3. Add image to `assets.js`
4. Add projectile type to `projectiles.js` if needed

### Add a New Upgrade
1. Open `config.js`
2. Add to `UPGRADES` array
3. Add logic in relevant files (e.g., `squadmate.js` for damage boosts)

### Change Balance
1. Open `config.js`
2. Modify values in CONFIG, CLASS_DEFS, ENEMY_DEFS
3. No code changes needed!

### Add a New Screen
1. Add HTML to `index.html`
2. Add styles to `styles.css`
3. Add logic to `ui.js`

## 🐛 Troubleshooting

### Nothing loads
- Check browser console (F12)
- Verify you're using a local server (not file://)
- Check all image files are present

### Buttons don't work
- Check console for errors
- Verify all .js files are in same directory
- Clear cache and reload

### Saves don't persist
- Check localStorage isn't disabled
- Try `localStorage.clear()` in console
- Reload page

## 📝 What Changed

**What was refactored:**
- Code organization into modules
- ES6 imports/exports
- Cleaner separation of concerns

**What was NOT changed:**
- All image filenames (exact originals)
- All colors, fonts, styles (exact originals)
- All text and flavor (exact originals)
- Game mechanics (exact originals)
- Visual appearance (exact originals)

This is a **structure-only refactor** - the game plays identically to the original.

## 🚀 Future Expansion

Now that code is modular, you can:
- Work on individual systems without breaking others
- Easily add new classes/enemies/races
- Test individual modules
- Collaborate with others (different people, different files)
- Reuse modules in other projects
- Convert to Godot/Java more easily

Good luck with your game! 🎮
