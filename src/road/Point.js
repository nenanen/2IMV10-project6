import * as math from "mathjs";

export class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get vector() {
        return math.matrix([this.x, this.y, this.z]);
    }

    diff(other) {

    }
}