import RoadSegment from "./RoadSegment";
import Segment from "./Segment"
import Point from "./Point";
import * as math from "mathjs";

export default class SegmentFactory {

    static createRoad(segment, time, metadata) {
        return new RoadSegment(segment, time, metadata);
    }

    static direction(start, direction, length) {
        let x = start.x + length * math.sinDegrees(direction);
        let y = start.y + length * math.cosDegrees(direction);
        let end = Point(x, y);
        return new Segment(start, end);
    }

    static continue(prevSegment) {
        let start = prevSegment.end;
        let direction = prevSegment.direction();
        return this.direction(start, direction, prevSegment.length())
    }

    static copy(segment) {
        return new Segment(segment.start, segment.end);
    }
}