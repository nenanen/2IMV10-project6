import * as THREE from 'three'
import OrbitControls from './vendor/OrbitControls'
import './sass/main.scss'
import MapGen from "./road/MapGen"
import Util from "./road/Util";


// Singleton map generator object
let mapGen = new MapGen();
let planes = [];

// The size of the terrain that is generated when the camera moves out
const terrainSize = 5000;

// When we are this many blocks away from the edge of the generated terrain, we generate new terrain
const terrainOffset = 1000;

// Singleton object, to make it easier to identify in other .js files
let threejsWorld = {
    camera: {},
    scene: {},
    renderer: {},
    groundMesh: {},
    controls: {},

};

// Store camera position
let lastCameraPosition = null;

init();
animate();

function init() {
    // Basic threejs init
    threejsWorld.scene = new THREE.Scene();
    threejsWorld.scene.fog = new THREE.Fog(0xe4e0ba, 200, 3000);

    threejsWorld.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    threejsWorld.controls = new OrbitControls(threejsWorld.camera);
    threejsWorld.camera.position.z = 500;
    threejsWorld.camera.position.y = 100;
    threejsWorld.controls.keyPanSpeed = 100;
    threejsWorld.controls.update();
    lastCameraPosition = threejsWorld.camera.position.clone();

    // CALL INIT OBJECT METHODS FROM HERE
    // initGround();
    initRoad();

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
    drawHeatmap(x, z, terrainSize);

}

function drawHeatmap(x, z, maxDistance) {

    // Remove old planes
    for(let plane of planes) {
        threejsWorld.scene.remove(plane);
    }

    // Calculate new planes
    planes = mapGen.heatmap.visualize(x - maxDistance, x + maxDistance, z - maxDistance, z + maxDistance);

    // Insert new planes
    for(let plane of planes) {
        threejsWorld.scene.add(plane);
    }
}

function updateHeatmap() {

    // Get x and z coordinate of the camera
    const x = threejsWorld.camera.position.x;
    const z = threejsWorld.camera.position.z;

    const lastPos = [lastCameraPosition.x, lastCameraPosition.z];

    // Determine if we are far enough from the center to generate a new part
    if (Util.distance([x, z], lastPos) > terrainSize - terrainOffset) {

        // Redraw the heatmap
        drawHeatmap(x, z, terrainSize);

        // Update new center
        lastCameraPosition = threejsWorld.camera.position.clone();

    }
}

//********** general methods ********** //
function animate() {
    // Per frame change
    requestAnimationFrame(animate);
    threejsWorld.controls.update();
    threejsWorld.renderer.render(threejsWorld.scene, threejsWorld.camera);
    updateHeatmap();
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