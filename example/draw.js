var Loop = require('poem-loop')()
var GlMatrix = require('gl-matrix')
var Mat4 = GlMatrix.mat4
var Vec3 = GlMatrix.vec3
var Color = require('@tatumcreative/color')
var Lerp = require('lerp')
var _ = require('lodash')
var Animator = require('../animator')
var TAU = Math.PI * 2
	
function _width() {
	return window.innerWidth * window.devicePixelRatio
}

function _height() {
	return window.innerHeight * window.devicePixelRatio
}

function _getContext() {
	var canvas = document.getElementsByTagName("canvas")[0]
	canvas.width = _width()
	canvas.height = _height()
	return canvas.getContext('2d')
}

function _generateCirclePoints( count ) {
	
	return _.times( count, function(i) {
		var theta = TAU * i / count
		return [ Math.cos(theta), Math.sin(theta), 0 ]
	})
}

function _drawCircleFn( ctx, size ) {
	
	var circleSource = _generateCirclePoints( size )
	var circleTarget = _generateCirclePoints( size )
	var transform = Array(16)
	
	return function drawCircle( position, scale, rotation ) {
		
		Mat4.identity  (transform)
		Mat4.translate (transform, transform, position)
		Mat4.scale     (transform, transform, scale)
		Mat4.rotateZ   (transform, transform, rotation[2])
		Mat4.rotateY   (transform, transform, rotation[1])
		Mat4.rotateX   (transform, transform, rotation[0])
		
		_transformPoints( circleSource, circleTarget, transform )
		_drawSegments( ctx, circleTarget )
	}
}

function _transformPoints( circleSource, circleTarget, transform) {
	
	// Copy and transform the original circle points
	for( var i=0; i < circleSource.length; i++ ) {
		var pointSource = circleSource[i]
		var pointTarget = circleTarget[i]
		
		Vec3.copy( pointTarget, pointSource )
		Vec3.transformMat4( pointTarget, pointTarget, transform )
	}
}

function _drawSegments( ctx, segments ) {
	
	var size = segments.length
	
	ctx.beginPath()
	// Draw the segment
	for( var i=1; i <= size; i++ ) {
		var a = segments[i%size]
		var b = segments[i-1]
		
		ctx.moveTo( a[0], a[1] )
		ctx.lineTo( b[0], b[1] )
	}
	ctx.closePath()
	ctx.stroke()
}

function _followVec3s( vecs, t ) {

	for( var i=1; i < vecs.length; i++ ) {
		var a = vecs[i-1]
		var b = vecs[i]
		Vec3.lerp( b, b, a, t )
	}
}

function _updateFn( ctx, shapes ) {

	var width = _width()
	var height = _height()
	var centerX = width / 2
	var centerY = height / 2
	
	var drawCircle = _drawCircleFn( ctx, 5 )
	var scaleTarget = [0,0,0]
	
	return function update( e ) {
		ctx.fillStyle = '#333'
		ctx.fillRect( 0, 0, width, height )
		ctx.fillStyle = 'none'
		ctx.lineWidth = 3 * window.devicePixelRatio
		ctx.lineJoin = 'round';
		
		_.each(shapes, function( shape ) {
			
			_followVec3s( shape.positions, 0.3 )
			_followVec3s( shape.rotations, 0.1 )
			
			Vec3.copy(scaleTarget, shape.scale)
			
			_.each( shape.positions, function( position, i ) {
				
				var unitInterval = i / shape.positions.length
				var rotation = shape.rotations[i]
				
				//Rainbow-ify the color
				ctx.strokeStyle = Color.hslToStyle(
					shape.color[0] - 0.2 * unitInterval,
					shape.color[1],
					shape.color[2],
					(1 - unitInterval) * 0.5 + 0.5
				)
				drawCircle( position, scaleTarget, rotation )
				
				scaleTarget[0] *= 1.1
				scaleTarget[1] *= 1.1
				scaleTarget[2] *= 1.1
			})
			
			
		})
	}
}

