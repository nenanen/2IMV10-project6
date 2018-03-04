import * as math from "mathjs";
import * as _ from "lodash";

export default class Util {
    static doSegmentsIntersect(r1, r2) {
        let start1 = r1.start.toVector();
        let end1 = r1.end.toVector();
        let start2 = r2.start.toVector();
        let end2 = r2.end.toVector();

        return math.doLineSegmentsIntersect(start1, end1, start2, end2, true)
    }

    static randomAngle(limit) {
        return math.random(-limit, +limit);
    }

    static vectorLength(vector) {
        vector = _.map(vector, (n) => Math.pow(n, 2));
        const sum = _.sum(vector);
        return Math.sqrt(sum);
    }

    static angleBetween(v1, v2, x=0, y=2) {
        const v1x = v1[x];
        const v1y = v1[y];
        const v2x = v2[x];
        const v2y = v2[y];
        const angleRad = Math.acos((v1x * v2x + v1y * v2y) / (this.vectorLength(v1) * this.vectorLength(v2)));
        return angleRad * 180 / Math.PI
    }
}