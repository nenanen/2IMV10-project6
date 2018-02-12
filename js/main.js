var threejsWorld = {
    camera:{},
    scene:{},
    renderer:{},
    groundMesh:{},
    controls:{},
    
}

    init();
    animate();


    function init() {
        //basic threejs init
        threejsWorld.scene = new THREE.Scene();
        threejsWorld.scene.fog = new THREE.Fog(0xe4e0ba,200,3000)

        threejsWorld.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );        
        threejsWorld.controls = new THREE.OrbitControls(threejsWorld.camera);
        threejsWorld.camera.position.z = 200;
        threejsWorld.camera.position.y = 100;
        threejsWorld.camera.rotation.z=0;
        threejsWorld.controls.update();
        
        //CALL INIT OBJECT METHODS FROM HERE
        initGround()

        //more general init
        threejsWorld.renderer = new THREE.WebGLRenderer({alpha:true});
        threejsWorld.renderer.setSize( window.innerWidth, window.innerHeight );

        document.getElementById('world').appendChild( threejsWorld.renderer.domElement );
        window.addEventListener('resize', windowResize, false);
    }
    
    function initGround(){
        var geometry = new THREE.PlaneGeometry(2000,2000,5)
        var material = new THREE.MeshBasicMaterial( { color: 0x68c3c0 , side: THREE.DoubleSide} );

        threejsWorld.groundMesh = new THREE.Mesh( geometry, material );
        threejsWorld.groundMesh.rotateX(-0.5 * Math.PI);
        threejsWorld.scene.add( threejsWorld.groundMesh );
    }

    
    //general functions
    function animate() {
        requestAnimationFrame( animate );
        threejsWorld.controls.update();
        threejsWorld.renderer.render( threejsWorld.scene, threejsWorld.camera );
    }
    
    function windowResize() {
	// update camera
        var height = window.innerHeight;
        var width = window.innerWidth;
        threejsWorld.renderer.setSize(width, height);
        threejsWorld.camera.aspect = width / height;
        threejsWorld.camera.updateProjectionMatrix();
    }