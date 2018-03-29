import * as math from "mathjs";
import Algebra from "./Algebra";

export default class Segment {
    /**
     * A road segment.
     * @param {Point} start - The starting point of the segment.
     * @param {Point} end - The end point of the segment.
     */
    constructor(start, end) {

        // Start and end points
        this._start = start;
        this._end = end;
        this.update();
    }

    update() {
        const geo = this;
        this.minX = Math.min(geo.start.x, geo.end.x);
        this.minY = Math.min(geo.start.z, geo.end.z);
        this.maxX = Math.max(geo.start.x, geo.end.x);
        this.maxY = Math.max(geo.start.z, geo.end.z);
        this.width = this.maxX - this.minX;
        this.height = this.maxY - this.minY;
    }

    set start(start) {
        this._start = start;
        this.update();
    }

    get start() {
        return this._start;
    }

    set end(end) {
        this._end = end;
        this.update();
    }

    get end() {
        return this._end;
    }

    /**
     * Calculates the length of the road segment.
     * @returns {number}
     */
    length() {
        let startVector = this.start.toVector3D();
        let endVector = this.end.toVector3D();
        return Algebra.distance(startVector, endVector);
    }

    /**
     * Calculates the direction of the road segment.
     * @returns {number}
     */
    direction() {
        let startVector = this.start.toVector2D();
        let endVector = this.end.toVector2D();
        let vector = math.subtract(endVector, startVector);
        return Algebra.direction(vector);
    }

    toPolygon() {
        return [this.start.toVector2D(), this.end.toVector2D()];
    }

    center() {
        // const diff = math.subtract(this.start.toVector2D(), this.end.toVector2D());
        // return math.add(this.start.toVector2D(), math.multiply(diff, 0.5));
        return math.multiply(math.add(this.start.toVector2D(), this.end.toVector2D()), 0.5);
    }

    limits() {
        return {
            x: this.minX,
            y: this.minY,
            height: this.height,
            width: this.width,
            o: this
        }
    }
}