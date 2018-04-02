import Algebra from "../road/Algebra";
import * as math from "mathjs";
import BuildingController from "./building";
import * as THREE from "three";
import Lot from "./Lot";
import Vertex from "../road/Vertex";

export default class Placer {

    constructor(roads, threejsWorld, heatmap, config, qTree) {
        this.config = config;
        this.roads = roads;
        this.controller = new BuildingController(threejsWorld);
        this.threejsWorld = threejsWorld;
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
        let success = 0;
        let tries = 0;
        let area = Lot.getRandomSize();
        let lot = Lot.getRandomLot(road, area);
        let collision = lot.collidesAny(this.qTree);

        let placed = false;
        while (tries < 3 && placed == false) {
            
            if (collision) {
                tries += 1;
                // let plane = lot.makePlane(0xff0000);
                // this.group.add(plane);
            } else {
                tries += 1;
                success += 1;
                let building = this.placeBuilding(lot);
                this.group.add(building);
                let plane = lot.makePlane();
                this.group.add(plane);
                placed = true;
            }
        }
    }

    placeBuilding(lot) {
        const location = lot.location;
        const population = this.heatmap.populationAt(location.center[0], location.center[1]);
        const randomness = Math.random();
        const gaussian = Algebra.gaussianRange(0, 1);
        const factor = Math.max(Math.sqrt(population) * (randomness + gaussian) / 2, 0.1);
        const height = Math.pow(factor * 20, 1.5) * 3;
        let building = this.controller.generate(lot.width, height, lot.length, location.center[0], 0, location.center[1]);//,this.config['BUILDING']['RULES']);

        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });
        
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3( location.center[0], -10, location.center[1] ),
            new THREE.Vector3( location.center[0], 40, location.center[1] ),
        );
        
        var line = new THREE.Line( geometry, material );
        this.threejsWorld.scene.add( line );
        //building.rotateY(lot.rotation.radians);

        //trying to change rotation point and then rotate around objects buildings its center
        var axis = new THREE.Vector3(0, 1, 0);
        var matrix = new THREE.Matrix4();
        matrix.makeRotationAxis( axis.normalize(), lot.rotation.radians); 
        building.rotation.setFromRotationMatrix( matrix );


        building.translateY(height / 2);
        return building

    }

}