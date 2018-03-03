import * as THREE from "three";
import * as _ from "lodash";
import {ROADS} from "./Config"
import * as math from "mathjs";

export class RoadSegment {
    /**
     * A road segment.
     * @param {Point} start - The starting point of the segment.
     * @param {Point} end - The end point of the segment.
     * @param {number} time - The time at which the segment is inserted.
     * @param {object} metadata - Additional metadata.
     */
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

    /**
     * Calculates the length of the road segment.
     * @returns {number}
     */
    length() {
        let startVector = this.start.toVector();
        let endVector = this.end.toVector();
        let vector = math.subtract(endVector, startVector);
        vector = _.map(vector, (n) => Math.pow(n, 2));
        return Math.sqrt(vector);
    }

    /**
     * Gets the geometry of the road segment.
     * @returns {{start: Point, end: Point}}
     */
    get geometry() {
        return {
            start: this.start,
            end: this.end
        }
    }

    /**
     * ThreeJS representation of the line.
     * @returns {Line}
     */
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