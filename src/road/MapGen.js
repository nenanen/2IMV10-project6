import PriorityQueue from "../util/priorityQueue"
import Point from "./Point";
import Heatmap from "./Heatmap";
import Util from "./Util";
import SegmentFactory from "./SegmentFactory";
import Segment from "./Segment";
import Vertex from "./Vertex";
import Quadtree from "../vendor/Quadtree";
import Algebra from "./Algebra";

export default class MapGen {
    constructor(config) {
        this.config = config;
        this.queue = new PriorityQueue();
        this.segmentList = [];
        this.heatmap = new Heatmap(config);
        this.vertices = [];
        this.time = 0;
        this.qTree = new Quadtree(config.QUADTREE_PARAMS, config.QUADTREE_MAX_OBJECTS, config.QUADTREE_MAX_LEVELS);
    }

    initialize() {
        let start = new Point(0, 1, -500);
        let end = new Point(0, 1, this.config.ROADS.HIGHWAY.LENGTH - 500);
        let segment = new Segment(start, end);
        let initial = SegmentFactory.createRoad(segment, 0, this.config.ROADS.HIGHWAY, this.config);
        this.queue.push(initial);
    }

    generate() {
        let t0 = performance.now();


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

        let t1 = performance.now();
        console.log("City generation " + (t1 - t0) + " milliseconds.")
    }

    localConstraints(road) {

        let matches = this.qTree.retrieve(road.limits());
        let vertex = null;
        let minDistance = Infinity;
        let priority = 0;

        // Loop over matches
        for (let match of matches) {

            let point = Util.doRoadsIntersect(road, match.o);

            if (point) {
                // Calculate distance to intersection
                let distance = Algebra.distance(road.geometry.start.toVector2D(), point);

                // Update priority, so other mechanisms don't take over.
                priority = 5;

                // Clip road to first intersection
                if (distance < minDistance) {
                    road.geometry.end = new Point(point[0], road.geometry.end.y, point[1]);
                    road.metadata.severed = true;
                    vertex = new Vertex(point[0], road.geometry.end.y, point[1], this.config.INTERSECT_COLOR);
                    minDistance = distance;
                }
            }

            // Align roads
            if (true) {
                // If this road passes close to the end point of another road

                // Project a point from the other road on this segment
                const point = Algebra.projectOnSegment(match.o.geometry.end.toVector2D(),
                    road.geometry.start.toVector2D(), road.geometry.end.toVector2D());

                // Calculate distance from other point to projected point
                const distance = Algebra.distance(match.o.geometry.end.toVector2D(), point);

                if (distance > 0 && distance < this.config.SNAP_DISTANCE) {
                    const newPoint = Point.copy(match.o.geometry.end);
                    road.geometry.end = newPoint;
                    road.metadata.severed = true;
                    vertex = new Vertex(newPoint.x, newPoint.y, newPoint.z, this.config.ALIGN_COLOR);
                    priority = 4;
                }

            }

            // Snap roads
            if (priority < 4 && Util.areRoadsInRange(road, match.o, this.config.SNAP_DISTANCE)){
                let e = match.o.geometry.end;

                road.geometry.end = new Point(e.x, e.y, e.z);
                road.metadata.severed = true;
                vertex = new Vertex(e.x, e.y, e.z, this.config.SNAP_COLOR);

                priority = 3;
            }

            // Stretch roads
            if (priority < 3) {
                const stretch = Util.distanceToRoad(road, match.o);

                if (stretch.distance < this.config.STRETCH_DISTANCE) {
                    road.geometry.end = new Point(stretch.point[0], road.geometry.end.y, stretch.point[1]);
                    road.metadata.severed = true;
                    vertex = new Vertex(stretch.point[0], road.geometry.end.y, stretch.point[1], this.config.STRETCH_COLOR);

                    priority = 2;
                }
            }
        }

        // Store vertex if there was an intersection
        if (vertex) {
            this.vertices.push(vertex);
        }

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
        let randomBranchAngle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
        let randomContinuationAngle = Util.randomAngle(this.config.FORWARD_ANGLE_LIMIT);

        // Initialize continuations on the previous segment
        let continueStraight = SegmentFactory.continue(segment, 0, roadSegment.metadata.type.LENGTH);
        let continueAngle = SegmentFactory.continue(segment, randomContinuationAngle, roadSegment.metadata.type.LENGTH);

        // Determine population on road if we continue straight
        let popStraight = this.heatmap.populationAtEnd(continueStraight);
        let popAngle = this.heatmap.populationAtEnd(continueAngle);

        // Handle highways
        if (roadSegment.metadata.type === this.config.ROADS.HIGHWAY) {

            // Initialize population of the new road
            let popRoad = 0;

            // Continue straight or with angle
            if (popStraight > popAngle) {
                let r = SegmentFactory.createRoad(continueStraight, this.time + 2, this.config.ROADS.HIGHWAY, this.config);
                newBranches.push(r);
                // popRoad = popStraight;
                popRoad = this.heatmap.populationAtEndTile(continueStraight);
            } else {
                let r = SegmentFactory.createRoad(continueAngle, this.time + 2, this.config.ROADS.HIGHWAY, this.config);
                newBranches.push(r);
                popRoad = this.heatmap.populationAtEndTile(continueAngle);
                // popRoad = popAngle;
            }

            // Check if population high enough for branch
            if (popRoad > this.config.ROADS.HIGHWAY.BRANCH_POPULATION_THRESHOLD) {

                // Create left branch with some probability
                if (Math.random() < this.config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let type = Math.random() > 0.85? this.config.ROADS.HIGHWAY : this.config.ROADS.URBAN;
                    let delay = type === this.config.ROADS.HIGHWAY ? 0 : type.BRANCH_DELAY;

                    let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, type.LENGTH, this.config);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + delay, type, this.config);
                    newBranches.push(r)
                }

                // Create right branch with some probability
                if (Math.random() < this.config.ROADS.HIGHWAY.BRANCH_PROBABILITY) {
                    let type = Math.random() > 0.85? this.config.ROADS.HIGHWAY : this.config.ROADS.URBAN;
                    let delay = type === this.config.ROADS.HIGHWAY ? 0 : type.BRANCH_DELAY;

                    let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                    let rightBranch = SegmentFactory.branchRight(segment, angle, type.LENGTH, this.config);
                    let r = SegmentFactory.createRoad(rightBranch, this.time + delay, type, this.config);
                    newBranches.push(r)
                }
            } else {
                roadSegment.metadata.color = this.config.ROADS.HIGHWAY.COLOR_LOW_POP;
            }
        }

        // Handle urban roads
        if (roadSegment.metadata.type === this.config.ROADS.URBAN) {
            if (popStraight > this.config.ROADS.URBAN.BRANCH_POPULATION_THRESHOLD) {

                // Left branch
                if (Math.random() < this.config.ROADS.URBAN.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchLeft(segment, angle, this.config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + this.config.ROADS.URBAN.BRANCH_DELAY, this.config.ROADS.URBAN, this.config);
                    newBranches.push(r)
                }

                // Right branch
                if (Math.random() < this.config.ROADS.URBAN.BRANCH_PROBABILITY) {
                    let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                    let leftBranch = SegmentFactory.branchRight(segment, angle, this.config.ROADS.URBAN.LENGTH);
                    let r = SegmentFactory.createRoad(leftBranch, this.time + this.config.ROADS.URBAN.BRANCH_DELAY, this.config.ROADS.URBAN, this.config);
                    newBranches.push(r)
                }
            }
        }


        return newBranches
    }

}