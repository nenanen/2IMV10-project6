import * as math from "mathjs";

export default class Util {
    static doSegmentsIntersect(r1, r2) {
        let start1 = r1.start.toVector();
        let end1 = r1.end.toVector();
        let start2 = r2.start.toVector();
        let end2 = r2.end.toVector();

        return math.doLineSegmentsIntersect(start1, end1, start2, end2, true)
    }

    static randomAngle(limit) {
        return math.randomRange(-limit, +limit);
    }
}