function _createShape( count) {
	
	var positions = _.times( count, function() { return [0,0,0]})
	var rotations = _.times( count, function() { return [0,0,0]})
	
	return {
		position : positions[0],
		positions : positions,
		rotation : rotations[0],
		rotations : rotations,
		radius : 1,
		scale : [50, 50, 50],
		color : [0.5, 0.5, 0.5]
	}
}

function _createKeyframes() {
	
	var w = _width()
	var h = _height()
	
	return [
		{
			duration : 2,
			easing : "elasticOut",
			actions : [
				[ "[0].position[0]", [ w*0.5, w*0.50 ] ],
				[ "[0].position[1]", [ h*0.6, h*0.50 ] ],
				
				[ "[1].position[0]", [ w*0.5, w*0.25 ] ],
				[ "[1].position[1]", [ h*0.6, h*0.25 ] ],
				
				[ "[2].position[0]", [ w*0.5, w*0.75 ] ],
				[ "[2].position[1]", [ h*0.6, h*0.25 ] ],
				
				[ "[3].position[0]", [ w*0.5, w*0.75 ] ],
				[ "[3].position[1]", [ h*0.6, h*0.75 ] ],
				
				[ "[4].position[0]", [ w*0.5, w*0.25 ] ],
				[ "[4].position[1]", [ h*0.6, h*0.75 ] ],
			],
		},

		{
			duration : 0.5,
			actions : [

				[ "[0].color[0]", [ 0.5, 0.0 ] ],
				[ "[1].color[0]", [ 0.5, 0.2 ] ],
				[ "[2].color[0]", [ 0.5, 0.4 ] ],
				[ "[3].color[0]", [ 0.5, 0.6 ] ],
				[ "[4].color[0]", [ 0.5, 0.8 ] ],

				[ "[0].rotation[0]", [ 0, Math.PI * 1 ] ],
				[ "[1].rotation[0]", [ 0, Math.PI * 1 ] ],
				[ "[2].rotation[0]", [ 0, Math.PI * 1 ] ],
				[ "[3].rotation[0]", [ 0, Math.PI * 1 ] ],
				[ "[4].rotation[0]", [ 0, Math.PI * 1 ] ],
				
				[ "[0].rotation[2]", [ 0, Math.PI * 1 ] ],
				[ "[1].rotation[2]", [ 0, Math.PI * 2 ] ],
				[ "[2].rotation[2]", [ 0, Math.PI * 3 ] ],
				[ "[3].rotation[2]", [ 0, Math.PI * 4 ] ],
				[ "[4].rotation[2]", [ 0, Math.PI * 5 ] ],
				
			],
		},
		{
			duration : 2,
			easing : "cubicInOut",
			actions : [
				[ "[0].position[0]", [ w*0.50, w*0.5 ] ],
				[ "[0].position[1]", [ h*0.50, h*0.2 ] ],
				
				[ "[1].position[0]", [ w*0.25, w*0.7 ] ],
				[ "[1].position[1]", [ h*0.25, h*0.4 ] ],
				
				[ "[2].position[0]", [ w*0.75, w*0.6 ] ],
				[ "[2].position[1]", [ h*0.25, h*0.7 ] ],
				
				[ "[3].position[0]", [ w*0.75, w*0.4 ] ],
				[ "[3].position[1]", [ h*0.75, h*0.7 ] ],
				
				[ "[4].position[0]", [ w*0.25, w*0.3 ] ],
				[ "[4].position[1]", [ h*0.75, h*0.4 ] ],
				
				[ "[0].scale[0]", [ 50, 100 ] ],
				[ "[0].scale[1]", [ 50, 100 ] ],
				[ "[0].scale[2]", [ 50, 100 ] ],
				
				[ "[1].scale[0]", [ 50, 100 ] ],
				[ "[1].scale[1]", [ 50, 100 ] ],
				[ "[1].scale[2]", [ 50, 100 ] ],
				
				[ "[2].scale[0]", [ 50, 100 ] ],
				[ "[2].scale[1]", [ 50, 100 ] ],
				[ "[2].scale[2]", [ 50, 100 ] ],
				
				[ "[3].scale[0]", [ 50, 100 ] ],
				[ "[3].scale[1]", [ 50, 100 ] ],
				[ "[3].scale[2]", [ 50, 100 ] ],
				
				[ "[4].scale[0]", [ 50, 100 ] ],
				[ "[4].scale[1]", [ 50, 100 ] ],
				[ "[4].scale[2]", [ 50, 100 ] ],
				
				
			],
		},
		
		{
			duration : 1,
			easing : "elasticOut",
			actions : [
				[ "[0].scale[0]", [ 100, 50 ] ],
				[ "[0].scale[1]", [ 100, 50 ] ],
				[ "[0].scale[2]", [ 100, 50 ] ],
				
				[ "[1].scale[0]", [ 100, 50 ] ],
				[ "[1].scale[1]", [ 100, 50 ] ],
				[ "[1].scale[2]", [ 100, 50 ] ],
				
				[ "[2].scale[0]", [ 100, 50 ] ],
				[ "[2].scale[1]", [ 100, 50 ] ],
				[ "[2].scale[2]", [ 100, 50 ] ],
				
				[ "[3].scale[0]", [ 100, 50 ] ],
				[ "[3].scale[1]", [ 100, 50 ] ],
				[ "[3].scale[2]", [ 100, 50 ] ],
				
				[ "[4].scale[0]", [ 100, 50 ] ],
				[ "[4].scale[1]", [ 100, 50 ] ],
				[ "[4].scale[2]", [ 100, 50 ] ],
			]
		},

		{
			duration : 2,
			easing : "quadInOut",
			actions : [
				
				[ "[0].color[0]", [ 0.0, 0.5 ] ],
				[ "[1].color[0]", [ 0.2, 0.5 ] ],
				[ "[2].color[0]", [ 0.4, 0.5 ] ],
				[ "[3].color[0]", [ 0.6, 0.5 ] ],
				[ "[4].color[0]", [ 0.8, 0.5 ] ],
				
				[ "[0].rotation[2]", [ Math.PI * 1, 0 ] ],
				[ "[1].rotation[2]", [ Math.PI * 2, 0 ] ],
				[ "[2].rotation[2]", [ Math.PI * 3, 0 ] ],
				[ "[3].rotation[2]", [ Math.PI * 4, 0 ] ],
				[ "[4].rotation[2]", [ Math.PI * 5, 0 ] ],
				
				
			],
		},
		{
			duration : 2,
			easing : "cubicInOut",
			actions : [
				[ "[0].rotation[0]", [ Math.PI * 1, 0 ] ],
				[ "[1].rotation[0]", [ Math.PI * 1, 0 ] ],
				[ "[2].rotation[0]", [ Math.PI * 1, 0 ] ],
				[ "[3].rotation[0]", [ Math.PI * 1, 0 ] ],
				[ "[4].rotation[0]", [ Math.PI * 1, 0 ] ],
			]
		}
		
	]
}

function _updateAnimatorFn( keyframes, shapes ) {
	
	var animate = Animator( shapes, keyframes )
	
	return function updateAnimator(e) {
		animate( e.elapsed )
	}
}

function start() {
	
	var shapes = _.times( 5, _createShape.bind( null, 10 ) )
	var keyframes = _createKeyframes()
	var ctx = _getContext()
	
	Loop.emitter.on( 'update', _updateAnimatorFn( keyframes, shapes ) )
	Loop.emitter.on( 'update', _updateFn( ctx, shapes ) )
	
	Loop.start()
}

document.addEventListener("DOMContentLoaded", start)