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

- [ ] Add shot value ui
- [ ] Add shot sfx
