import Algebra from "../road/Algebra";
import * as math from "mathjs";
import * as THREE from "three";

export default class Lot {
    constructor(center, length, width, rotation) {
        this.center = center;
        this.length = length;
        this.width = width;
        this.rotation = rotation;

        // Calculate coordinates
        const c = center;
        const w = width / 2;
        const l = length / 2;
        const x = c[0];
        const y = c[1];
        this.coordinates = [
            [x - w, y - l], // bottom left
            [x - w, y + l], // top left
            [x + w, y + l], // top right
            [x + w, y - l], // bottom right
        ].map(coord => Algebra.rotate(c, coord, rotation));

        // Calculate properties
        const xs = this.coordinates.map(coord => coord[0]);
        const ys = this.coordinates.map(coord => coord[1]);
        this.minX = Math.min.apply(null, xs);
        this.minY = Math.min.apply(null, ys);
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

    location() {
        return {
            center: this.center,
            coordinates: this.coordinates
        }
    }

    collidesAny(qTree) {
        let matches = qTree.retrieve(this.limits());

        for (let match of matches) {
            const location = match.o.location();
            const collision = this.collidesWith(location.center, location.coordinates);

            if (collision) {
                return true;
            }
        }

        return false;
    }

    // Check if the lot collides with an object with a given center and coordinates.
    collidesWith(center, coordinates) {
        return Algebra.polygonsCollide(this.center, this.coordinates, center, coordinates)
    }

    // Make a plane
    makePlane(color=0xffff00) {
        let geometry = new THREE.PlaneGeometry(this.width, this.length, 32);
        let material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.set(this.center[0], 1, this.center[1]);
        plane.rotateY(this.rotation.radians);
        plane.rotateX(-0.5 * Math.PI);

        console.log(plane.matrix, this.location().center);

        return plane
    }

    // Get a random lot at a random location
    static getRandomLot(road, area) {
        const location = Lot.getRandomLocation(road, area);
        return new Lot(location.center, area.length, area.width, location.rotation);
    }

    // Get a random lot area
    static getRandomSize() {
        const width = Algebra.getRandom(10, 20);
        const length = Algebra.getRandom(10, 20);

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