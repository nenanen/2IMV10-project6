import * as THREE from 'three'
import OrbitControls from './vendor/OrbitControls'
import './sass/main.scss'
import MapGen from "./road/MapGen"
import HeatmapVisualizer from "./road/HeatmapVisualizer";
import Menu from "./ui/menu";
import BuidlingController from "./building/building";

// Javascript to be used from HTML.
window.ui = {
    menu: Menu
};

// Singleton object, to make it easier to identify in other .js files
let threejsWorld = {
    camera: {},
    scene: {},
    renderer: {},
    groundMesh: {},
    controls: {},

};

// Singleton map generator object
let mapGen = new MapGen();
let heatmap = new HeatmapVisualizer(mapGen.heatmap, threejsWorld);
let buildingController = new BuidlingController(threejsWorld);

init();
animate();

function init() {
    // Basic threejs init
    threejsWorld.scene = new THREE.Scene();
    threejsWorld.scene.fog = new THREE.Fog(0xe4e0ba, 200, 3000);

    threejsWorld.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    threejsWorld.controls = new OrbitControls(threejsWorld.camera, document.getElementById("world"));
    threejsWorld.camera.position.z = 500;
    threejsWorld.camera.position.y = 100;
    threejsWorld.controls.keyPanSpeed = 100;
    threejsWorld.controls.update();
    createLights();

    // CALL INIT OBJECT METHODS FROM HERE
    // initGround();
    initRoad();
    initBuildings();

    // More ThreeJS initialization
    threejsWorld.renderer = new THREE.WebGLRenderer({alpha: true});
    threejsWorld.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('world').appendChild(threejsWorld.renderer.domElement);
    window.addEventListener('resize', windowResize, false);
}

//********** initing objects methods **********//
function initGround() {
    const geometry = new THREE.PlaneGeometry(2000, 2000, 5);
    const material = new THREE.MeshBasicMaterial({color: 0x68c3c0, side: THREE.DoubleSide});
    threejsWorld.groundMesh = new THREE.Mesh(geometry, material);
    threejsWorld.groundMesh.rotateX(-0.5 * Math.PI);
    threejsWorld.scene.add(threejsWorld.groundMesh);
}

function initRoad() {
    mapGen.initialize();
    mapGen.generate();

    // Visualize segments
    for(let item of mapGen.segmentList) {
        threejsWorld.scene.add(item.representation())
    }

    // Visualize vertices
    for(let item of mapGen.vertices) {
        let representation = item.representation();
        threejsWorld.scene.add(representation);
    }

    // Visualize heatmap
    const x = threejsWorld.camera.position.x;
    const z = threejsWorld.camera.position.z;
    heatmap.drawHeatmap()

}

function initBuildings(){
    buildingController.buildingBlob();
}

//********** general methods ********** //
function animate() {
    // Per frame change
    requestAnimationFrame(animate);
    threejsWorld.controls.update();
    threejsWorld.renderer.render(threejsWorld.scene, threejsWorld.camera);
    heatmap.updateHeatmap();
    // console.log(threejsWorld.camera.position);
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
	var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	var shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	threejsWorld.scene.add(hemisphereLight);  
	threejsWorld.scene.add(shadowLight);
}