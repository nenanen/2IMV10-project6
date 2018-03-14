import * as THREE from "three";
import * as _ from "lodash";

export default class RoadSegment {
    /**
     * A road segment.
     * @param {Segment} geometry - A segment that determines the geometry.
     * @param {number} time - The time at which the segment is inserted.
     * @param {object} metadata - Additional metadata.
     * @param {Array} config - Configuration array
     */
    constructor(geometry, time, metadata, config) {

        this.config = config;

        // Geometry of the road segment
        this.geometry = geometry;

        // Time delay until insertion
        this.time = time;

        // Store metadata and fill in defaults if not set
        this.metadata = _.defaults(metadata, {
            type: this.config.ROADS.URBAN,
            severed: false,
        });

        // Get more information from the road type (so we can adjust it if needed)
        this.metadata.color = this.metadata.type.COLOR;

    }

    get priority() {
        return this.time;
    }

    /**
     * ThreeJS representation of the line.
     * @returns {Line}
     */
    representation() {
        let road = this.metadata.type;

        let material = new THREE.LineBasicMaterial({
            color: this.metadata.color,
            linewidth: road.SEGMENT_WIDTH,
        });

        let geometry = new THREE.Geometry();
        let gem = this.geometry;

        geometry.vertices.push(
            new THREE.Vector3(gem.start.x, gem.start.y, gem.start.z),
            new THREE.Vector3(gem.end.x, gem.end.y, gem.end.z)
        );

        return new THREE.Line(geometry, material)
    }

    limits() {
        let limits = this.geometry.limits();
        limits.o = this;
        return limits;
    }
}