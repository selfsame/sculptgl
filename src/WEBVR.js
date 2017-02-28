/**
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 */

var v3mult = function(A, n){
	return [A[0]*n,A[1]*n,A[2]*n];
}

var v3plus = function(A, B){
	return [A[0]+B[0],A[1]+B[1],A[2]+B[2]];
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
		window.FOV = 105.6;
		window.useProj = true;
		this.display.requestAnimationFrame(this.update.bind(this));
		window.pose = {position: [0, 0, 0.5], orientation:[ 0, 0, 0, 1 ]}


	},
	updateEye: function(n){
		if (window['pose'] && window['pose']['position']) {
			if (window['frameData']){
				if (n == -1) {
					mat4.translate(Scene._camera._view, 
						frameData.leftViewMatrix, 
						v3plus(v3mult(pose.position, -200),
							  vec3.transformQuat([0,0,0],[(-n*OFF),0,0], pose.orientation))
						);
					Scene._camera._proj = frameData.leftProjectionMatrix
				}
				if (n == 1) {
					mat4.translate(Scene._camera._view, 
						frameData.rightViewMatrix, 
						v3plus(v3mult(pose.position, -200),
							  vec3.transformQuat([0,0,0],[(-n*OFF),0,0], pose.orientation))
						);
					Scene._camera._proj = frameData.rightProjectionMatrix
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
			Scene.render();
			this.display.submitFrame(pose);
		}
	},
	makeProjectionMatrix: function (display, eye) {
	  var d2r = Math.PI / 180.0;
	  var upTan = Math.tan(eye.fieldOfView.upDegrees * d2r);
	  var downTan = Math.tan(eye.fieldOfView.leftDegrees * d2r);
	  var rightTan = Math.tan(eye.fieldOfView.rightDegrees * d2r);
	  var leftTan = Math.tan(eye.fieldOfView.leftDegrees * d2r);
	  var xScale = 2.0 / (leftTan + rightTan);
	  var yScale = 2.0 / (upTan + downTan);

	  var out = new Float32Array(16);
	  out[0] = xScale;
	  out[1] = 0.0;
	  out[2] = 0.0;
	  out[3] = 0.0;
	  
	  out[4] = 0.0;
	  out[5] = yScale;
	  out[6] = 0.0;
	  out[7] = 0.0;
	  
	  out[8] = -((leftTan - rightTan) * xScale * 0.5);
	  out[9] = (upTan - downTan) * yScale * 0.5;
	  out[10] = -(display.depthNear + display.depthFar) / (display.depthFar - display.depthNear);

	  out[12] = 0.0;
	  out[13] = 0.0;
	  out[14] = -(2.0 * display.depthFar * display.depthNear) / (display.depthFar - display.depthNear);
	  out[15] = 0.0;

	  return out;
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