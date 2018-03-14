import * as math from "mathjs";
import * as _ from "lodash";
import Algebra from "./Algebra";

export default class Util {

    static doRoadsIntersect(r1, r2) {
        let start1 = r1.geometry.start.toVector2D();
        let end1 = r1.geometry.end.toVector2D();
        let start2 = r2.geometry.start.toVector2D();
        let end2 = r2.geometry.end.toVector2D();

        if (_.isEqual(start1, start2) || _.isEqual(start1, end2) || _.isEqual(end1, start2) || _.isEqual(end1, end2)) {
            return false
        }

        return Algebra.segmentsIntersect(start1, end1, start2, end2);
    }

    static areRoadsInRange(r1, r2, range) {
        let end1 = r1.geometry.end.toVector2D();
        let end2 = r2.geometry.end.toVector2D();

        return this.distance(end1, end2) < range;
    }

    static distanceToRoad(r1, r2) {
        const P = r1.geometry.end.toVector2D();
        const A = r2.geometry.start.toVector2D();
        const B = r2.geometry.end.toVector2D();
        let point = Algebra.projectOnSegment(P, A, B);
        return Algebra.distance(P, point)
    }

    static distanceToLine(P, A, B) {
        // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
        const x0 = P[0], x1 = A[0], x2 = B[0];
        const y0 = P[1], y1 = A[1], y2 = B[1];
        const area = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
        const distAB = this.distance(A, B);

        return area / distAB;
    }

    static projectOnLine(P, A, B) {
        const vecAP = math.subtract(P, A);
        const vecAB = math.subtract(B, A);
        const projected = Util.project(vecAP, vecAB);
        return math.add(A, projected);
    }

    static project(v, onto) {
        // http://en.wikipedia.org/wiki/Vector_projection
        // https://math.oregonstate.edu/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/dotprod/dotprod.html
        const component = math.dot(v, onto) / Math.pow(Util.vectorLength(onto), 2);
        return math.multiply(component, onto)
    }


    static doSegmentsIntersect(r1, r2) {
        let start1 = r1.start.toVector2D();
        let end1 = r1.end.toVector2D();
        let start2 = r2.start.toVector2D();
        let end2 = r2.end.toVector2D();

        if (_.isEqual(start1, start2) || _.isEqual(start1, end2) || _.isEqual(end1, start2) || _.isEqual(end1, end2)) {
            return false
        }

        return Util.segmentsIntersect(start1[0], start1[1], end1[0], end1[1], start2[0], start2[1], end2[0], end2[1])
    }

    static randomAngle(limit) {
        return math.random(-limit, +limit);
    }

    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     */
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static distance(v1, v2) {
        return this.vectorLength(math.subtract(v2, v1));
    }

    /**
     * Calculate the length of the vector.
     * @param {Array} vector - N-dimensional vector
     * @returns {number} - The length of the vector
     */
    static vectorLength(vector) {
        let vector2 = vector.map((n) => Math.pow(n, 2));
        let sum = vector2.reduce((a, b) => a + b, 0);
        return Math.sqrt(sum);
    }

    /**
     * Calculate the angle between two two-dimensional vectors.
     * @param {Array} v1 - Two-dimensional vector
     * @param {Array} v2 - Two-dimensional vector
     * @returns {number} - The angle in degrees
     */
    static angleBetween(v1, v2) {
        const v1x = v1[0];
        const v1y = v1[1];
        const v2x = v2[0];
        const v2y = v2[1];
        const angleRad = Math.acos((v1x * v2x + v1y * v2y) / (this.vectorLength(v1) * this.vectorLength(v2)));
        return angleRad * 180 / Math.PI
    }

    /**
     * Calculates clockwise direction of vector.
     * @param {Array} vec - Two-dimensional vector
     * @returns {number} - The clockwise angle in degrees
     */
    static direction(vec) {
        let direction = Util.angleBetween([0, 1], vec);
        return Math.sign(vec[0]) * direction
    }
}