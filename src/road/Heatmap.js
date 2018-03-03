let SimplexNoise = require('simplex-noise');

export class Heatmap {
    constructor() {
        const seed = Math.random().toString();
        this.noise = new SimplexNoise(seed)
    }

    populationOnRoad(road) {
        let start = self.populationAt(road.start.x, road.start.y);
        let end = self.populationAt(road.end.x, road.end.y);
        return (start + end) / 2
    }

    populationAt(x, y) {
        let a = (this.noise.noise2D(x / 10000, y / 10000) + 1) / 2;
        let b = (this.noise.noise2D(x / 20000, y / 20000 + 500) + 1) / 2;
        let c = (this.noise.noise2D(x / 20000, y / 20000 + 1000) + 1) / 2;
        return Math.pow((a * b + c) / 2, 2)
    }
}