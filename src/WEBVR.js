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

var WEBVR = {
	displays: null,
	display: null,
	eyedims: [1,1],
	layer: null,

	init: function () {
		navigator.getVRDisplays().then(this.vrinit.bind(this));
	},

	vrinit: function(displays){
		console.log(this);
		this.displays = displays;
		this.display = displays[0];
		var eyeparams = this.display.getEyeParameters('left')
		this.eyedims = [eyeparams.renderWidth, eyeparams.renderHeight]
		console.log(this.eyedims);
		window.Scene.onCanvasResize();
		this.layer = {leftBounds:[0.0, 0.0, 0.5, 1.0],rightBounds:[0.5, 0.0, 1.0, 1.0]};
		this.layer.source = document.getElementById("canvas");
		document.body.appendChild(this.getButton());
		this.display.requestAnimationFrame(this.update.bind(this));
	},

	update: function(delta){
		this.display.requestAnimationFrame(this.update.bind(this));
		if (this.display.isPresenting) {
			var frameData = new VRFrameData();
        	this.display.getFrameData(frameData);
			//console.log(frameData.pose.position);
			window.pose = frameData.pose;
			if (pose.position) {
				Scene._camera._trans = v3plus(v3mult(frameData.pose.position, 200), [0,-20,50]);
			}
			Scene._camera.updateView();
			Scene.render();
			this.display.submitFrame(this.display.getPose());
		}
		
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