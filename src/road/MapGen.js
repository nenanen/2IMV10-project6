import PriorityQueue from "../util/priorityQueue"
import RoadSegment from "./RoadSegment"
import * as config from "./Config"
import Point from "./Point";
import Heatmap from "./Heatmap";
import Util from "./util";
import SegmentFactory from "./SegmentFactory";
import Segment from "./Segment";

export class MapGen {
    constructor() {
        this.queue = new PriorityQueue();
        this.segmentList = [];
        this.heatmap = new Heatmap();
    }

    initialize() {
        let start = new Point(0, 1, 0);
        let end = new Point(0, 1, 10);
        let segment = new Segment(start, end);
        let initial = SegmentFactory.createRoad(segment, config.HIGHWAY_SEGMENT_LENGTH, config.ROADS.HIGHWAY);
        this.segmentList.push(initial);
    }

    generate() {
        while (!this.queue.empty()) {
            let segment = this.queue.pop();
            let local = this.localConstraints(segment);
            if (local.accepted) {
                this.segmentList.push(local.segment);
                let newSegments = this.globalGoals(local.segment);
                for (let seg of newSegments) {
                    this.queue.push(seg.timeDelay, seg)
                }
            }
        }
    }

    static localConstraints(segment) {
        // if "two streets intersect" then "generate a crossing".
        // if "ends close to an existing crossing" then "extend street, to reach the crossing".
        // if "close to intersecting" then "extend street to form intersection".

        return {
            accepted: true,
            segment: segment
        }
    }

    globalGoals(roadSegment) {

        // Get segment
        let segment = roadSegment.geometry;

        // Initialize branches
        let newBranches = [];

        // If segment is severed, we return empty list of new branches
        if (roadSegment.metadata.severed) {
            return newBranches
        }

        // Generate random angles for branching roads and continuation of segment
        let randomBranchAngle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
        let randomContinuationAngle = Util.randomAngle(config.FORWARD_ANGLE_LIMIT);

        // Initialize continuations on the previous segment
        let continueStraight = SegmentFactory.continue(segment);
        let continueAngle = SegmentFactory.continue(segment, randomContinuationAngle);

        // Determine population on road if we continue straight
        let popStraight = this.heatmap.populationOnRoad(continueStraight);
        let popAngle = this.heatmap.populationOnRoad(continueAngle);


        // Handle highways
        if (roadSegment.metadata.type === config.ROADS.HIGHWAY) {

            // Initialize population of the new road
            let popRoad = 0;

            // Continue straight or with angle
            if (popAngle > popStraight) {
                let r = SegmentFactory.createRoad(continueStraight, config.DEFAULT_SEGMENT_LENGTH, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popStraight;
            } else {
                let r = SegmentFactory.createRoad(continueAngle, config.DEFAULT_SEGMENT_LENGTH, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popAngle;
            }

            // Check if population high enough for branch
            if (popRoad > config.HIGHWAY_BRANCH_POPULATION_THRESHOLD) {

                // Create left branch with some probability
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    newBranches.push(leftBranch)
                }

                // Create right branch with some probability
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let rightBranch = SegmentFactory.branchRight(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    newBranches.push(rightBranch)
                }

            }
        }


        return newBranches
    }

}