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

    realistic() {
        let road = this.metadata.type;
        let length = this.geometry.length();
        let center = this.geometry.center();
        let direction = this.geometry.direction();
        let texture = road.TEXTURE;
        // texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set( 4, 4 );
        let geometry = new THREE.PlaneGeometry(road.SEGMENT_WIDTH, length, 1);
        // let material = new THREE.MeshBasicMaterial( {color: road.COLOR, side: THREE.DoubleSide} );
        let material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
        let plane = new THREE.Mesh( geometry, material );
        plane.position.x = center[0];
        plane.position.y = 1;
        plane.position.z = center[1];
        plane.rotateX(-0.5 * Math.PI);
        plane.rotateZ(direction / 180 * Math.PI);
        return plane
    }

    limits() {
        let limits = this.geometry.limits();
        limits.o = this;
        return limits;
    }
}