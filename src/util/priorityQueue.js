import * as _ from "lodash"

export default class PriorityQueue {
    constructor() {
        this.list = []
    }

    empty() {
        return this.length() === 0;
    }

    put(priority, item) {
        const newPair = {
            item: item,
            priority: priority
        };

        const index = _.findIndex(this.list, (pair) => pair.priority > newPair.priority)

        if (index === -1) {
            this.list.push(newPair)
        } else {
            this.list.splice(index, 0, newPair)
        }
    }

    get() {
        return this.list.shift().item
    }

    length() {
        return this.list.length
    }
}