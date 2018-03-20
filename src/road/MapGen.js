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
        let vertex = null;
        let minDistance = Infinity;
        let priority = 0;

        // Loop over matches
        for (let match of matches) {
            let m = match.o;

            // Quick filter to remove roads that are not in range.
            if (Algebra.distance(road.geometry.start.toVector2D(), m.geometry.start.toVector2D())
                >= road.metadata.type.LENGTH + m.metadata.type.LENGTH) {
                continue;
            }

            let point = Util.doRoadsIntersect(road, m);

            if (point) {
                // Calculate distance to intersection
                let distance = Algebra.distance(road.geometry.start.toVector2D(), point);

                // Update priority, so other mechanisms don't take over.
                priority = 5;

                // Clip road to first intersection
                if (distance < minDistance) {
                    road.geometry.end = new Point(point[0], road.geometry.end.y, point[1]);
                    road.metadata.severed = true;
                    vertex = new Vertex(point[0], road.geometry.end.y, point[1], this.config.INTERSECT_COLOR, road.geometry.direction());
                    minDistance = distance;
                }
            }

            // Align roads
            if (priority < 5) {
                const stretch = Util.distanceToRoad(m, road);
                if (stretch.distance > 0 && stretch.distance < this.config.SNAP_DISTANCE) {
                    const point = m.geometry.end;
                    road.geometry.end = new Point(point.x, point.y, point.z);
                    road.metadata.severed = true;
                    vertex = new Vertex(point.x, point.y, point.z, this.config.ALIGN_COLOR, road.geometry.direction());
                    priority = 4;
                }
            }

            // Snap roads
            if (priority < 4 && Util.areRoadsInRange(road, m, this.config.SNAP_DISTANCE)){
                let e = m.geometry.end;

                road.geometry.end = new Point(e.x, e.y, e.z);
                road.metadata.severed = true;
                vertex = new Vertex(e.x, e.y, e.z, this.config.SNAP_COLOR, road.geometry.direction());

                priority = 3;
            }

            // Stretch roads
            if (priority < 3) {
                const stretch = Util.distanceToRoad(road, m);

                if (stretch.distance > 0 && stretch.distance < this.config.STRETCH_DISTANCE) {
                    road.geometry.end = new Point(stretch.point[0], road.geometry.end.y, stretch.point[1]);
                    road.metadata.severed = true;
                    vertex = new Vertex(stretch.point[0], road.geometry.end.y, stretch.point[1], this.config.STRETCH_COLOR, road.geometry.direction());

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

        // Initialize branches
        let newBranches = [];

        // If segment is severed, we return empty list of new branches
        if (roadSegment.metadata.severed) {
            return newBranches
        }

        // Get segment and data
        let segment = roadSegment.geometry;
        let roadConfig = roadSegment.metadata.type;

        // Handle roads that are going forward
        if (!roadConfig.BRANCHING_ONLY) {
            let route = MapGen.determineRoute(roadSegment, this.heatmap, this.config);
            let r = SegmentFactory.createRoad(route.road, this.time + roadConfig.FORWARD_DELAY, roadConfig, this.config);
            newBranches.push(r);
        }

        // Handle branching if population is high enough
        if (this.heatmap.populationOnRoad(roadSegment.geometry) > roadConfig.BRANCH_POPULATION_THRESHOLD) {
            const branchLeft = Math.random() > roadConfig.BRANCH_PROBABILITY;
            const branchRight = Math.random() > roadConfig.BRANCH_PROBABILITY;

            if (branchLeft) {
                let type = this.config.ROADS[Algebra.randomWeightedKeyValue(roadConfig.BRANCH_PROBABILITY_TYPE)];
                console.log(type.NAME);
                let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                let branch = SegmentFactory.branchLeft(segment, angle, type.LENGTH);
                let r = SegmentFactory.createRoad(branch, this.time + roadConfig.BRANCH_DELAY, type, this.config);
                newBranches.push(r)
            }

            if (branchRight) {
                let type = this.config.ROADS[Algebra.randomWeightedKeyValue(roadConfig.BRANCH_PROBABILITY_TYPE)];
                console.log(type.NAME);
                let angle = Util.randomAngle(this.config.BRANCH_ANGLE_LIMIT);
                let branch = SegmentFactory.branchRight(segment, angle, type.LENGTH);
                let r = SegmentFactory.createRoad(branch, this.time + roadConfig.BRANCH_DELAY, type, this.config);
                newBranches.push(r)
            }
        }
        return newBranches
    }

    static determineRoute(road, heatmap, config) {

        let segment = road.geometry;

        // Generate random continuation angle
        let randomContinuationAngle = Util.randomAngle(config.FORWARD_ANGLE_LIMIT);

        // Initialize continuations on the previous segment
        let continueStraight = SegmentFactory.continue(segment, 0, road.metadata.type.LENGTH);
        let continueAngle = SegmentFactory.continue(segment, randomContinuationAngle, road.metadata.type.LENGTH);

        // Determine population on road if we continue straight
        let popStraight = heatmap.populationAtEnd(continueStraight);
        let popAngle = heatmap.populationAtEnd(continueAngle);

        // Make a list of candidate roads and their population densities
        let segments = [continueStraight, continueAngle];
        let densities = [popStraight, popAngle];

        // Get road with highest density
        const i = Algebra.argMax(densities);

        return {
            road: segments[i],
            population: densities[i]
        }
    }

}