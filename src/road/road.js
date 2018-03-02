import {PriorityQueue} from "../util/priorityQueue"
import * as THREE from "three"
import {RoadSegment} from "./roadSegment"

export class Road {
    constructor() {
        this.queue = new PriorityQueue();
        this.segmentList = [];
    }

    initialize() {
        let material = new THREE.LineBasicMaterial({
	        color: 0x0000ff
        });

        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3( -10, 0, 0 ),
            new THREE.Vector3( 0, 10, 0 ),
            new THREE.Vector3( 10, 0, 0 )
        );

        geometry = new THREE.Line( geometry, material );
        let initial = new RoadSegment(0, geometry, {});
        this.segmentList.push(initial);
    }

    generate() {
        while(!this.queue.empty()) {
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

    localConstraints(segment) {
        // if "two streets intersect" then "generate a crossing".
        // if "ends close to an existing crossing" then "extend street, to reach the crossing".
        // if "close to intersecting" then "extend street to form intersection".

        return {
            accepted: true,
            segment: segment
        }
    }

    globalGoals(segment) {


        return []
    }

}