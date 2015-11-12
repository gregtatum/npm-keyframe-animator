exports.scene = function() {
	
	var square = {
		position : { x:0, y:0, z:0 },
		color : [ 0, 0, 0 ],
		opacity : 0,
		setOpacity : null
	}
	
	square.setOpacity = function( value ) {
		square.opacity = value
	}
	
	return {
		square : square
	}
}