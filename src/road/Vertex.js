import Point from "./Point";
import * as THREE from "three";

export default class Vertex extends Point {
    constructor(x, y, z) {
        super(x, y, z);
    }

    representation() {
        let geometry = new THREE.SphereGeometry( 10, 32, 32 );
        let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        let sphere = new THREE.Mesh( geometry, material );

        sphere.position.x = this.x;
        sphere.position.y = this.y;
        sphere.position.z = this.z;

        return sphere
    }
}