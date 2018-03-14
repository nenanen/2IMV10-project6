import * as math from "mathjs";

export default class Algebra {
    static distanceToLine(P, A, B) {
        const x0 = P[0], x1 = A[0], x2 = B[0];
        const y0 = P[1], y1 = A[1], y2 = B[1];
        const area = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
        const distAB = this.distance(A, B);

        return area / distAB;
    }

    /**
     * Project a point on a line.
     * @param {Array} P - N-dimensional point
     * @param {Array} A - N-dimensional point
     * @param {Array} B - N-dimensional point
     * @returns {Array} - N-dimensional projected point
     */
    static projectOnLine(P, A, B) {

        // Use A as the origin
        const vectorP = math.subtract(P, A);
        const vectorB = math.subtract(B, A);

        // Project vector P onto vector B
        const projected = this.project(vectorP, vectorB).vector;

        // Add A back to the projected point to get the point on the line
        return math.add(projected, A)

    }

    /**
     * Project a point on a line segment.
     * @param {Array} P - N-dimensional point
     * @param {Array} A - N-dimensional point
     * @param {Array} B - N-dimensional point
     * @returns {Array} - N-dimensional projected point
     */
    static projectOnSegment(P, A, B) {

        // Use A as the origin
        const vectorP = math.subtract(P, A);
        const vectorB = math.subtract(B, A);

        // Project vector P onto vector B
        const projection = this.project(vectorP, vectorB);

        // Add A back to the projected point to get the point on the line
        const point = math.add(projection.vector, A);

        // Distance from A to the projected point
        const distance = this.distance(A, point);

        if (projection.component < 0) {
            return A;
        } else if (distance > this.distance(A, B)) {
            return B
        }

        return point
    }

    /**
     * Project a vector onto another vector.
     * @param {Array} v - N-dimensional vector
     * @param {Array} onto - N-dimensional vector
     * @returns {component, vector} - Component and projected vector
     */
    static project(v, onto) {
        // http://en.wikipedia.org/wiki/Vector_projection
        // https://math.oregonstate.edu/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/dotprod/dotprod.html
        // const component = math.dot(v, onto) / Math.pow(this.length(onto), 2);
        // return math.multiply(component, onto)
        const component = math.dot(v, onto);
        const point = math.multiply(component / Math.pow(this.length(onto), 2), onto) ;
        return {
            component: component,
            vector: point
        }
    }

    /**
     * Calculate the distance between two points.
     * @param {Array} p1 - N dimensional vector
     * @param {Array} p2 - N-dimensional vector
     * @returns {number} - The distance between two points
     */
    static distance(p1, p2) {
        return this.length(math.subtract(p2, p1));
    }

    /**
     * Calculate the length of the vector.
     * @param {Array} vector - N-dimensional vector
     * @returns {number} - The length of the vector
     */
    static length(vector) {
        let vector2 = vector.map((n) => Math.pow(n, 2));
        let sum = vector2.reduce((a, b) => a + b, 0);
        return Math.sqrt(sum);
    }

    /**
     * Calculates whether segments AB and CD intersect.
     * @param {Array} A - 2D point, start of segment AB
     * @param {Array} B - 2D point, end of segment AB
     * @param {Array} C - 2D point, start of segment CD
     * @param {Array} D - 2D point, end of segment CD
     * @returns {boolean | Array} - false if no intersection, 2D point of intersection otherwise
     */
    static segmentsIntersect(A, B, C, D) {
        // https://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
        const x1 = A[0], x2 = B[0], x3 = C[0], x4 = D[0];
        const y1 = A[1], y2 = B[1], y3 = C[1], y4 = D[1];

        let ua, ub, denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denominator === 0) {
            return false;
        }
        ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        let segment1OnLine = ua >= 0 && ua <= 1;
        let segment2OnLine = ub >= 0 && ub <= 1;

        if(segment1OnLine && segment2OnLine) {
            return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)]
        }

        return false;
    }

    /**
     * Gives a random number between two values, using a gaussian approximation.
     * @param {number} start - The start of the range
     * @param {number} end - The end of the range
     * @returns {number} - The resulting random number
     */
    static gaussianRange(start, end) {
        return Math.floor(start + this.gaussianRandom() * (end - start + 1));
    }

    /**
     * A gaussian approximation of a random variable.
     * @returns {number} - A random variable between 0 and 1
     */
    static gaussianRandom() {
        // http://jsfiddle.net/xx9bh8Lz/1/
        let rand = 0;

        for (let i = 0; i < 6; i += 1) {
            rand += Math.random();
        }

      return rand / 6;
    }

    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     */
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
}