import Point from "./Point";
import * as THREE from "three";

export default class Vertex extends Point {
    constructor(x, y, z, color=0xffff00) {
        super(x, y, z);
        this.color = color;
    }

    representation() {
        let geometry = new THREE.SphereGeometry( 10, 32, 32 );
        let material = new THREE.MeshBasicMaterial( {color: this.color} );
        let sphere = new THREE.Mesh( geometry, material );

        sphere.position.x = this.x;
        sphere.position.y = this.y;
        sphere.position.z = this.z;

        return sphere
    }
}