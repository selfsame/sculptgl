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
- [x] ray distance to brush size
- [x] use trigger sensitivity
- [ ] prevent out of control tool updates (large radius, wonky geom, updating every frame)
- [x] grip buttons
	- [x] translate model
	- [x] relative rotation
	- [x] double scales model

- [x] delta rotation
	- [x] can't seem to reconstruct model matrix when using M.getRotation()
	 oh ffs https://github.com/toji/gl-matrix/issues/245
	- [x] need to take relative controller position into account

- [x] move tool
	- [x] rewrite from [x,y] mouse delta to pad position delta
		- [x] store stroke initial position, Move dir is delta from start?
		- [x] symmetry

## ui
- [ ] transform/mesh scenegraph node
- [ ] mesh load pipeline with ui shaders 
- [ ] left hand panels


## general
- [ ] detect vr and if not supported show message (or adapt WEBVR.js)

## bugs
- [x] scaled meshes mess thing up
- [ ] can undo when no more history
- [ ] 2 grip scaling initial value needs to reset when one is unpressed

- [x] WEBVR.ControllerDistance needs to get distance to picking intersect

- [/] remesh / save needs to normalize mesh
	- [ ] preserve transform?
	- [ ] normalize multiple meshes for save
