## display
- [x] canvas size (`display.getEyeParameters('left').renderWidth`)
- [x] render webGL to both eyes
- [x] render 2 camera matricies
- [ ] us display info to build camera matrix (FOV, position, rotation, etc.)
- [ ] proper vr animation frame updating
- [ ] use head/controller input positions
- [ ] sync matcap shader

## adaptation
- [ ] controller ray instead of mouse ray for cursor
- [ ] ray distance to brush size
- [ ] use trigger sensitivity
- [ ] grip buttons
	- [ ] single, translate model
	- [ ] double, rotates|scales model

## ui
- [ ] left hand panels
  - [ ] look into mrdoob's html to canvas renderer

## general
- [ ] detect vr and if not supported show message (or adapt WEBVR.js)