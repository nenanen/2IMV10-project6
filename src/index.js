import * as THREE from 'three'
import OrbitControls from './vendor/OrbitControls'
import './sass/main.scss'

// Singleton object, to make it easier to identify in other .js files
let threejsWorld = {
    camera: {},
    scene: {},
    renderer: {},
    groundMesh: {},
    controls: {},

};
init();
animate();

function init() {
    // Basic threejs init
    threejsWorld.scene = new THREE.Scene();
    threejsWorld.scene.fog = new THREE.Fog(0xe4e0ba, 200, 3000);

    threejsWorld.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    threejsWorld.controls = new OrbitControls(threejsWorld.camera);
    threejsWorld.camera.position.z = 1000;
    threejsWorld.camera.position.y = 100;
    threejsWorld.controls.update();

    // CALL INIT OBJECT METHODS FROM HERE
    initGround();

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

//********** general methods ********** //
function animate() {
    // Per frame change
    requestAnimationFrame(animate);
    threejsWorld.controls.update();
    threejsWorld.renderer.render(threejsWorld.scene, threejsWorld.camera);
}

function windowResize() {
    // Update camera
    const height = window.innerHeight;
    const width = window.innerWidth;
    threejsWorld.renderer.setSize(width, height);
    threejsWorld.camera.aspect = width / height;
    threejsWorld.camera.updateProjectionMatrix();
}