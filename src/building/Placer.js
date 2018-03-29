import Algebra from "../road/Algebra";
import * as math from "mathjs";
import BuildingController from "./building";
import * as THREE from "three";

export default class Placer {

    constructor(roads, threejsWorld, heatmap, config) {
        this.config = config;
        this.roads = roads;
        this.controller = new BuildingController(threejsWorld);
        this.heatmap = heatmap;
        this.group = new THREE.Object3D();
    }

    placeAllBuildings() {
        this.roads.forEach((road) => this.placeBuildings(road));
        return this.group;

    }

    placeBuildings(road, location) {

        let lots = [];
        while (lots.length < this.config.NUMBER_BUILDINGS_PER_ROAD) {
            let lot = Placer.getRandomLot(road);
            if (!Placer.lotIntersectsRoads(lot, this.roads)) {
                lots.push(lot);
            }
        }

        // Just place one random building for each road now.
        for (let lot of lots) {
            let obj = this.placeBuilding(road, lot);
            this.group.add(obj);
        }
    }

    static lotIntersectsRoads(lot, roads) {
        for (let road of roads) {
            const start = road.geometry.start.toVector2D();
            const end = road.geometry.start.toVector2D();
            const location = road.location();

            // todo get coordinates of road.
            if (Algebra.polygonsCollide(location.center, location.coordinates, lot.center, lot.coordinates)) {
                return true
            }
        }
        return false;
    }

    placeBuilding(road, lot) {
        const width = lot.side;

        const population = this.heatmap.populationAt(lot.center[0], lot.center[1]);
        const randomness = Math.random();
        const gaussian = Algebra.gaussianRange(0, 1);
        const factor = Math.max(Math.sqrt(population) * (randomness + gaussian) / 2, 0.1);
        const height = Math.pow(factor * 20, 1.5) * 3;
        let building = this.controller.generate(width, height, width, lot.center[0], 0, lot.center[1]);
        building.rotateY(lot.rotation);
        building.translateY(height/2);
        return building
    }

    static getRandomLot(road) {
        const width = Algebra.getRandom(10, 20);
        const location = Placer.getRandomLocation(road, width, width);

        // Get shorthands
        const c = location.center;
        const r = width / 2;
        const x = c[0];
        const y = c[1];

        // Gets coordinates and applies rotation
        const coordinates = [
            [x - r, y - r], // bottom left
            [x - r, y + r], // top left
            [x + r, y + r], // top right
            [x - r, y - r], // bottom right
        ].map(coord => Algebra.rotate(c, coord, location.rotation));

        return {
            side: width,
            center: location.center,
            rotation: location.rotation,
            coordinates: coordinates
        }
    }

    // Get a random location next to the road
    static getRandomLocation(road, length, width) {
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
        const lengthWise = Algebra.getRandom(0, 1 - length/vectorLength);

        // Turn position and distance into vectors
        const posVector = math.multiply(lengthWise, vector);
        const distVector = math.multiply(distance, vectorPerpendicular);

        // Calculate the relative position to the road
        const position = math.add(posVector, distVector);

        // Translate to the absolute position of the building
        const point = math.add(position, road.geometry.start.toVector2D());

        // Get rotation of building, so that it matches the road
        const rotation = road.geometry.direction()/180 * Math.PI;

        return {
            center: point,
            rotation: rotation
        }
    }



}