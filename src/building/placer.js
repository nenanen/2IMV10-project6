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
        for (let road of this.roads) {
            this.placeBuildings(road);
        }
    }

    placeBuildings(road) {
        // Just place one random building for each road now.
        this.placeRandomBuilding(road)
    }

    placeRandomBuilding(road) {
        const location = Placer.getRandomLocation(road);

        const population = this.heatmap.populationAt(location.center[0], location.center[1]);
        const randomness = Math.random();
        const gaussian = Algebra.gaussianRange(0, 1);
        const factor = Math.max(Math.sqrt(population) * (randomness + gaussian) / 2, 0.1);
        const height = Math.pow(factor * 20, 1.5) * 3;
        const width = Algebra.getRandom(10, 20);
        let building = this.controller.generate(width, height, width, location.center[0], 0, location.center[1]);
        building.rotateY(location.rotation);
        building.translateY(height/2);
    }

    // Get a random location next to the road
    static getRandomLocation(road) {
        // Get vector and perpendicular vector
        const vector = math.subtract(road.geometry.end.toVector2D(), road.geometry.start.toVector2D());
        const vectorPerpendicular = [-vector[1], vector[0]];

        // Distance to road
        const distance = Algebra.getRandom(-0.5, +0.5);

        // Position along length of road
        const lengthWise = Algebra.getRandom(0, 1);

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