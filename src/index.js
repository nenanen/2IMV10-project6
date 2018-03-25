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
import "./ui/Slider";
import * as ReactDOM from "react-dom";

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

};

// Singleton map generator object
let mapGen = new MapGen(config);
let heatmap = new HeatmapVisualizer(mapGen.heatmap, threejsWorld, config);
let placer = null;
// let buildingController = new BuildingController(threejsWorld);

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
    console.log("Rerendering using", window.ui.config);

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
    placer = new Placer(mapGen.segmentList, threejsWorld, mapGen.heatmap, config);
    let buildings = placer.placeAllBuildings();
    window.groups.buildings = buildings;
    threejsWorld.scene.add(buildings);
    let t1 = performance.now();
    console.log("Building generation " + (t1 - t0) + " milliseconds.");
}

//********** general methods ********** //
//renders every instance <-fastest but highest computest power
function animate(){
    threejsWorld.controls.update();
    threejsWorld.renderer.render(threejsWorld.scene, threejsWorld.camera);
    heatmap.updateHeatmap();
    requestAnimationFrame(animate)//<--comment for slower but low cpu
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