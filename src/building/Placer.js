import Algebra from "../road/Algebra";
import * as math from "mathjs";
import BuildingController from "./building";

export default class Placer {

    constructor(roads, threejsWorld, heatmap) {
        this.roads = roads;
        this.controller = new BuildingController(threejsWorld);
        this.heatmap = heatmap;
    }

    placeAllBuildings() {
        this.roads.forEach((road) => this.placeBuildings(road));
    }

    placeBuildings(road) {
        // Just place one random building for each road now.
        for (let i = 0; i <= 3; i++) {
            this.placeRandomBuilding(road);
        }
    }

    placeRandomBuilding(road) {
        const width = Algebra.getRandom(10, 20);
        const location = Placer.getRandomLocation(road, width, width);

        const population = this.heatmap.populationAt(location.center[0], location.center[1]);
        const randomness = Math.random();
        const gaussian = Algebra.gaussianRange(0, 1);
        const factor = Math.max(Math.sqrt(population) * (randomness + gaussian) / 2, 0.1);
        const height = Math.pow(factor * 20, 1.5) * 3;
        let building = this.controller.generate(width, height, width, location.center[0], 0, location.center[1]);
        building.rotateY(location.rotation);
        building.translateY(height/2);
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