## display
- [x] canvas size (`display.getEyeParameters('left').renderWidth`)
- [x] render webGL to both eyes
- [x] render 2 camera matricies
- [x] use frameData proj/view mats
- [x] proper vr animation frame updating
- [x] controller input transforms
- [ ] sync matcap shader

## adaptation
- [x] controller ray instead of mouse ray for cursor
	- [x] call SculptGL.onDeviceMove every frame (from WEBVR.update)
	- [x] SculptBase.preUpdate calls Picking fns with controller ray 
	- [x] Route controller trigger to onDeviceDown
- [ ] show ray visual
- [/] ray distance to brush size
- [/] use trigger sensitivity
- [ ] prevent out of control tool updates (large radius, wonky geom, updating every frame)
- [/] grip buttons
	- [x] translate model
	- [ ] relative rotation
	- [ ] double scales model

- [x] delta rotation
	- [x] can't seem to reconstruct model matrix when using M.getRotation()
	 oh ffs https://github.com/toji/gl-matrix/issues/245
	- [x] need to take relative controller position into account

## ui
- [ ] transform/mesh scenegraph node
- [ ] mesh load pipeline with ui shaders 
- [ ] left hand panels


## general
- [ ] detect vr and if not supported show message (or adapt WEBVR.js)

## bugs
- [ ] scaled meshes mess thing up
- [ ] can undo when no more history
- [ ] 2 grip scaling initial value needs to reset when one is unpressed
