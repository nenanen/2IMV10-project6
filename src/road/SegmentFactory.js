import RoadSegment from "./RoadSegment";
import Segment from "./Segment"
import Point from "./Point";
import * as math from "mathjs";
import * as _ from "lodash";
import Angle from "./Angle";

export default class SegmentFactory {

    static createRoad(segment, time, type, config) {
         let metadata = _.defaults({
            type: type,
            severed: false
        });

        return new RoadSegment(segment, time, metadata, config);
    }

    static direction(start, direction, length) {
        const x = start.x + length * Math.sin(direction.radians);
        const z = start.z + length * Math.cos(direction.radians);
        const y = start.y;
        let end = new Point(x, y, z);
        return new Segment(start, end);
    }

    static continue(segment, angle=new Angle(0), length) {
        let start = segment.end;
        let direction = new Angle(segment.direction().degrees + angle.degrees);
        return this.direction(start, direction, length)
    }

    static branchLeft(segment, angle=new Angle(0), length) {
        let start = segment.end;
        let direction = new Angle(segment.direction().degrees - 90 + angle.degrees);
        return this.direction(start, direction, length)
    }

    static branchRight(segment, angle=new Angle(0), length) {
        let start = segment.end;
        let direction = new Angle(segment.direction().degrees + 90 + angle.degrees);
        return this.direction(start, direction, length)
    }

    static copy(segment) {
        return new Segment(segment.start, segment.end);
    }
}