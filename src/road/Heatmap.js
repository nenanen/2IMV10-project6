import * as THREE from "three";
import * as config from "./Config"

let SimplexNoise = require('simplex-noise');

export default class Heatmap {
    constructor() {
        const seed = Math.random().toString();
        this.noise = new SimplexNoise(seed)
    }

    populationAtEnd(road) {
        return this.populationAt(road.end.x, road.end.z)
    }

    populationOnRoad(road) {
        let start = this.populationAt(road.start.x, road.start.z);
        let end = this.populationAt(road.end.x, road.end.z);
        return (start + end) / 2
    }

    populationAt(x, y) {
        // return this.noise.noise2D(x, y);
        let a = (this.noise.noise2D(x / 10000, y / 10000) + 1) / 2;
        let b = (this.noise.noise2D(x / 20000, y / 20000 + 500) + 1) / 2;
        let c = (this.noise.noise2D(x / 20000, y / 20000 + 1000) + 1) / 2;
        return Math.pow((a * b + c) / 2, 2)
    }

    populationAtEndTile(segment, tileSize) {
        return this.populationAtTile(segment.end.x, segment.end.z, tileSize);
    }

    populationAtTile(x, y) {

        // Get the tile size
        const tileSize = config.TILE_SIZE;

        // Locate the middle of the tile where (x, y) is located
        const xTile = Math.floor(x/tileSize) * tileSize;
        const yTile = Math.floor(y/tileSize) * tileSize;

        // Return the population at the center of the tile
        return this.populationAt(xTile, yTile)

    }

    visualize(xMin, xMax, yMin, yMax) {

        // Get the tile size
        const tileSize = config.TILE_SIZE;

        let planes = [];

        for(let x = xMin; x <= xMax; x += tileSize) {
            for(let y = yMin; y <= yMax; y += tileSize) {
                const population = this.populationAtTile(x, y, tileSize);

                const dense = population > config.ROADS.HIGHWAY.BRANCH_POPULATION_THRESHOLD;
                const lightness = Math.trunc(population * 100);
                const color = dense ? `hsl(0, 0%, ${lightness}%)` : `hsl(168, 100%, ${lightness}%)`;
                const tColor = new THREE.Color(color);
                const geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize);
                const material = new THREE.MeshBasicMaterial({color: tColor, side: THREE.DoubleSide});
                const plane = new THREE.Mesh(geometry, material);

                plane.rotateX(-0.5 * Math.PI);

                plane.position.setX(x);
                plane.position.setY(0);
                plane.position.setZ(y);
                planes.push(plane)
            }
        }
        console.log(`Visualizing ${planes.length} planes`);
        return planes
    }
}