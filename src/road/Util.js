import * as math from "mathjs";
import * as _ from "lodash";

export default class Util {

    static segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {

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

    static doRoadsIntersect(r1, r2) {
        let start1 = r1.geometry.start.toVector2D();
        let end1 = r1.geometry.end.toVector2D();
        let start2 = r2.geometry.start.toVector2D();
        let end2 = r2.geometry.end.toVector2D();

        if (_.isEqual(start1, start2) || _.isEqual(start1, end2) || _.isEqual(end1, start2) || _.isEqual(end1, end2)) {
            return null
        }

        return Util.segmentsIntersect(start1[0], start1[1], end1[0], end1[1], start2[0], start2[1], end2[0], end2[1])
    }


    static doSegmentsIntersect(r1, r2) {
        let start1 = r1.start.toVector3D();
        let end1 = r1.end.toVector3D();
        let start2 = r2.start.toVector3D();
        let end2 = r2.end.toVector3D();

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

    static angleBetween(v1, v2, x = 0, y = 2) {
        const v1x = v1[x];
        const v1y = v1[y];
        const v2x = v2[x];
        const v2y = v2[y];
        const angleRad = Math.acos((v1x * v2x + v1y * v2y) / (this.vectorLength(v1) * this.vectorLength(v2)));
        return angleRad * 180 / Math.PI
    }
}