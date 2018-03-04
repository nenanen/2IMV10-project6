import RoadSegment from "./RoadSegment";
import Segment from "./Segment"
import Point from "./Point";
import * as math from "mathjs";
import * as _ from "lodash";

export default class SegmentFactory {

    static createRoad(segment, time, type) {
         let metadata = _.defaults(metadata, {
            type: type,
            severed: false
        });

        return new RoadSegment(segment, time, metadata);
    }

    static direction(start, direction, length) {
        let x = start.x + length * math.sinDegrees(direction);
        let y = start.y + length * math.cosDegrees(direction);
        let end = Point(x, y);
        return new Segment(start, end);
    }

    static continue(segment, angle=0) {
        let start = segment.end;
        let direction = segment.direction() + angle;
        return this.direction(start, direction, segment.length())
    }

    static branchLeft(segment, angle=0, length=null) {
        let start = segment.end;
        let direction = segment.direction() - 90 + angle;
        length = _.defaultTo(length, segment.length());
        return this.direction(start, direction, length)
    }

    static branchRight(segment, angle=0, length=null) {
        let start = segment.end;
        let direction = segment.direction() + 90 + angle;
        length = _.defaultTo(length, segment.length());
        return this.direction(start, direction, length)
    }

    static copy(segment) {
        return new Segment(segment.start, segment.end);
    }
}