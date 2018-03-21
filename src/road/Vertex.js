import Point from "./Point";
import * as THREE from "three";

export default class Vertex extends Point {
    constructor(x, y, z, color=0xffff00, direction=0) {
        super(x, y, z);
        this.color = color;
        this.direction = direction;
    }

    representation() {
        // let geometry = new THREE.SphereGeometry( 10, 32, 32 );
        let geometry = new THREE.BoxGeometry(10, 10, 10);
        let material = new THREE.MeshPhongMaterial( {color: this.color} );
        let sphere = new THREE.Mesh( geometry, material );

        sphere.position.x = this.x;
        sphere.position.y = this.y + 20;
        sphere.position.z = this.z;
        sphere.rotateY(this.direction / 180 * Math.PI);
        sphere.castShadow = true;

        return sphere
    }
}