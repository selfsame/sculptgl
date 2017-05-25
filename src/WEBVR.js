/**
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 */

window.VRSCALE = 160;

var v3mult = function(A, n){
	return [A[0]*n,A[1]*n,A[2]*n];
}

var v3plus = function(A, B){
	return [A[0]+B[0],A[1]+B[1],A[2]+B[2]];
}

var v3sub = function(A, B){
	return [A[0]-B[0],A[1]-B[1],A[2]-B[2]];
}

var v3dist = function(A, B){
	var x = A[0] - B[0];
	var y = A[1] - B[1];
	var z = A[2] - B[2];
	return Math.sqrt( x*x + y*y + z*z );
}

var qinverse = function(Q) {
      var w = Q[3];
      var x = Q[0];
      var y = Q[1];
      var z = Q[2];
      var normSq = w * w + x * x + y * y + z * z;
      if (normSq === 0) return [ 0, 0, 0, 1 ];
      normSq = 1 / normSq;
      return [-x * normSq, -y * normSq, -z * normSq, w * normSq];
}

var WEBVR = {
	displays: null,
	display: null,
	eyeparams: null,
	eyedims: [1512,1680],
	eyeoffset: 3,
	layer: null,
	tools: [0,1,4,5,6],
	toolColors: [[1,0,0],[0,1,0],[0,0,1],[1,1,0],[0,1,1]],
	currentTool: 0,
	S: 1,
	initialS: 1,

	init: function () {
		navigator.getVRDisplays().then(this.vrinit.bind(this));

	},

	vrinit: function(displays){
		console.log(this);
		this.displays = displays;
		this.display = displays[0];
		var eyeparams = this.display.getEyeParameters('left');
		this.eyeparams = eyeparams;
		this.eyedims = [eyeparams.renderWidth, eyeparams.renderHeight];
		this.eyeoffset = eyeparams.offset;
		window.Scene.onCanvasResize();
		this.layer = {leftBounds:[0.0, 0.0, 0.5, 1.0],rightBounds:[0.5, 0.0, 0.5, 1.0]};
		this.layer.source = document.getElementById("canvas");
		document.body.appendChild(this.getButton());
		window.OFF = 4;

		window.useProj = true;
		window.gamepads = [];
		window.arrow = Primitives.createArrow(Scene._gl);
		this.display.requestAnimationFrame(this.update.bind(this));
		window.pose = {position: [0, 0, 0.5], orientation:[ 0, 0, 0, 1 ]}
		Scene._sculptManager.getCurrentTool().getMesh()._renderData._curvature = 3;
	},
	updateEye: function(n){
		if (window['pose'] && window['pose']['position']) {
			if (window['frameData']){
				if (n == -1) {
					mat4.translate(Scene._camera._view, 
						frameData.leftViewMatrix, 
						v3plus(v3mult(pose.position, -VRSCALE),
							  vec3.transformQuat([0,0,0],[(-n*OFF),0,0], pose.orientation))
						);
					window.leftProjectionMatrix = frameData.leftProjectionMatrix
					Scene._camera._proj = frameData.leftProjectionMatrix
				}
				if (n == 1) {
					mat4.translate(Scene._camera._view, 
						frameData.rightViewMatrix, 
						v3plus(v3mult(pose.position, -VRSCALE),
							  vec3.transformQuat([0,0,0],[(-n*OFF),0,0], pose.orientation))
						);
					Scene._camera._proj = frameData.rightProjectionMatrix
				}
			}
		} 
	},
	updateGamepads: function(delta){
		var pad = gamepads[0];
		if (pad && pad['pose']['position'] && pad['pose']['orientation']){
			var pose = pad.pose;

			//grip
			if (!pad['lastPosition']) {pad['lastPosition'] = pose['position']}
			if (!pad['lastOrientation']) {pad['lastOrientation'] = pose['orientation']}
			var deltaPos = v3sub(pose['position'], pad['lastPosition']);
			pad['lastPosition'] = pose['position'];

			var deltaOrientation = quat.mul([0,0,0,0],
				quat.inv([0,0,0,0], pad['lastOrientation']),
				pose['orientation']) 

			pad['lastOrientation'] = pose['orientation'];
			Scene._sculptManager.getCurrentTool().getMesh()
			var mesh = Scene._sculptManager.getCurrentTool().getMesh();
			var M = mesh._transformData._matrix;

			if (pad.buttons[2].pressed ) { 

				if (!pad['gripPressed']){
					pad['gripPressed'] = true;
					gamepads[1]['distCache'] = v3dist(gamepads[1].pose.position, pose.position);
					this.initialS = this.S;
				}

				if (gamepads[1] && gamepads[1]['gripPressed'] == true){
					//console.log(mat4.getScale([0,0,0], M));
					var initialDist = gamepads[1]['distCache'];
					var dist = v3dist(gamepads[1].pose.position, pose.position);
					this.S = (dist / initialDist)*this.initialS;
				}

				

				if (mesh){
					mat4.fromRotationTranslationScale( M,					 
						quat.mul([0,0,0,0],
							mat4.getRotation([0,0,0,0], M),
							deltaOrientation), 
						v3plus(mat4.getTranslation([0,0,0], M), 
							   v3mult(deltaPos, VRSCALE)),
						[60*this.S,60*this.S,60*this.S]);

					mat4.fromQuat
				}
			} else {
				if (pad['gripPressed']){
					pad['gripPressed'] = false;
				}
			}
			
			mat4.mul(
				arrow._transformData._matrix,
				mat4.fromTranslation(arrow._transformData._matrix,
					v3mult(pose.position, VRSCALE)),
				 mat4.fromQuat(mat4.create(), pose.orientation));
			Scene.onControllerMove(v3mult(pose.position, VRSCALE*30 ));

			if (pad.buttons[1].pressed) {
				if (!pad['triggerPressed']){
					pad['triggerPressed'] = true;
					Scene.onControllerDown();
				}
			} else {
				if (pad['triggerPressed']){
					pad['triggerPressed'] = false;
					Scene.onControllerUp();
				}
			}

			Scene._sculptManager.getCurrentTool()._intensity = pad.buttons[1].value;

			if (pad.buttons[0].pressed ) {
				if (!pad['padPressed']){
					pad['padPressed'] = true;
					var neg = Scene._sculptManager.getCurrentTool()._negative;
					Scene._sculptManager.getCurrentTool()._negative = !neg;
				}
			} else {
				if (pad['padPressed']){
					pad['padPressed'] = false;
				}
			}

			if (pad.buttons[3].pressed ) {
				if (!pad['menuPressed']){
					pad['menuPressed'] = true;
					Scene._stateManager.redo()
				}
			} else {
				if (pad['menuPressed']){
					pad['menuPressed'] = false;
				}
			}
			
		}

		//////////////////////////////////////////////

		var pad = gamepads[1];
		if (pad && pad['pose']['position']){
			var pose = pad.pose;

			if (pad.buttons[0].pressed ) {
				if (!pad['padPressed']){
					pad['padPressed'] = true;
					this.currentTool++;
					if (this.currentTool >= this.tools.length)
					{
						this.currentTool = 0;
					}
					Scene._sculptManager._toolIndex = this.tools[this.currentTool];
					arrow._renderData._flatColor = this.toolColors[this.currentTool];
				}
			} else {
				if (pad['padPressed']){
					pad['padPressed'] = false;
				}
			}

			if (pad.buttons[1].pressed ) {
				if (!pad['triggerPressed']){
					pad['triggerPressed'] = true;
					pad['lastTool'] = Scene._sculptManager._toolIndex;
					Scene._sculptManager._toolIndex = 3;
					arrow._renderData._flatColor = [1,0,1];
				}
			} else {
				if (pad['triggerPressed']){
					pad['triggerPressed'] = false;
					Scene._sculptManager._toolIndex = pad['lastTool'];
					arrow._renderData._flatColor = this.toolColors[this.currentTool];
				}
			}
			if (pad.buttons[3].pressed ) {
				if (!pad['menuPressed']){
					pad['menuPressed'] = true;
					Scene._stateManager.undo()
				}
			} else {
				if (pad['menuPressed']){
					pad['menuPressed'] = false;
				}
			}

			if (pad.buttons[2].pressed ) { 
				if (!pad['gripPressed']){
					pad['gripPressed'] = true;
					// cache controller position
					pad['distCache'] = v3dist(gamepads[0].pose.position, pose.position);
					this.initialS = this.S;
				}
			} else {
				if (pad['gripPressed']){
					pad['gripPressed'] = false;
				}
			}
			 
		}
	},
	update: function(delta){
		this.display.requestAnimationFrame(this.update.bind(this));
		if (this.display.isPresenting) {
			var frameData = new VRFrameData();
        	this.display.getFrameData(frameData);
        	window.frameData = frameData;
			window.pose = frameData.pose;
			window.gamepads = navigator.getGamepads();
			this.updateGamepads();
			Scene.applyRender();
			this.display.submitFrame(pose);
		}
	},
	controllerRay: function(idx){
		var pad = gamepads[idx];
		if (pad){
			return [
				v3mult(pad.pose.position, VRSCALE), 
				vec3.transformQuat([0,0,0],[0,-1000,0], pad.pose.orientation)];
		}
		return [[0,0,0],[0,0,0]];
	},
	controllerDistance: function(v){
		var mesh = Scene._sculptManager.getCurrentTool().getMesh();
		var M = mesh._transformData._matrix;
		v = v3plus(v, mat4.getTranslation([0,0,0], M));
		var pad = gamepads[0];
		if (pad){
			var dist = (v3dist(v, v3mult(pad.pose.position, VRSCALE))*0.1)/this.S;
			return Math.max(((dist*dist)-7), 0.1);
		}
		return 1;
	},

	isLatestAvailable: function () {
		return navigator.getVRDisplays !== undefined;
	},

	isAvailable: function () {
		return navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined;
	},

	getMessage: function () {
		var message;
		if ( navigator.getVRDisplays ) {
			navigator.getVRDisplays().then( function ( displays ) {
				if ( displays.length === 0 ) message = 'WebVR supported, but no VRDisplays found.';
			});
		} else if ( navigator.getVRDevices ) {
			message = 'Your browser supports WebVR but not the latest version. See <a href="http://webvr.info">webvr.info</a> for more info.';
		} else {
			message = 'Your browser does not support WebVR. See <a href="http://webvr.info">webvr.info</a> for assistance.';
		}

		if ( message !== undefined ) {
			var container = document.createElement( 'div' );
			container.style.position = 'absolute';
			container.style.left = '0';
			container.style.top = '0';
			container.style.right = '0';
			container.style.zIndex = '999';
			container.align = 'center';
			var error = document.createElement( 'div' );
			error.style.fontFamily = 'sans-serif';
			error.style.fontSize = '16px';
			error.style.fontStyle = 'normal';
			error.style.lineHeight = '26px';
			error.style.backgroundColor = '#fff';
			error.style.color = '#000';
			error.style.padding = '10px 20px';
			error.style.margin = '50px';
			error.style.display = 'inline-block';
			error.innerHTML = message;
			container.appendChild( error );
			return container;
		}
	},

	getButton: function ( ) {
		console.log(this);
		var button = document.createElement( 'button' );
		button.style.position = 'absolute';
		button.style.left = 'calc(50% - 50px)';
		button.style.bottom = '20px';
		button.style.width = '100px';
		button.style.border = '0';
		button.style.padding = '8px';
		button.style.cursor = 'pointer';
		button.style.backgroundColor = '#000';
		button.style.color = '#fff';
		button.style.fontFamily = 'sans-serif';
		button.style.fontSize = '13px';
		button.style.fontStyle = 'normal';
		button.style.textAlign = 'center';
		button.style.zIndex = '999';
		button.textContent = 'ENTER VR';
		button.onclick = function() {
			if (this.display.isPresenting) {
				this.display.exitPresent();
			} else {
				this.display.requestPresent([this.layer]);
			}
		}.bind(this);

		window.addEventListener( 'vrdisplaypresentchange', function ( event ) {
			button.textContent = this.display.isPresenting ? 'EXIT VR' : 'ENTER VR';
		}.bind(this), false );

		return button;

	}

};

export default WEBVR;