var Mocks = require('./mocks')
var Test = require('tape')
var Animator = require('../animator')

Test("Animator", function(t) {
	
	t.test( "updates property values", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.position.x", [2, 3] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:2, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
		update(1000)
		t.isEquivalent( scene.square.position, {x:2, y:0, z:0} )
		
		update(1500)
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
	})

	t.test( "updates function values", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.setOpacity", [0.5, 1] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEqual( scene.square.opacity, 0.5 )
		
		update(500)
		t.isEqual( scene.square.opacity, 0.75 )
		
		update(1000)
		t.isEqual( scene.square.opacity, 0.5 )
		
		update(1500)
		t.isEqual( scene.square.opacity, 0.75 )
		
	})
	
	t.test( "can runOnce", function(t) {
		
		t.plan(8)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.setOpacity", [0.5, 1] ],
					[ "square.position.x", [2, 3] ],
				],
			}
		]
		var runOnce = true
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes, runOnce )

		update(0)
		t.isEqual( scene.square.opacity, 0.5 )
		t.isEquivalent( scene.square.position, {x:2, y:0, z:0} )
		
		update(500)
		t.isEqual( scene.square.opacity, 0.75 )
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
		update(1000)
		t.isEqual( scene.square.opacity, 0.75 )
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
		update(1500)
		t.isEqual( scene.square.opacity, 0.75 )
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
	})
	
	t.test( "plays multiple sequences", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.position.x", [2, 3] ],
				],
			},
			{
				duration: 1,
				actions: [
					[ "square.position.x", [0, 1] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:2, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:2.5, y:0, z:0} )
		
		update(1000)
		t.isEquivalent( scene.square.position, {x:0, y:0, z:0} )
		
		update(1500)
		t.isEquivalent( scene.square.position, {x:0.5, y:0, z:0} )
		
	})
	
	t.test( "can isolate sequences", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.position.x", [2, 3] ],
				],
			},
			{
				duration: 1,
				isolate: true,
				actions: [
					[ "square.position.x", [0, 1] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:0, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:0.5, y:0, z:0} )
		
		update(1000)
		t.isEquivalent( scene.square.position, {x:0.0, y:0, z:0} )
		
		update(1500)
		t.isEquivalent( scene.square.position, {x:0.5, y:0, z:0} )
		
	})
	
	t.test( "can start here on sequences", function(t) {
		
		t.plan(6)
		
		var keyframes = [
			{
				duration: 1,
				actions: [
					[ "square.position.x", [2, 3] ],
				],
			},
			{
				duration: 1,
				startHere: true,
				actions: [
					[ "square.position.x", [0, 1] ],
				],
			},
			{
				duration: 1,
				actions: [
					[ "square.position.x", [5, 6] ],
				],
			},
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:0, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:0.5, y:0, z:0} )
		
		update(1000)
		t.isEquivalent( scene.square.position, {x:5.0, y:0, z:0} )
		
		update(1500)
		t.isEquivalent( scene.square.position, {x:5.5, y:0, z:0} )
		
		update(2000)
		t.isEquivalent( scene.square.position, {x:0.0, y:0, z:0} )
		
		update(2500)
		t.isEquivalent( scene.square.position, {x:0.5, y:0, z:0} )
		
	})
	
	t.test( "provides easing by name", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				easing: "sineIn",
				actions: [
					[ "square.position.x", [0, 10] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:0, y:0, z:0} )
		
		update(250)
		t.isEquivalent( scene.square.position, {x:0.7612046748871326, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:2.9289321881345245, y:0, z:0} )
		
		update(750)
		t.isEquivalent( scene.square.position, {x:6.173165676349102, y:0, z:0} )
		
	})
	
	t.test( "provides easing by passed function", function(t) {
		
		t.plan(4)
		
		var keyframes = [
			{
				duration: 1,
				easing: function sineIn(t) {
				  return 1 - Math.cos( t * Math.PI / 2 )
				},
				actions: [
					[ "square.position.x", [0, 10] ],
				],
			}
		]
		var scene = Mocks.scene()
		var update = Animator( scene, keyframes )

		update(0)
		t.isEquivalent( scene.square.position, {x:0, y:0, z:0} )
		
		update(250)
		t.isEquivalent( scene.square.position, {x:0.7612046748871326, y:0, z:0} )
		
		update(500)
		t.isEquivalent( scene.square.position, {x:2.9289321881345245, y:0, z:0} )
		
		update(750)
		t.isEquivalent( scene.square.position, {x:6.173165676349102, y:0, z:0} )
		
	})
	
})