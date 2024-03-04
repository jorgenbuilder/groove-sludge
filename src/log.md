Start with beat game
Pixel art rendering method in R3F
Reading up on the mariokartjs example is a good idea... maybe later
Create some fixed panels
drei Views overly complicated (View.Port just breaks my scene...)

- [x] Create beat game row

by setting up an orthographic camera, I can use the size parameter of useThree to size things for my game

- [x] Create the cursor and some moving boxes

box speed determination: const
box spawn and despawn timing:
boxes have a beatTime
boxes meshes de/spawn on time threshold relative to beatTime
mesh refs...

Beat game

- [x] Add shot value ui
- [ ] Fix position animation on grade UI components
- [ ] Add shot sfx (three different qualities)
- [x] Add metronome sfx
- [ ] Create a slightly longer tutorial (increase beat freq + streak req)
- [x] Limit key to space bar
- [ ] Add instructions for spacebar
- [ ] Add tutorial complete screen
- [ ] System to read audio tracks for levels... midi? json?
- [ ] Add a relapse period after shooting

Tone match game

- [x] Create UI
- [x] Create synth track in Tone.js
- [x] Play tone on beat, based on tone cursor
- [x] Add targets
- [ ] Track state of the match game (grade)

Horde game

- [ ] Spawn enemies
- [ ] Make enemies move toward player
- [ ] Make player shoot
- [ ] Implement hit detection
- [ ] Give player and enemies health
- [ ] Implement death handlers for entities
- [ ] Game over screen

Music system

- [ ] Centralize sequence information into the game store
- [ ] Make everything all work together
- [ ] Add audio to beat game
- [ ] Mechanism to start audio on first user interaction
- [ ] Create a midi file in fl studio, export it, pipe it into the beat game and the tone game

Misc

- [ ] Add instructions to disable smooth scrolling
- [ ] Make the canvas scale to fit the screen
- [ ] Get people to go fullscreen
- [ ] Title Screen
- [ ] Level selection screen (only after doing tutorial)
- [ ] Sequence out Someday (extend each section)
- [ ] Create instrument voices
- [ ] Create a 4 beat count in UI

Scoring

- [ ] Add game win screen
- [ ] Add scoring system accounting for beat, tone, and horde mechanics

How to coordinate audio as game scales 🤔

- [ ] Create timing grades for tone game
- [ ] Create basic
