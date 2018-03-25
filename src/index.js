import * as THREE from 'three'
import OrbitControls from './vendor/OrbitControls'
import './sass/main.scss'
import MapGen from "./road/MapGen"
import HeatmapVisualizer from "./road/HeatmapVisualizer";
// import BuidlingController from "./building/building";
import Menu from "./ui/Menu";
import config from "./ui/config";
import $ from 'jquery';
import Placer from "./building/Placer";
import PointerLockControls from './vendor/PointerLockControls';

window.jQuery = $;
window.$ = $;

// Javascript to be used from HTML.
window.ui = {
    menu: Menu,
    config: config,
    update: Menu.updateConfig,
    render: reInit,
};

window.groups = {
    vertices: null,
    roads: null,
    buildings: null
};

// Singleton object, to make it easier to identify in other .js files
let threejsWorld = {
    camera: {},
    scene: {},
    renderer: {},
    groundMesh: {},
    controls: {},
    pointerlock :false,
    raycaster :{},

};

// Singleton map generator object
let mapGen = new MapGen(config);
let heatmap = new HeatmapVisualizer(mapGen.heatmap, threejsWorld, config);
let placer = null;
// let buildingController = new BuildingController(threejsWorld);


//pointerlock variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let pointerlockchange={};

// Start the program
init();
animate();


//********** initialization methods ********** //

function init() {
    
    // Basic threejs init
    threejsWorld.scene = new THREE.Scene();
    // threejsWorld.scene.fog = new THREE.Fog(0xe4e0ba, 200, 3000);
    threejsWorld.scene.fog = new THREE.Fog(0x121B35, 200, 3000);

    threejsWorld.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);    
    threejsWorld.camera.rotation.x= Math.PI/2;
    threejsWorld.camera.position.z = 0;
    threejsWorld.camera.position.y = 100;

    //general controls
    initPointerLock();
    threejsWorld.controls = new OrbitControls(threejsWorld.camera, document.getElementById("world"));
    threejsWorld.camera.position.z = 500;
    threejsWorld.camera.position.y = 100;
    threejsWorld.controls.keyPanSpeed = 100;
    threejsWorld.controls.update();

    // CALL INIT OBJECT METHODS FROM HERE
    // initGround();
    initAllObjects();

    // More ThreeJS initialization
    threejsWorld.renderer = new THREE.WebGLRenderer({alpha: true});
    threejsWorld.renderer.setSize(window.innerWidth, window.innerHeight);
    threejsWorld.renderer.shadowMap.enabled = true;
    threejsWorld.renderer.shadowMap.type = THREE.BasicShadowMap;
    threejsWorld.renderer.shadowMapSoft = true;
    //threejsWorld.controls.addEventListener( 'change', animate );

    document.getElementById('world').appendChild(threejsWorld.renderer.domElement);
    window.addEventListener('resize', windowResize, false);
}


function reInit(updates) {
    // Clear scene
    while(threejsWorld.scene.children.length > 0){
        threejsWorld.scene.remove(threejsWorld.scene.children[0]);
    }

    animate();

    // Setup map generator and heatmap
    mapGen = new MapGen(config);
    heatmap = new HeatmapVisualizer(mapGen.heatmap, threejsWorld, config);

    // Initialize and animate
    initAllObjects();
}

//********** initing objects methods **********//
function initAllObjects() {
    createLights(); //has to be added when a new city is generated  

    initRoad(); 
    initBuildings();
}

function initGround() {
    const geometry = new THREE.PlaneGeometry(2000, 2000, 5);
    const material = new THREE.MeshBasicMaterial({color: 0x68c3c0, side: THREE.DoubleSide});
    threejsWorld.groundMesh = new THREE.Mesh(geometry, material);
    threejsWorld.groundMesh.rotateX(-0.5 * Math.PI);
    threejsWorld.scene.add(threejsWorld.groundMesh);
}

function initRoad() {
    mapGen.initialize();
    let t0 = performance.now();
    mapGen.generate();
    let t1 = performance.now();
    console.log("Road generation " + (t1 - t0) + " milliseconds.");

    // Visualize segments
    let roads = new THREE.Object3D();
    for(let item of mapGen.segmentList) {
        roads.add(item.realistic())
    }

    // Visualize vertices
    let vertices = new THREE.Object3D();
    for(let item of mapGen.vertices) {
        let representation = item.representation();
        vertices.add(representation);
    }

    window.groups.roads = roads;
    window.groups.vertices = vertices;
    threejsWorld.scene.add(roads);
    threejsWorld.scene.add(vertices);

    // Visualize heatmap
    heatmap.drawHeatmap()
}

function initBuildings(){
    let t0 = performance.now();
    placer = new Placer(mapGen.segmentList, threejsWorld, mapGen.heatmap, mapGen.config);
    let buildings = placer.placeAllBuildings();
    window.groups.buildings = buildings;
    threejsWorld.scene.add(buildings);
    let t1 = performance.now();
    console.log("Building generation " + (t1 - t0) + " milliseconds.");
}

