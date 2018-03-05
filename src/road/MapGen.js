import PriorityQueue from "../util/priorityQueue"
import * as config from "./Config"
import Point from "./Point";
import Heatmap from "./Heatmap";
import Util from "./Util";
import SegmentFactory from "./SegmentFactory";
import Segment from "./Segment";
import Vertex from "./Vertex";

export default class MapGen {
    constructor() {
        this.queue = new PriorityQueue();
        this.segmentList = [];
        this.heatmap = new Heatmap();
        this.vertices = [];
        this.time = 0;
    }

    initialize() {
        let start = new Point(0, 1, -500);
        let end = new Point(0, 1, config.ROADS.HIGHWAY.LENGTH - 500);
        let segment = new Segment(start, end);
        let initial = SegmentFactory.createRoad(segment, 0, config.ROADS.HIGHWAY);
        this.queue.push(initial);
    }

    generate() {
        let limit = 100;
        let count = 0;
        while (!this.queue.isEmpty()) {
            let segment = this.queue.pop();
            this.time = segment.time;
            let local = this.localConstraints(segment);
            count += 1;
            if (local.accepted && count < limit) {
                this.segmentList.push(local.segment);
                let newSegments = this.globalGoals(local.segment);
                for (let seg of newSegments) {
                    this.queue.push(seg)
                }
            }
        }
    }

    localConstraints(segment) {
        let intersection = false;
        for (let seg of this.segmentList) {
            let point = Util.doRoadsIntersect(segment, seg);
            if (point) {
                let end = segment.geometry.end;
                this.vertices.push(new Vertex(point[0], end.y, point[1]));
                segment.metadata.severed = true;
                // console.log("Segments intersect");
                // console.log(seg, "and", segment, "intersect at", point);
                // console.log("Segment endpoint corrected to");
                // console.log(segment.geometry.start, new Point(point[0], end.y, point[1]));
                // // console.log(point[0], end.y, point[1]);
                segment.geometry.end = new Point(point[0], end.y, point[1]);
                intersection = false;
                break;
            }
        }

        // let intersections = findIntersectingRoads(this.segmentList.concat(segment));
        // console.log(intersections);
        // intersections = _.filter(intersections, (o) => !o.touchingEndPoint && o.type === "intersection");

        // if "two streets intersect" then "generate a crossing".
        // if "ends close to an existing crossing" then "extend street, to reach the crossing".
        // if "close to intersecting" then "extend street to form intersection".

        return {
            // accepted: intersections.length === 0,
            accepted: !intersection,
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
        let continueStraight = SegmentFactory.continue(segment, 0, roadSegment.metadata.type.LENGTH);
        let continueAngle = SegmentFactory.continue(segment, randomContinuationAngle, roadSegment.metadata.type.LENGTH);

        // Determine population on road if we continue straight
        let popStraight = this.heatmap.populationAtEnd(continueStraight);
        let popAngle = this.heatmap.populationAtEnd(continueAngle);

        // Handle highways
        if (roadSegment.metadata.type === config.ROADS.HIGHWAY) {

            // Initialize population of the new road
            let popRoad = 0;

            // Continue straight or with angle
            if (popAngle > popStraight) {
                let r = SegmentFactory.createRoad(continueStraight, this.time + 1, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popStraight;
            } else {
                let r = SegmentFactory.createRoad(continueAngle, this.time + 1, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popAngle;
            }

            // Check if population high enough for branch
            if (popRoad > config.ROADS.HIGHWAY.BRANCH_POPULATION_THRESHOLD) {

                // Create left branch with some probability
                if (Math.random() > config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + 2, config.ROADS.URBAN);
                    newBranches.push(r)
                }

                // Create right branch with some probability
                if (Math.random() > config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let rightBranch = SegmentFactory.branchRight(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(rightBranch, this.time + 2, config.ROADS.URBAN);
                    newBranches.push(r)
                }

            }
        }

        // Handle urban roads
        if (roadSegment.metadata.type === config.ROADS.URBAN) {
            if (popStraight > config.ROADS.URBAN.BRANCH_POPULATION_THRESHOLD) {

                // Left branch
                if (Math.random() > config.ROADS.URBAN.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + 1, config.ROADS.URBAN);
                    newBranches.push(r)
                }

                // Right branch
                if (Math.random() > config.ROADS.URBAN.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchRight(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + 1, config.ROADS.URBAN);
                    newBranches.push(r)
                }
            }
        }


        return newBranches
    }

}