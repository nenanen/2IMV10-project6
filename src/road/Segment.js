import * as _ from "lodash";
import * as math from "mathjs";
import Util from "./Util";

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
        let startVector = this.start.toVector3D();
        let endVector = this.end.toVector3D();
        let vector = math.subtract(endVector, startVector);
        vector = _.map(vector, (n) => Math.pow(n, 2));
        const sum = _.sum(vector);
        return Math.sqrt(sum);
    }

    /**
     * Calculates the direction of the road segment.
     * @returns {number}
     */
    direction() {
        let startVector = this.start.toVector3D();
        let endVector = this.end.toVector3D();
        let vector = math.subtract(endVector, startVector);
        let sign = math.sign(vector[0]);
        let angle = Util.angleBetween([0, 0, 1], vector);

        // Put the angle on the circle between 0 and 360.
        let degrees = (-1 * sign * angle) % 360;
        return (degrees < 0) ? degrees + 360 : degrees;
    }
}