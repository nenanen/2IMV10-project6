import Algebra from "../road/Algebra";
import * as math from "mathjs";
import BuildingController from "./building";
import * as THREE from "three";
import Lot from "./Lot";

export default class Placer {

    constructor(roads, threejsWorld, heatmap, config, qTree) {
        this.config = config;
        this.roads = roads;
        this.controller = new BuildingController(threejsWorld);
        this.heatmap = heatmap;
        this.group = new THREE.Object3D();
        this.qTree = qTree;
    }

    placeAllLots() {
        for (let road of this.roads) {
            this.placeLots(road)
        }

        return this.group;
    }

    placeLots(road) {
        let area = Lot.getRandomSize();
        let lot = Lot.getRandomLot(road, area);
        let plane = lot.makePlane();
        if (lot.collidesAny(this.qTree)) {
            plane = lot.makePlane(0xff0000);
        }
        this.group.add(plane);
    }

}