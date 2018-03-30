import Algebra from "../road/Algebra";
import * as math from "mathjs";
import * as THREE from "three";

const MAX_SIZE = 20;

export default class Lot {
    
    constructor(center, length, width, rotation) {
        this.center = center;
        this.length = length;
        this.width = width;
        this.rotation = rotation;

        // Calculate coordinates
        this.location = this.calculateLocation();

        // Calculate properties
        const xs = this.location.coordinates.map(coord => coord[0]);
        const ys = this.location.coordinates.map(coord => coord[1]);
        this.minX = Math.min.apply(null, xs);
        this.minY = Math.min.apply(null, ys);
    }

    calculateLocation() {
        const c = this.center;
        const w = this.width / 2;
        const l = this.length / 2;
        const x = c[0];
        const y = c[1];
        const direction = this.rotation;

        return {
            center: c,
            original: [
                [x - w, y - l], // bottom left
                [x + w, y - l], // bottom right,
                [x + w, y + l], // top right,
                [x - w, y + l], // top left
            ],
            coordinates: [
                [x - w, y - l], // bottom left
                [x + w, y - l], // bottom right,
                [x + w, y + l], // top right,
                [x - w, y + l], // top left
            ].map(coord => Algebra.rotate(c, coord, direction))
        }
    }

    limits() {
        return {
            x: this.minX,
            y: this.minY,
            height: this.length,
            width: this.width,
            o: this
        }
    }

    collidesAny(qTree) {
        let matches = qTree.retrieve(this.limits());

        for (let match of matches) {
            const collision = this.collidesWith(match.o);

            if (collision) {
                return match.o;
            }
        }

        return false;
    }

    // Check if the lot collides with an object with a given center and coordinates.
    collidesWith(o) {

        // Check quickly if it definitely does not intersect
        // if (Algebra.distance(this.center, o.geometry.start.toVector2D()) > MAX_SIZE / 2 + o.metadata.type.SEGMENT_WIDTH / 2 + o.metadata.type.LENGTH) {
        //     return false;
        // }

        // TODO: this only checks if the planes are close. Use Axis Theorem.
        let p = Algebra.projectOnSegment(this.center, o.geometry.start.toVector2D(), o.geometry.end.toVector2D());
        return Algebra.distance(this.center, p) < MAX_SIZE / 2 + o.metadata.type.SEGMENT_WIDTH / 2;
    }

    // Make a plane
    makePlane(color = 0x00ff00) {
        let geometry = new THREE.PlaneGeometry(this.width, this.length, 32);
        let material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.set(this.center[0], 1, this.center[1]);
        plane.rotateY(this.rotation.radians);
        plane.rotateX(-0.5 * Math.PI);

        return plane
    }

    // Get a random lot at a random location
    static getRandomLot(road, area) {
        const location = Lot.getRandomLocation(road, area);
        return new Lot(location.center, area.length, area.width, location.rotation);
    }

    // Get a random lot area
    static getRandomSize() {
        const width = Algebra.getRandom(10, MAX_SIZE);
        const length = Algebra.getRandom(10, MAX_SIZE);

        return {
            width: width,
            length: length
        }
    }

    // Get a random location next to the road
    static getRandomLocation(road, area) {
        const width = area.width;
        const length = area.length;

        // Get vector and perpendicular vector
        const vector = math.subtract(road.geometry.end.toVector2D(), road.geometry.start.toVector2D());
        const vectorPerpendicular = [-vector[1], vector[0]];
        const vectorLength = Algebra.length(vectorPerpendicular);

        // Distance to road
        const roadOffset = (road.metadata.type.SEGMENT_WIDTH / 2) / vectorLength;
        const rightOfRoad = width / vectorLength + roadOffset;
        const leftOfRoad = 0 - roadOffset;
        const randomLeft = Algebra.getRandom(-(1 - leftOfRoad), leftOfRoad);
        const randomRight = Algebra.getRandom(rightOfRoad, 1);
        const distance = Algebra.randomChoice([randomLeft, randomRight]);

        // Position along length of road
        const lengthWise = Algebra.getRandom(0, 1 - length / vectorLength);

        // Turn position and distance into vectors
        const posVector = math.multiply(lengthWise, vector);
        const distVector = math.multiply(distance, vectorPerpendicular);

        // Calculate the relative position to the road
        const position = math.add(posVector, distVector);

        // Translate to the absolute position of the building
        const point = math.add(position, road.geometry.start.toVector2D());

        // Get rotation of building, so that it matches the road
        const rotation = road.geometry.direction();

        return {
            center: point,
            rotation: rotation
        }
    }
}