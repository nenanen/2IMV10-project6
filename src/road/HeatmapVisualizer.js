import * as THREE from "three";
import Heatmap from "./Heatmap";
import Algebra from "./Algebra";

export default class HeatmapVisualizer {
    /**
     *
     * @param heatmap - Heatmap object to visualize
     * @param threejsWorld - Three.JS World object
     * @param config - The configuration array
     */
    constructor(heatmap, threejsWorld, config) {
        this.heatmap = heatmap;
        this.planes = [];
        this.world = threejsWorld;
        this.lastRedrawCenter = null;
        this.config = config;
    }

    drawHeatmap() {

        // Remove old planes
        for(let plane of this.planes) {
            this.world.scene.remove(plane);
        }

        // Calculate new planes
        const x = this.world.camera.position.x;
        const z = this.world.camera.position.z;
        const size = this.config.TERRAIN_SIZE;
        this.planes = this.visualize(x - size, x + size, z - size, z + size);

        // Insert new planes
        for(let plane of this.planes) {
            this.world.scene.add(plane);
        }

        // Update last redraw center
        this.lastRedrawCenter = [x, z];
    }

    updateHeatmap() {

        // Determine if we are far enough from the center to generate a new part
        if (Algebra.distance([this.world.camera.position.x, this.world.camera.position.z], this.lastRedrawCenter) >
            this.config.TERRAIN_SIZE - this.config.TERRAIN_OFFSET) {

            // Redraw the heatmap
            this.drawHeatmap();
        }
    }


    visualize(xMin, xMax, yMin, yMax) {

        // Get the tile size
        const tileSize = this.config.TILE_SIZE;

        // Snap coordinates to grid
        xMin = Heatmap.snapToGrid(xMin, tileSize);
        xMax = Heatmap.snapToGrid(xMax, tileSize);
        yMin = Heatmap.snapToGrid(yMin, tileSize);
        yMax = Heatmap.snapToGrid(yMax, tileSize);

        let planes = [];

        for (let x = xMin; x <= xMax; x += tileSize) {
            for (let y = yMin; y <= yMax; y += tileSize) {
                const population = this.heatmap.populationAtTile(x, y, tileSize);

                const dense = population > this.config.ROADS.HIGHWAY.BRANCH_POPULATION_THRESHOLD;
                const lightness = Math.trunc(population * 100);
                const color = dense ? `hsl(0, 0%, ${lightness}%)` : `hsl(168, 100%, ${lightness}%)`;
                const tColor = new THREE.Color(color);
                const geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize);
                const material = new THREE.MeshBasicMaterial({color: tColor, side: THREE.DoubleSide});
                const plane = new THREE.Mesh(geometry, material);

                plane.rotateX(-0.5 * Math.PI);

                plane.position.setX(x);
                plane.position.setY(0);
                plane.position.setZ(y);
                planes.push(plane)
            }
        }
        console.log(`Visualizing ${planes.length} planes`);
        return planes
    }
}