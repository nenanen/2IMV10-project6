import PriorityQueue from "../util/priorityQueue"
import * as config from "./Config"
import Point from "./Point";
import Heatmap from "./Heatmap";
import Util from "./Util";
import SegmentFactory from "./SegmentFactory";
import Segment from "./Segment";
import Vertex from "./Vertex";
import Quadtree from "../vendor/Quadtree";

export default class MapGen {
    constructor() {
        this.queue = new PriorityQueue();
        this.segmentList = [];
        this.heatmap = new Heatmap();
        this.vertices = [];
        this.time = 0;
        this.qTree = new Quadtree(config.QUADTREE_PARAMS, config.QUADTREE_MAX_OBJECTS, config.QUADTREE_MAX_LEVELS);
    }

    initialize() {
        let start = new Point(0, 1, -500);
        let end = new Point(0, 1, config.ROADS.HIGHWAY.LENGTH - 500);
        let segment = new Segment(start, end);
        let initial = SegmentFactory.createRoad(segment, 0, config.ROADS.HIGHWAY);
        this.queue.push(initial);
    }

    generate() {
        let limit = 1000;
        while (!this.queue.isEmpty()) {
            let segment = this.queue.pop();
            this.time = segment.time;
            let local = this.localConstraints(segment);
            if (local.accepted && this.segmentList.length < limit) {
                this.segmentList.push(local.segment);
                this.qTree.insert(local.segment.limits());
                let newSegments = this.globalGoals(local.segment);
                for (let seg of newSegments) {
                    this.queue.push(seg)
                }
            }
        }
    }

    localConstraints(road) {

        let matches = this.qTree.retrieve(road.limits());

        // Find intersecting points
        let intersections = [];
        for (let match of matches) {
            let point = Util.doRoadsIntersect(road, match.o);
            if (point) {
                intersections.push(point);
            }
        }


        if (intersections.length > 0) {

            // Find first intersection
            let firstIntersection = null;
            let minDistance = Infinity;
            for (let intersection of intersections) {
                let distance = Util.distance(intersection, road.geometry.start.toVector2D());
                if (distance < minDistance) {
                    minDistance = distance;
                    firstIntersection = intersection;
                }
            }

            // Clip to first intersection
            let end = road.geometry.end;
            road.geometry.end = new Point(firstIntersection[0], end.y, firstIntersection[1]);
            this.vertices.push(new Vertex(firstIntersection[0], end.y, firstIntersection[1]));
            road.metadata.severed = true
        }

        // if "two streets intersect" then "generate a crossing".
        // if "ends close to an existing crossing" then "extend street, to reach the crossing".
        // if "close to intersecting" then "extend street to form intersection".

        return {
            accepted: true,
            segment: road
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

            if (popAngle > popStraight) {
                console.log("Use angle:", randomContinuationAngle);
            }

            // Initialize population of the new road
            let popRoad = 0;

            // Continue straight or with angle
            if (popAngle > popStraight) {
                let r = SegmentFactory.createRoad(continueStraight, this.time + 2, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popStraight;
            } else {
                let r = SegmentFactory.createRoad(continueAngle, this.time + 2, config.ROADS.HIGHWAY);
                newBranches.push(r);
                popRoad = popAngle;
            }

            // Check if population high enough for branch
            if (popRoad > config.ROADS.HIGHWAY.BRANCH_POPULATION_THRESHOLD) {

                // Create left branch with some probability
                if (Math.random() > config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + 5, config.ROADS.URBAN);
                    newBranches.push(r)
                }

                // Create right branch with some probability
                if (Math.random() > config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(config.BRANCH_ANGLE_LIMIT);
                    let rightBranch = SegmentFactory.branchRight(segment, angle, config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(rightBranch, this.time + 5, config.ROADS.URBAN);
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