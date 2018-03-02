import PriorityQueue from "util/priorityQueue"

class Road {
    constructor() {
        this.queue = new PriorityQueue();
        this.segment_list = [];
    }

    generate() {
        while(!this.queue.empty()) {
            let segment = this.queue.pop();
            let accepted = this.localConstraints(segment);
            if (accepted) {
                this.segment_list.push(segment);
                let newSegments = this.globalGoals(segment);
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

        return segment
    }

    globalGoals(segment) {


        return []
    }

}