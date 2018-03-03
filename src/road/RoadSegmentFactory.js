import {RoadSegment} from "./RoadSegment";
import {Point} from "./Point";
import * as math from "mathjs";

export class RoadSegmentFactory {

    static createFromExisting(segment, time, geometry, metadata) {
        time = _.defaultTo(time, segment.time);
        geometry = _.defaultTo(geometry, segment.geometry);
        metadata = _.defaultTo(metadata, segment.metadata);

        return new RoadSegment(geometry.start, geometry.end, time, metadata);
    }

    static usingDirection(start, direction=90, length=10, time, metadata) {
        let x = start.x + length * math.sinDegrees(direction);
        let y = start.y + length * math.cosDegrees(direction);
        let end = Point(x, y);
        return new RoadSegment(start, end, time, metadata);
    }

}