# 👑 Princess Protect 🐎

> **A kid game designed by a 6 year old!** 🌟  
> Play as a brave knight riding a horse and protect Princess Milena from Greeks in her golden fortress!

🎮 **Play directly in your browser:**  
👉 **[http://boccbo.cc/princess-protect/](http://boccbo.cc/princess-protect/)**  
*(also available at: [https://mombotro.github.io/princess-protect/](https://mombotro.github.io/princess-protect/))*

---

## 🎮 How to Play

Open the [live game](http://boccbo.cc/princess-protect/) or [`index.html`](index.html) in any modern web browser (Chrome, Safari, Firefox, Edge).

### Simple Controls (Arrow Keys + Space)
| Key | Action | Description |
| :--- | :--- | :--- |
| **⬆️ Up Arrow** | **Gallop Forward** | Hold to gallop across the snow |
| **⬇️ Down Arrow** | **Slow Down / Reverse** | Brake or back up |
| **⬅️ ➡️ Left & Right** | **Steer Mount** | Turn the horse smoothly left and right |
| **␣ SPACEBAR** | **Knock Down Bad Guys!** | Big lance sweep that knocks Greeks flying! |
| **(Any Key)** | **Bump Trample** | Riding into bad guys also knocks them down! |
| **C** | **Cycle Camera** | Chase Cam, Cinematic Low-Angle Cam, Top-Down Tactical Cam |
| **M** | **Mute / Unmute** | Toggle sound effects & cheerful music |
| **P / ESC** | **Pause** | Pause and resume game |
| **Touchscreen** | **Virtual Controls** | Joystick on left, big **[💥 KNOCK DOWN!]** button on right |

*(WASD also works as an alternative to Arrow Keys)*

---

## 🛡️ Objective & Mechanics

1. **⭐ No Health Mode (Invincible for Kids)**:
   - **Active by default!** Princess Milena cannot lose health, and there is zero risk of getting a "Game Over".
   - The health bar displays `💖 NO HEALTH MODE (INVINCIBLE)` with a sparkling golden rainbow gradient.
   - Kids can freely explore, gallop around, and knock down bad guys without any stress or timer pressure!
   - Can be toggled on/off anytime with the `⭐ KIDS MODE: ON` button in the HUD or on the start screen.
2. **Knock Down Bad Guys**:
   - Simply gallop into bad guys or press **SPACEBAR** to swing your lance!
   - Bad guys fly high into the air with comical cartwheels, spinning stars, and funny "BOING!" cartoon sounds.
   - 1-hit knockout: standard bad guys burst into celebratory golden stars and popups (`BOING! 🌟`, `WHEEEE! 🚀`, `KABAM! 💥`).
   - Princess Milena cheers with joy and rings sweet Russian bells every time you knock down an invader!
3. **Continuous Wave Progression**:
   - When all bad guys in a wave are knocked down, a celebratory banner appears: *"WAVE COMPLETE! Great job!"*
   - The next wave rolls in seamlessly after 2.5 seconds.
   - No confusing upgrades or stores to interrupt the action.
4. **Enemy Archetypes**:
   - **Hoplite Scouts**: Lightweight foot soldiers.
   - **Shieldbearers**: March with bronze Aspis shields.
   - **Peltasts**: Light javelin skirmishers.
   - **Spartan Champions**: Big golden-armored champions.

---

## 🎨 Procedural Assets (100% Self-Contained)

All assets are generated dynamically via code:
- **3D Models (`js/models.js`)**:
  - Knight on Warhorse: Articulated steed with forward-facing orientation, animated legs, hooves, head/neck bob, tail sway, saddle, Bogatyr pointed helmet (shlem), flowing cape, sun shield, and lance.
  - Princess Milena: Royal pavilion, golden onion dome crowned with cross, kokoshnik headdress, braided hair, and traditional Sarafan.
  - Greek Warriors: Corinthian bronze helmets with horsehair crests, Aspis shields, linothorax armor, greaves, spears, and stun stars.
  - Kremlin Environment: Wooden palisade walls, 4 gate watchtowers, Russian birch trees, snow-capped pines, and glowing torch braziers.
- **Sound Engine (`js/audio.js`)**:
  - 100% synthesized Web Audio API sound effects (dynamic horse hoofbeats, whinnies, lance whooshes, cartoon spring boings, funny Greek flight yells, bell cheers, and heroic Slavic battle theme).
- **Physics & Camera (`js/physics.js`, `js/game.js`)**:
  - Custom momentum-based collision, launch vector calculation, ragdoll tumble rotation, and ground friction.
  - **Dynamic See-Through Obstacles**: Trees and the Princess pavilion/building automatically and smoothly become transparent (opacity 0.18–0.20) whenever they pass between the camera and the knight or get close to the camera, ensuring the player and the action are always 100% visible!
