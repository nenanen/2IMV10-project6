import * as THREE from "three";
import * as _ from "lodash";
import * as config from "./Config"

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
            type: config.ROADS.URBAN,
            severed: false
        })

    }

    /**
     * ThreeJS representation of the line.
     * @returns {Line}
     */
    representation() {
        let linewidth = config.DEFAULT_SEGMENT_WIDTH;
        let color = 0x0000ff;

        if (this.metadata.type === config.ROADS.HIGHWAY) {
            linewidth = config.HIGHWAY_SEGMENT_WIDTH;
            color = 0xff0000;
        }

        let material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: linewidth,
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