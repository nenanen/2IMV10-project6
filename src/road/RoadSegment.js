import * as THREE from "three";
import * as _ from "lodash";
import {ROADS} from "./Config"
import * as math from "mathjs";

export class RoadSegment {
    constructor(start, end, time, metadata) {

        // Start and end points
        this.start = start;
        this.end = end;

        // Time delay until insertion
        this.time = time;

        // Store metadata and fill in defaults if not set
        this.metadata = _.defaults(metadata, {
            type: ROADS.URBAN,
            severed: false
        })

    }

    length() {
        let startVector = this.start.vector();
        let endVector = this.end.vector();
        let vector = math.subtract(endVector, startVector);
        vector = _.map(vector, (n) => Math.pow(n, 2));
        return Math.sqrt(vector);
    }

    representation() {
        let material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        let geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3(this.start.x, this.start.y, this.start.z),
            new THREE.Vector3(this.end.x, this.end.y, this.start.z)
        );

        return new THREE.Line(geometry, material)
    }
}