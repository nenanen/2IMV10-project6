import PriorityQueue from "../util/priorityQueue"
import RoadSegment from "./RoadSegment"
import * as config from "./Config"
import Point from "./Point";
import Heatmap from "./Heatmap";
import Util from "./Util";
import SegmentFactory from "./SegmentFactory";
import Segment from "./Segment";

export default class MapGen {
    constructor() {
        this.queue = new PriorityQueue();
        this.segmentList = [];
        this.heatmap = new Heatmap();
    }

    initialize() {
        let start = new Point(0, 1, 0);
        let end = new Point(0, 1, config.HIGHWAY_SEGMENT_LENGTH);
        let segment = new Segment(start, end);
        let initial = SegmentFactory.createRoad(segment, 0, config.ROADS.HIGHWAY);
        this.queue.put(0, initial);
    }

    generate() {
        console.log("generate");
        let limit = 10;
        let count = 0;
        while (!this.queue.empty()) {
            let segment = this.queue.get();
            let local = this.localConstraints(segment);
            count += 1;
            console.log(count);
            if (local.accepted && count < limit) {
                this.segmentList.push(local.segment);
                let newSegments = this.globalGoals(local.segment);
                console.log("Segments added", newSegments);
                for (let seg of newSegments) {
                    this.queue.put(seg.time, seg)
                }
            }
        }
    }

    localConstraints(segment) {
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

        // Determine time delay of insertion of segment
        let delay = roadSegment.metadata.type === config.ROADS.HIGHWAY ? config.HIGHWAY_BRANCH_DELAY : 0;

        // Handle highways
        if (roadSegment.metadata.type === config.ROADS.HIGHWAY) {

            // Initialize population of the new road
            let popRoad = 0;

            // Continue straight or with angle
            if (popAngle > popStraight) {
                let r = SegmentFactory.createRoad(continueStraight, delay, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popStraight;
            } else {
                let r = SegmentFactory.createRoad(continueAngle, delay, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popAngle;
            }

            // Check if population high enough for branch
            if (popRoad > config.HIGHWAY_BRANCH_POPULATION_THRESHOLD) {

                // Create left branch with some probability
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, delay, config.ROADS.URBAN);
                    newBranches.push(r)
                }

                // Create right branch with some probability
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let rightBranch = SegmentFactory.branchRight(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    let r = SegmentFactory.createRoad(rightBranch, delay, config.ROADS.URBAN);
                    newBranches.push(r)
                }

            }
        }

        // Handle urban roads
        if (roadSegment.metadata.type === config.ROADS.URBAN) {
            if (popStraight > config.URBAN_BRANCH_POPULATION_THRESHOLD) {

                // Left branch
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, delay, config.ROADS.URBAN);
                    newBranches.push(r)
                }

                // Right branch
                if (Math.random() > config.DEFAULT_BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.DEFAULT_SEGMENT_LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, delay, config.ROADS.URBAN);
                    newBranches.push(r)
                }
            }
        }


        return newBranches
    }

}