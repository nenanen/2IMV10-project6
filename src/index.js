import * as THREE from 'three'
import OrbitControls from './vendor/OrbitControls'
import './sass/main.scss'
import MapGen from "./road/MapGen"
import HeatmapVisualizer from "./road/HeatmapVisualizer";
import Menu from "./ui/menu";
import config from "./ui/config";
import $ from 'jquery';

window.jQuery = $;
window.$ = $;

// Javascript to be used from HTML.
window.ui = {
    menu: Menu,
    config: config,
    update: updateConfig,
    render: reInit,
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

// Start the program
init();
animate();


//********** initialization methods ********** //

function updateConfig() {
    const serialized = $("form").serialize().replace("&", ";");
    eval(serialized)
}

function initObjects() {
    initRoad();
}

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

    // CALL INIT OBJECT METHODS FROM HERE
    initObjects();

    // More ThreeJS initialization
    threejsWorld.renderer = new THREE.WebGLRenderer({alpha: true});
    threejsWorld.renderer.setSize(window.innerWidth, window.innerHeight);

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
    initObjects();
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