//********** general methods ********** //
//renders every instance <-fastest but highest computest power
function animate(){
    
    if(!threejsWorld.pointerlock)
        threejsWorld.controls.update();
    else
    {		
            threejsWorld.raycaster.ray.origin.copy( threejsWorld.controls.getObject().position );
			threejsWorld.raycaster.ray.origin.y -= 10;
		    var time = performance.now();
		    var delta = ( time - prevTime ) / 1000;
		    velocity.x -= velocity.x * 10.0 * delta;
		    velocity.z -= velocity.z * 10.0 * delta;
		    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		    direction.z = Number( moveForward ) - Number( moveBackward );
		    direction.x = Number( moveLeft ) - Number( moveRight );
		    direction.normalize(); // this ensures consistent movements in all directions
		    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
		    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
		    threejsWorld.controls.getObject().translateX( velocity.x * delta );
		    threejsWorld.controls.getObject().translateY( velocity.y * delta );
		    threejsWorld.controls.getObject().translateZ( velocity.z * delta );
		    if ( threejsWorld.controls.getObject().position.y < 10 ) {
		    	velocity.y = 0;
		    	threejsWorld.controls.getObject().position.y = 10;
		    	canJump = true;
		    }
		    prevTime = time;
    }
    threejsWorld.renderer.render(threejsWorld.scene, threejsWorld.camera);
    heatmap.updateHeatmap();
    requestAnimationFrame(animate)//<--comment for single screenshot
}

function changeCameraMode()
{
    if(threejsWorld.pointerlock)
    {        
        threejsWorld.controls.dispose();
        threejsWorld.camera.position.y = 100;
        threejsWorld.controls = new OrbitControls(threejsWorld.camera, document.getElementById("world"));
        threejsWorld.controls.keyPanSpeed = 100;
        threejsWorld.controls.update();
        threejsWorld.pointerlock = false;
		
		
        document.removeEventListener( 'keydown', onKeyDown, false );
		document.removeEventListener( 'keyup', onKeyUp, false );
        console.log("camera to normal")
    }
    else
    {   
        threejsWorld.controls.dispose();
        var onKeyDown = function ( event ) {
			switch ( event.keyCode ) {
				case 38: // up
				case 87: // w
					moveForward = true;
					break;
				case 37: // left
				case 65: // a
					moveLeft = true; break;
				case 40: // down
				case 83: // s
					moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					moveRight = true;
					break;
				case 32: // space
					if ( canJump === true ) velocity.y += 350;
					canJump = false;
					break;
			}
		};
        var onKeyUp = function ( event ) {
			switch( event.keyCode ) {
				case 38: // up
				case 87: // w
					moveForward = false;
					break;
				case 37: // left
				case 65: // a
					moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					moveRight = false;
					break;
			}
		};

        threejsWorld.controls = new PointerLockControls(threejsWorld.camera);
        threejsWorld.camera.position.y = 5;        
        threejsWorld.camera.position.z = 0;     
        threejsWorld.camera.position.x = 0;
        threejsWorld.scene.add( threejsWorld.controls.getObject() );
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );
        threejsWorld.pointerlock = true;
        console.log("camera to pointerlock")
    }
}

function windowResize() {
    // Update camera
    const height = window.innerHeight;
    const width = window.innerWidth;
    threejsWorld.renderer.setSize(width, height);
    threejsWorld.camera.aspect = width / height;
    threejsWorld.camera.updateProjectionMatrix();
}

function createLights() {//light for buildings
    	// let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
	// let shadowLight = new THREE.DirectionalLight(0xdfebff, 1);
	let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
	let shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
    const d = 400;
	shadowLight.shadow.camera.left = -d;
	shadowLight.shadow.camera.right = d;
	shadowLight.shadow.camera.top = d;
	shadowLight.shadow.camera.bottom = -d;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	threejsWorld.scene.add(hemisphereLight);
	threejsWorld.scene.add(new THREE.DirectionalLightHelper( shadowLight, 5 ));
	threejsWorld.scene.add(shadowLight);
}

function initPointerLock()
{
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    threejsWorld.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
	if ( havePointerLock ) {
		var element = document.body;
		pointerlockchange = function ( event ) {    
		    document.removeEventListener( 'pointerlockchange', pointerlockchange, false );
		    document.removeEventListener( 'mozpointerlockchange', pointerlockchange, false );
		    document.removeEventListener( 'webkitpointerlockchange', pointerlockchange, false );

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
				changeCameraMode();
				threejsWorld.controls.enabled = true;
				blocker.style.display = 'none';
                
			} else {
				changeCameraMode();
				threejsWorld.controls.enabled = true;
				blocker.style.display = 'block';
				instructions.style.display = '';
			}
            
		    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		};
		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
		};

        
		instructions.addEventListener( 'click', function ( event ) {
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		}, false );

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
}
