## display
- [x] canvas size (`display.getEyeParameters('left').renderWidth`)
- [x] render webGL to both eyes
- [x] render 2 camera matricies
- [x] use frameData proj/view mats
- [x] proper vr animation frame updating
- [x] controller input transforms
- [ ] sync matcap shader

## adaptation
- [ ] controller ray instead of mouse ray for cursor
	- [x] call SculptGL.onDeviceMove every frame (from WEBVR.update)
	- [x] SculptBase.preUpdate calls Picking fns with controller ray 
	- [x] Route controller trigger to onDeviceDown
	- [ ] get sculpt effect
- [ ] ray distance to brush size
- [ ] use trigger sensitivity
- [ ] grip buttons
	- [ ] single, translate model
	- [ ] double, rotates|scales model

## ui
- [ ] transform/mesh scenegraph node
- [ ] mesh load pipeline with ui shaders 
- [ ] left hand panels


## general
- [ ] detect vr and if not supported show message (or adapt WEBVR.js)