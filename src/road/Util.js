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
        const end1 = r1.geometry.end.toVector2D();
        const end2 = r2.geometry.end.toVector2D();

        return Algebra.distance(end1, end2) < range;
    }

    static distanceToRoad(r1, r2) {
        const P = r1.geometry.end.toVector2D();
        const A = r2.geometry.start.toVector2D();
        const B = r2.geometry.end.toVector2D();
        let point = Algebra.projectOnSegment(P, A, B);
        return {
            distance: Algebra.distance(P, point),
            point: point
        }
    }

    static randomAngle(limit) {
        return Algebra.gaussianRange(-limit, +limit);
    }
}