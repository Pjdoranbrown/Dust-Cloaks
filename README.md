# Dust Cloaks - Refactored Version

## 📁 File Structure

Your game has been reorganized into clean, modular files:

```
├── index.html          # Main HTML - just structure, no logic (~120 lines)
├── styles.css          # All styling (~350 lines)
├── config.js           # Game data and constants (~170 lines)
├── assets.js           # Image loading (~60 lines)
├── gameState.js        # Game state and save/load (~70 lines)
├── utils.js            # Helper functions (~30 lines)
├── player.js           # Player object (~50 lines)
├── enemy.js            # Enemy class (~90 lines)
├── projectile.js       # Projectile class (~120 lines)
├── pickup.js           # XP/Gold pickup class (~80 lines)
├── squadmate.js        # Squad mate class (~170 lines)
├── ui.js               # All menus and screens (~400 lines)
└── game.js             # Main game loop (~150 lines)
```

**Total: ~1,710 lines** (down from 2,180, with cleaner organization!)

---

## 🎮 How to Run

### Option 1: Local Server (Recommended)
Because this uses ES6 modules, you need to run it from a server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 2: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 🔧 How Each Module Works

### **config.js** - The Brain
- All game constants (speeds, spawn rates, limits)
- Class definitions (Tank, Archer, Mage, etc.)
- Race definitions (Human, Elf, Dwarf, etc.)
- Weapon stats
- Upgrade definitions
- Name pools for random generation

**When to edit:** Balancing, adding new classes/races, tweaking game rules

---

### **assets.js** - The Asset Loader
- Loads all images
- Manages the ASSETS object
- Calls callback when everything is ready

**When to edit:** Adding new images/sprites

---

### **gameState.js** - The Memory
- GAME object (HP, XP, level, time, state)
- META object (gold, upgrades, unlocks)
- Keyboard input (keys object)
- Save/load to localStorage

**When to edit:** Adding new persistent upgrades, changing save data

---

### **utils.js** - The Helper
- Random name generation
- Distance calculations
- Collision detection
- Other utility functions

**When to edit:** Adding new helper functions you use across multiple files

---

### **player.js** - The Hero
- Player object definition
- Player initialization with class/race
- Applies race modifiers to stats

**When to edit:** Changing player behavior, adding player abilities

---

### **enemy.js** - The Threat
- Enemy class
- Spawning logic
- Movement AI
- Collision with player

**When to edit:** Enemy behavior, new enemy types, difficulty scaling

---

### **projectile.js** - The Damage
- Projectile class
- Movement and collision
- Damage application
- XP/Gold drop on enemy death

**When to edit:** Weapon behavior, projectile effects

---

### **pickup.js** - The Rewards
- Pickup class (XP gems, gold)
- Magnetic pull toward player
- Collection logic
- Level up triggering

**When to edit:** Pickup behavior, drop rates

---

### **squadmate.js** - The Companions
- SquadMate class
- Formation logic (Wedge vs Shield Wall)
- Combat behavior
- addSquadMate() function

**When to edit:** Squad behavior, formations, companion abilities

---

### **ui.js** - The Interface
- All menu screens (main, camp, roster, manual)
- Character creation
- Level up screen
- Game over/win screens
- HUD updates
- Event listeners

**When to edit:** UI changes, new screens, menu behavior

---

### **game.js** - The Engine
- Main game loop (update/draw/animate)
- Input handling
- Entity updates
- Canvas rendering
- Win/lose conditions

**When to edit:** Core gameplay loop, rendering changes

---

## 📝 Common Modifications

### Add a new class:
1. Open `config.js`
2. Add to `CLASS_DEFS`
3. Add image to `assets.js`

### Add a new upgrade:
1. Open `config.js`
2. Add to `UPGRADE_DEFS`
3. Add logic in relevant files (e.g., `game.js` for speed boosts)

### Change game balance:
1. Open `config.js`
2. Modify `CONFIG` constants
3. Adjust class/weapon stats

### Add a new screen:
1. Add HTML to `index.html`
2. Add styling to `styles.css`
3. Add logic to `ui.js`

---

## 🐛 Debugging Tips

### If nothing loads:
- Check browser console (F12)
- Make sure you're using a local server
- Verify all image files exist

### If saves don't work:
- Check `gameState.js`
- Clear localStorage: `localStorage.clear()` in console

### If rendering is broken:
- Check `game.js` draw() function
- Verify ASSETS are loaded

---

## 🚀 Next Steps

Now that your code is modular, you can:

1. **Add features one file at a time** without breaking everything
2. **Test individual systems** by importing just what you need
3. **Collaborate easier** - different people work on different files
4. **Reuse code** - import modules into other projects
5. **Debug faster** - know exactly where to look

Good luck with your game! 🎮
