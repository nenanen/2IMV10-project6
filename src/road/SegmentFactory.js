import RoadSegment from "./RoadSegment";
import Segment from "./Segment"
import Point from "./Point";
import * as math from "mathjs";
import * as _ from "lodash";

export default class SegmentFactory {

    static createRoad(segment, time, type, config) {
         let metadata = _.defaults({
            type: type,
            severed: false
        });

        return new RoadSegment(segment, time, metadata, config);
    }

    static direction(start, direction, length) {
        const x = start.x + length * math.sin(math.unit(direction, 'deg'));
        const z = start.z + length * math.cos(math.unit(direction, 'deg'));
        const y = start.y;
        let end = new Point(x, y, z);
        return new Segment(start, end);
    }

    static continue(segment, angle, length) {
        let start = segment.end;
        let direction = segment.direction() + angle;
        return this.direction(start, direction, length)
    }

    static branchLeft(segment, angle=0, length) {
        let start = segment.end;
        let direction = segment.direction() - 90 + angle;
        return this.direction(start, direction, length)
    }

    static branchRight(segment, angle=0, length) {
        let start = segment.end;
        let direction = segment.direction() + 90 + angle;
        return this.direction(start, direction, length)
    }

    static copy(segment) {
        return new Segment(segment.start, segment.end);
    }
}