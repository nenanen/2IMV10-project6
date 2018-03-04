import * as _ from "lodash";
import * as math from "mathjs";

export default class Segment {
    /**
     * A road segment.
     * @param {Point} start - The starting point of the segment.
     * @param {Point} end - The end point of the segment.
     */
    constructor(start, end) {

        // Start and end points
        this.start = start;
        this.end = end;
    }

    /**
     * Calculates the length of the road segment.
     * @returns {number}
     */
    length() {
        let startVector = this.start.toVector();
        let endVector = this.end.toVector();
        let vector = math.subtract(endVector, startVector);
        vector = _.map(vector, (n) => Math.pow(n, 2));
        return Math.sqrt(vector);
    }

    /**
     * Calculates the direction of the road segment.
     * @returns {number}
     */
    direction() {
        let vector = math.subtractPoints(this.end.toVector(), this.start.toVector());
        return -1 * math.sign(math.crossProduct({x: 0, y: 1}), vector) * math.angleBetween({x: 0, y: 1}, vector)
    }
}