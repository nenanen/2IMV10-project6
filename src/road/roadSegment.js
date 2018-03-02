export class RoadSegment {
    constructor(timeDelay, geometry, metadata) {

        // The time delay until the segment is placed in the world
        this.timeDelay = timeDelay;

        // The geometrical properties of the segment
        this.geometry = geometry;

        // Any additional metadata stored with the road segment
        this.metadata = metadata;
    }
}