# RSN-Donate_Game: Rouge Support Network Runner
Reflect on your experience and prepare for job interviews and professional networking by answering all the questions below.
    -Challenge / twist mechanics:
    -Flood loss condition if score goes above 135 (“The Club floods with dollars”).
    -Investment phase (formerly dam-building) that changes gameplay (dollar-sign rain intensity decreases, money flow shifts toward The Club).

After investing, stored dollars drain over time, creating time pressure while you try to survive the “flourish” phase.
In this build, I was not limited by time, so I was able to keep the original scope of the concept by focusing on building one complete gameplay loop (start, move, collect dollar signs, track score/storage, and reach an ending by losing). Once the basics worked, I expanded the UI more than planned by introducing a twist: the investment phase, a flood-loss threshold, stored-money vs. draining mechanics, and a flourish timer. I enjoyed watching the game come to life and adding polish like changes to The Club and a win celebration (confetti + overlay). Next time, I would build in clearer phases and playtest earlier to catch confusion and balance issues sooner.

This project shows how I break a problem into smaller steps, test as I go, and keep iterating until the game feels clear and playable.
Next time, I would playtest earlier so I can tune the difficulty faster, but I’m proud that I was able to ship a working prototype with polished feedback.

## Game Mechanics & Win/Lose Conditions

### Game States
- **Start:** Age verification, difficulty selection, game introduction
- **Playing:** Active gameplay—collect cash, manage score, bank resources
- **Investment:** Triggered at score ≥ 25—transform to flourish phase with drain mechanics
- **Flourish:** Post-investment survival phase (30s timer on Normal)
- **Lost:** Market crash (score ≥ 135) or flourish failure without win conditions met
- **Won:** All win conditions achieved with celebration (confetti, victory overlay)

### Loss Conditions (Immediate)
1. **Market Crash:** Score exceeds 135 at any time
   - Message: `"You lost: pressure spiked above 135."`
   - Without investment: `"You lost: no investment was made before score 135."`

2. **Flourish Failure:** Timer expires without meeting win requirements
   - Message: `"You lost: flourish timer reached 0s before full bank was reached."`

### Win Conditions (All 4 Required)
1. ✅ **Investment Made:** Press D to unlock investment phase
2. ✅ **Score < 135:** Maintain risk below crash threshold
3. ✅ **Max Banked Cash:** Reach 100 cash in bank at least once
4. ✅ **Flourish Survival:** Survive 30 seconds after investment

### Difficulty Levels
| Level | Crash Threshold | Flourish Timer | Max Bank |
|-------|-----------------|----------------|-----------|
| Easy | 150 | 35s | 90 |
| Normal | 135 | 30s | 100 |
| Hard | 120 | 24s | 110 |

### Core Game Loop
1. **Collect Cash:** Move with arrow keys, gather falling cash drops
2. **Track Score:** Each drop increments score; triggers investment unlock at 25
3. **Bank Resources:** Press S to deposit cash into Club bank (capacity 100)
4. **Invest:** Press D to unlock flourish phase (requires 25+ banked cash)
5. **Flourish:** Survive timer while managing cash drain and score risk
6. **Outcome:** Win (confetti) or lose (crash message)

### Key Mechanics
- **Cash Drops:** Randomly spawn falling Cash.gif animations with neon glow effects
- **Cash Drain:** After investment, banked cash decreases over time (~2/sec)
- **Risk Management:** Higher score = higher pressure; avoid exceeding 135
- **Resource Pressure:** Balancing collection, banking, and drain to reach win state

## Project File Structure

- **index.html** — Main game engine, UI, inline styles, and JavaScript logic
- **style.css** — Global page styling (neon theme, cards, responsive layout)
- **devcontainer.json** — Development container configuration
- **RSN.img/** — Game assets folder
  - Cash.gif (start button animation)
  - RSN(Logo).webp (brand logo)
  - stock-neon-silhouette.jpg (club background)
  - Sex_Worker_Social.gif (investment celebration GIF)
  - WWAD.gif (market crash overlay GIF)
- **README.md** — This file (project documentation, reflections, mechanics)

### Key Implementation Details
- **Canvas Rendering:** 440×440px game board with real-time graphics updates
- **GIF Overlays:** HTML `<img>` elements positioned absolutely over canvas for native animation
- **Responsive Design:** Mobile-friendly layout with clamp() sizing
- **Age Verification:** Browser `prompt()` with localStorage persistence (min age 13)
- **Audio:** Procedural sound effects (beep/boop) using Web Audio API
- **Difficulty System:** Three preset modes (Easy/Normal/Hard) with balanced parameters

## Design Intent & Thematic Depth

The mechanical choices reflect systems thinking:
- **Flooding (score ≥ 135)** represents market collapse from unsustainable growth
- **Investment phase** transforms gameplay: resources drain, time tightens—risk shifts, not vanishes
- **Banking & drought cycles** mirror resource scarcity in precarious economies
- **The 30-second flourish** embodies survival under pressure

This isn't a game about winning "more"—it's about navigating constraints and understanding when systems break. The neon aesthetic masks the darker economic realities sex workers navigate daily. By choosing to bank, invest, and survive rather than accumulate endlessly, players experience a small taste of economic decision-making under duress.

