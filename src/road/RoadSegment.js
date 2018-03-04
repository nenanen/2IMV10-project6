import * as THREE from "three";
import * as _ from "lodash";
import {ROADS} from "./Config"

export default class RoadSegment {
    /**
     * A road segment.
     * @param {Segment} geometry - A segment that determines the geometry.
     * @param {number} time - The time at which the segment is inserted.
     * @param {object} metadata - Additional metadata.
     */
    constructor(geometry, time, metadata) {

        // Geometry of the road segment
        this.geometry = geometry;

        // Time delay until insertion
        this.time = time;

        // Store metadata and fill in defaults if not set
        this.metadata = _.defaults(metadata, {
            type: ROADS.URBAN,
            severed: false
        })

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
        let gem = this.geometry;

        geometry.vertices.push(
            new THREE.Vector3(gem.start.x, gem.start.y, gem.start.z),
            new THREE.Vector3(gem.end.x, gem.end.y, gem.end.z)
        );

        return new THREE.Line(geometry, material)
    }
}