
import Primitives from './drawables/Primitives';
import Enums from './misc/Enums';

window.VRSCALE = 160;

var v3mult = function(A, n){
	return [A[0]*n,A[1]*n,A[2]*n];
}

var v3div = function(A, n){
	return [A[0]/n[0],A[1]/n[1],A[2]/n[2]];
}

var v3times = function(A, n){
  return [A[0]*n[0],A[1]*n[1],A[2]*n[2]];
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

var getScaling = function (out, mat) {
  var m11 = mat[0],
      m12 = mat[1],
      m13 = mat[2],
      m21 = mat[4],
      m22 = mat[5],
      m23 = mat[6],
      m31 = mat[8],
      m32 = mat[9],
      m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
};


var QM = function(A, B){return quat.mul([0,0,0,0],A,B)}
var QI = function(A){return quat.invert([0,0,0,0],A)}
var M4Q = function(M){return mat4.getRotation([0,0,0,0], M)}

var WEBVR = {
	displays: null,
	display: null,
	eyeparams: null,
	eyedims: [1512,1680],
	eyeoffset: 3,
	layer: null,
	tools: [0,1,4,5,6,9],
	toolColors: [[1,0,0],[0,1,0],[0,0,1],[1,1,0],[0,1,1],[0,0,0]],
	currentTool: 0,
	initialS: [1,1,1],
	debug_point: null,
	right:{},
	left:{},

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
		this.debug_point = this.make_point(Scene._gl, [0,1,1])
	},

  make_point(gl, color){
    var point = Primitives.createCube(gl);
    var pointm = point.getMatrix(); 
    var scale = 0.8;
    mat4.scale(pointm, pointm, [scale, scale, scale]);
    point.setShaderType(Enums.Shader.NORMAL); //WIREFRAME
    point.setFlatColor(color);
    return point
  },

  set_position(M, V){
    //mat4.identity(M)
    var offset = mat4.getTranslation([0,0,0], M)
    mat4.fromTranslation(M, V)
  },

  scaled_position(mesh, V){
    var M = scene._mesh._transformData._matrix
    var S = getScaling([0,0,0], M)
    var gridm = mesh.getMatrix()
    this.set_position(gridm, v3times(V, S))
    mat4.scale(gridm, gridm, [0.4,0.4,0.4])
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

	debugScale: function(){
		var mesh = Scene._sculptManager.getCurrentTool().getMesh();
		var M = mesh._transformData._matrix;
		console.log(mat4.getScale([0,0,0], M));
	},

	resetMesh: function(mesh){
		var M = mesh._transformData._matrix
		var S = Scene._mesh.scale
		mat4.fromRotationTranslationScale(M, quat.create(), [0,0,0], [S,S,S])
	},

	getRightPosition(){
		if (gamepads[0] && gamepads[0]['pose']['position']){
			return gamepads[0]['pose']['position']
		}
		return [0,0,0]
	},

	getRightDeltaPosition(){
		if (gamepads[0] && this.right['deltaPosition'] && this.right['strokeStartPosition']){
			return v3sub(gamepads[0]['pose']['position'], this.right['strokeStartPosition'])
		}
		return [0,0.01,0]
	},

	rightOffset(mesh){
		var M = mesh.getMatrix()
    var matInverse = mat4.create();
    var IP = Scene._picking._interPoint
    
    mat4.invert(matInverse, mesh.getMatrix())
    //var V = vec3.transformMat4([0,0,0], this.getRightDeltaPosition(), matInverse)
    //return v3sub(IP, V)
    var V = this.getRightDeltaPosition()
    var S = mat4.getScale([0,0,0], Scene._mesh._transformData._matrix)
    S = v3div([60,60,60],S)
    //V = v3times(V,S)
    return v3times(vec3.transformQuat(V, V, M4Q(matInverse)), [2,2,2])
	},

	updateGamepads: function(delta){
		var right = this.right
		var left = this.left
		var pad = gamepads[0];
		if (pad && pad['pose']['position'] && pad['pose']['orientation']){
			var pose = pad.pose;

			//grip
			if (!right['lastPosition']) {right['lastPosition'] = pose['position']}
			if (!right['lastOrientation']) {right['lastOrientation'] = pose['orientation']}
			var deltaPos = v3sub(pose['position'], right['lastPosition']);
			right['deltaPosition'] = deltaPos
			right['lastPosition'] = pose['position'];

			var deltaOrientation = QM(pose['orientation'],QI(right['lastOrientation']))

			right['lastOrientation'] = pose['orientation'];

			var mesh = Scene._sculptManager.getCurrentTool().getMesh();
			var M = mesh._transformData._matrix;
			
			if (Scene._mesh.scale == null){
				Scene._mesh.scale = mat4.getScale([0,0,0], M)[0]
			}
			var S = Scene._mesh.scale

			if (pad.buttons[2].pressed ) { 
				if (!right['gripPressed']){
					right['gripPressed'] = true;
					if (gamepads[1] && gamepads[1]['pose']['position']) {
						left['distCache'] = v3dist(gamepads[1].pose.position, pose.position)
					}
					this.initialS = Scene._mesh.scale;
				}
				
				if (gamepads[1] && left['gripPressed'] == true){
					var initialDist = left['distCache'];
					var dist = v3dist(gamepads[1].pose.position, pose.position);
					Scene._mesh.scale = this.initialS * (dist / initialDist);
				}

 				var rot = M4Q(M)
				if (mesh){
					mat4.fromRotationTranslationScale( M,	
						QM( deltaOrientation, rot),
						v3plus(
							mat4.getTranslation([0,0,0], M), 
							v3mult(deltaPos, VRSCALE)),
						[S,S,S]);
				}
			} else {
				if (right['gripPressed']){
					right['gripPressed'] = false;
				}
			}
			
			mat4.mul(
				arrow._transformData._matrix,
				mat4.fromTranslation(arrow._transformData._matrix,
					v3mult(pose.position, VRSCALE)),
				 mat4.fromQuat(mat4.create(), pose.orientation));
			Scene.onControllerMove(v3mult(pose.position, VRSCALE*30 ));

			if (pad.buttons[1].value > 0) {
				if (!right['triggerPressed']){
					right['triggerPressed'] = true;
					right['strokeStartPosition'] = pad.pose.position
					Scene.onControllerDown();
				}
			} else {
				if (right['triggerPressed']){
					right['triggerPressed'] = false;
					Scene.onControllerUp();
				}
			}

			Scene._sculptManager.getCurrentTool()._intensity = pad.buttons[1].value*0.8;

			if (pad.buttons[0].pressed ) {
				if (!right['padPressed']){
					right['padPressed'] = true;
					var neg = Scene._sculptManager.getCurrentTool()._negative;
					Scene._sculptManager.getCurrentTool()._negative = !neg;
				}
			} else {
				if (right['padPressed']){
					right['padPressed'] = false;
				}
			}

			if (pad.buttons[3].pressed ) {
				if (!right['menuPressed']){
					right['menuPressed'] = true;
					Scene._stateManager.redo()
				}
			} else {
				if (right['menuPressed']){
					right['menuPressed'] = false;
				}
			}
			
		}

		//////////////////////////////////////////////

		var pad = gamepads[1];
		if (pad && pad['pose']['position']){
			var pose = pad.pose;

			mat4.mul(
				this.debug_point._transformData._matrix,
				mat4.fromTranslation(this.debug_point._transformData._matrix,
					v3mult(pose.position, VRSCALE)),
				 mat4.fromQuat(mat4.create(), pose.orientation));

			if (pad.buttons[0].pressed ) {
				if (!left['padPressed']){
					left['padPressed'] = true;
					this.currentTool++;
					if (this.currentTool >= this.tools.length)
					{
						this.currentTool = 0;
					}
					Scene._sculptManager._toolIndex = this.tools[this.currentTool];
					arrow._renderData._flatColor = this.toolColors[this.currentTool];
				}
			} else {
				if (left['padPressed']){
					left['padPressed'] = false;
				}
			}

			if (pad.buttons[1].touched ) {
				if (!left['triggerPressed']){
					left['triggerPressed'] = true;
					left['lastTool'] = Scene._sculptManager._toolIndex;
					Scene._sculptManager._toolIndex = 3;
					arrow._renderData._flatColor = [1,0,1];
				}
			} else {
				if (left['triggerPressed']){
					left['triggerPressed'] = false;
					Scene._sculptManager._toolIndex = left['lastTool'];
					arrow._renderData._flatColor = this.toolColors[this.currentTool];
				}
			}
			if (pad.buttons[3].pressed ) {
				if (!left['menuPressed']){
					left['menuPressed'] = true;
					Scene._stateManager.undo()
				}
			} else {
				if (left['menuPressed']){
					left['menuPressed'] = false;
				}
			}

			if (pad.buttons[2].pressed ) { 
				if (!left['gripPressed']){
					left['gripPressed'] = true;
					// cache controller position
					left['distCache'] = v3dist(gamepads[0].pose.position, pose.position);
					this.initialS = Scene._mesh.scale;
				}
			} else {
				if (left['gripPressed']){
					left['gripPressed'] = false;
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
		v = vec3.transformMat4([0,0,0], v, M)
		
		//this.set_position(WEBVR.debug_point._transformData._matrix, v)
		var pad = gamepads[0];
		if (pad){
			var dist = (v3dist(v, v3mult(pad.pose.position, VRSCALE))*0.1)/1;
			return Math.max((dist*dist), 0.1);
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