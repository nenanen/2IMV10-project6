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
        this.minX = Math.min(this._start.x, this._end.x);
        this.minY = Math.min(this._start.y, this._end.y);
        this.width = Math.abs(this._start.x - this._end.x);
        this.height = Math.abs(this._start.y - this._end.y);
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