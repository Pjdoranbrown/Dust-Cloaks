# Leads for game graphics (from an external Gemini playtest of Index 80)

These came from another AI's playtest. Some claims look out of date (for example: shadows already exist under most units; construction sites already have scaffolding, three builders who walk in and hammer, and dust puffs — see Index 77). Treat each as a LEAD: check it in the current game, then fold it into your report as confirmed (with your own concrete proposal), already done, or not recommended (say why).

## Cohesion
- The painted portraits and Rank'n cards suit the parchment UI but contrast with the in-world look.
- In-world overlays (speech bubbles, floating labels, the yellow dashed command-radius ring) are smooth vector shapes over a crunchier world. Idea: stepped/pixel-style borders and muted parchment fills for in-world overlays. Note the user just asked for sharper, more readable text (Index 79), so do not propose pixel fonts that hurt readability.
- Squad Leader look settings: Gemini felt "Retro" matches the world best, "Crisp" shimmers against terrain, and "Pixel sprite" has chibi proportions that clash. The current default is Crisp (3D world on). Give your own view on the best default.

## Squad spacing and formations
- Camp idlers cluster around the fire, wagon and Leader and stack on each other and on furniture.
- In combat, units inside the command radius (and especially in Brace / shield wall) stack, and their green health bars overlap. Open Order reads better but units can clip into tables/walls (tavern).
- Proposal: a soft separation force (14–18px personal space) for idle, default and Brace so a shield wall reads as a shoulder-to-shoulder line. This touches movement code (`slotTarget`, `updateMates`, `updatePeople`) — note the risk.

## Animation
- Walk cycle doesn't scale with speed (sprinting with Shift, moving while attacking) → "ice skating".
- Left/right turns snap instantly.
- Attackers don't lunge or recoil; struck enemies don't flash or stagger (check — `flash` exists on many units).
- Enemies vanish the frame they die and spawn coins with no collapse, fade or dust (check — Index 55 has corpses for 3D units).

## Relative scaling
- Trees (2–3 character heights) feel small next to buildings (3–4); suggestion +20–25%.
- Empty-plot signposts (about half a character tall) and battlefield coins (half a torso) feel oversized; suggestion −35–40%.
- In-world health bars are small (4–6px); suggestion 12–16px wide with a 1px dark border.

## Game-feel roadmap (Gemini's top five)
1. Hit-stop and knockback micro-tweens: nudge struck enemies 3–4px away from the hit and a 1–2 frame white flash.
2. Ground shadows under every character, enemy and tree (verify what exists first).
3. Staggered companion follow delay (80–150ms per unit) with spring-damped slot tracking.
4. Death collapse (250ms tilted fade) and dust puffs at feet when sprinting, bracing and at construction.
5. Subtle camera lerp toward movement/aim and a small decaying shake on Shield Bash or breaches (check the existing `G.shake` and the Screen shake setting).

For each: confirm or reject with evidence, give a concrete proposal (numbers, functions), effort, and whether a Sonnet delegate could do it safely or it needs the commander.
