export default class Point {
    /**
     * A point in 3D space.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number} z - The z-coordinate.
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Vector representation of the point.
     * @returns {*[]}
     */
    toVector3D() {
        return [this.x, this.y, this.z];
    }

    toVector2D() {
        return [this.x, this.z];
    }

    static copy (point) {
        return new Point(point.x, point.y, point.z);
    }
}