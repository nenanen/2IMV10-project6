import * as math from "mathjs";
import SAT from "../vendor/Sat";

export default class Algebra {
    static distanceToLine(P, A, B) {
        const x0 = P[0], x1 = A[0], x2 = B[0];
        const y0 = P[1], y1 = A[1], y2 = B[1];
        const area = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
        const distAB = this.distance(A, B);

        return area / distAB;
    }

    static polygonsCollide(origin1, poly1, origin2, poly2) {

        let V = SAT.Vector;
        let P = SAT.Polygon;

        let poly1Vectors = poly1.map(coord => new V(coord[0] - origin1[0], coord[1] - origin1[1]));
        let poly2Vectors = poly2.map(coord => new V(coord[0] - origin2[0], coord[1] - origin2[1]));

        // A square
        let polygon1 = new P(new V(origin1[0], origin1[1]), poly1Vectors);

        // A triangle
        let polygon2 = new P(new V(origin2[0], origin2[1]), poly2Vectors);
        let response = new SAT.Response();

        // Return whether the collide
        return SAT.testPolygonPolygon(polygon1, polygon2, response)

    }

    static magnitude(vector) {
        return Math.sqrt(math.dot(vector, vector))
    }

    static norm(vector) {
        if (Algebra.magnitude(vector) === 0) {
            return vector
        }
        const magnitude = Algebra.magnitude(vector);
        return vector.map(i => i / magnitude)
    }

    static line_ray_intersection_point(ray_orig, ray_end, point_1, point_2) {
        // Convert to numpy arrays
        let direction = Algebra.norm(math.subtract(ray_end, ray_orig));

        // Ray-Line Segment Intersection Test in 2D
        // http://bit.ly/1CoxdrG
        let v1 = math.subtract(ray_orig, point_1);
        let v2 = math.subtract(point_2, point_1);
        let v3 = [-direction[1], direction[0]];

        if (math.dot(v2, v3) === 0) {
            return []
        }

        let t1 = math.cross(v2, v1) / math.dot(v2, v3);
        let t2 = math.dot(v1, v3) / math.dot(v2, v3);

        if (t1 > 0.0 && 0.0 <= t2 <= 1.0) {
            return math.add(ray_orig, math.multiply(direction, t1));
        }

        return []
    }

    static intersectsPolygon(segment_start, segment_end, coordinates) {
        coordinates.push(coordinates[0]);
        for (let i = 0; i < coordinates.length - 1; i++) {
            const intersect = Algebra.segmentsIntersect(segment_start, segment_end, coordinates[i], coordinates[i + 1]);
            if (intersect) {
                return true;
            }
        }

        return false
    }

    static rotate(center, point, angle) {
        const p = center[0];
        const q = center[1];
        const x = point[0];
        const y = point[1];
        const radians = angle / 180 * Math.PI;
        return [
            (x - p) * Math.cos(radians) - (y - q) * Math.sin(radians) + p,
            (x - p) * Math.sin(radians) + (y - q) * Math.cos(radians) + q
        ]

    }

    /**
     * Retrieve the array key corresponding to the largest element in the array.
     * @param {Array.<number>} array - Input array
     * @return {number} - Index of array element with largest value
     */
    static argMax(array) {
        return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }

    static randomChoice(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    static randomWeightedKeyValue(array) {
        return Algebra.randomWeighted(Object.keys(array), Object.values(array))
    }

    static randomWeighted(list, weights) {
        const random = Math.random();
        const summed = Algebra.cumSum(weights);

        for (let i = 0; i < summed.length; i++) {
            if (random < summed[i]) {
                return list[i]
            }
        }

        return list[list.length - 1];
    }

    static cumSum(a) {
        let result = [a[0]];

        for (let i = 1; i < a.length; i++) {
            result[i] = result[i - 1] + a[i];
        }

        return result;
    };

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
        const point = math.multiply(component / Math.pow(this.length(onto), 2), onto);
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
        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

        if (denominator === 0) {
            return false;
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        const segment1OnLine = ua >= 0 && ua <= 1;
        const segment2OnLine = ub >= 0 && ub <= 1;

        if (segment1OnLine && segment2OnLine) {
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
    static getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Calculate the angle between two two-dimensional vectors.
     * @param {Array} v1 - Two-dimensional vector
     * @param {Array} v2 - Two-dimensional vector
     * @returns {number} - The angle in degrees
     */
    static angleBetween(v1, v2) {
        const x1 = v1[0];
        const y1 = v1[1];
        const x2 = v2[0];
        const y2 = v2[1];
        const angleRad = Math.acos((x1 * x2 + y1 * y2) / (this.length(v1) * this.length(v2)));
        return angleRad * 180 / Math.PI
    }

    /**
     * Calculates clockwise direction of vector.
     * @param {Array} vec - Two-dimensional vector
     * @returns {number} - The clockwise angle in degrees
     */
    static direction(vec) {
        let direction = this.angleBetween([0, 1], vec);
        const sign = vec[0] >= 0 ? 1 : -1;
        return sign * direction
    }
}