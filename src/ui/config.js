import * as THREE from "three";
let loader = new THREE.TextureLoader();
loader.crossOrigin = "";

let config = {

    // Road settings
    ROADS: {
        HIGHWAY: {
            NAME: "HIGHWAY",
            LENGTH: 150,
            BRANCHING_ONLY: false,
            FORWARD_DELAY: 2,
            BRANCH_PROBABILITY: 0.1,
            BRANCH_PROBABILITY_TYPE: {
                URBAN: 0,
                PROVINCIAL: 0.99,
                HIGHWAY: 0.01
            },
            BRANCH_POPULATION_THRESHOLD: 0.1,
            BRANCH_DELAY: 5,
            SEGMENT_WIDTH: 32,
            COLOR: 0xdfe6e9,
            TEXTURE: loader.load("static/textures/highway.svg"),
            COLOR_LOW_POP: 0x2d3436
        },
        PROVINCIAL: {
            NAME: "PROVINCIAL",
            LENGTH: 100,
            BRANCHING_ONLY: false,
            FORWARD_DELAY: 2,
            BRANCH_PROBABILITY: 0.2,
            BRANCH_PROBABILITY_TYPE: {
                URBAN: 0.8,
                PROVINCIAL: 0.2,
                HIGHWAY: 0
            },
            BRANCH_POPULATION_THRESHOLD: 0.1,
            BRANCH_DELAY: 5,
            SEGMENT_WIDTH: 16,
            TEXTURE: loader.load("static/textures/road.svg"),
            COLOR: 0xfdcb6e
        },

        URBAN: {
            NAME: "URBAN",
            LENGTH: 100,
            BRANCHING_ONLY: true,
            FORWARD_DELAY: null,
            BRANCH_PROBABILITY: 0.8,
            BRANCH_PROBABILITY_TYPE: {
                URBAN: 1,
                PROVINCIAL: 0,
                HIGHWAY: 0
            },
            BRANCH_POPULATION_THRESHOLD: 0.1,
            BRANCH_DELAY: 1,
            SEGMENT_WIDTH: 8,
            TEXTURE: loader.load("static/textures/urban-road.svg"),
            COLOR: 0xfdcb6e
        },

    },

    // Angles
    BRANCH_ANGLE_LIMIT: 10,
    FORWARD_ANGLE_LIMIT: 30,

    // Quadtree
    QUADTREE_PARAMS: {x: -20000, y: -20000, width: 40000, height: 40000},
    QUADTREE_MAX_OBJECTS: 20,
    QUADTREE_MAX_LEVELS: 10,

    // Heatmap
    TILE_SIZE: 100,
    TERRAIN_SIZE: 2000,   // The size of the terrain that is generated when the camera moves out
    TERRAIN_OFFSET: 1000, // Redraw terrain if we are this much away from the border

    // Vertices
    INTERSECT_COLOR: 0xd63031,
    SNAP_COLOR: 0x0984e3,
    STRETCH_COLOR: 0x00b894,
    ALIGN_COLOR: 0xdfe6e9,

    // Local constraints
    SNAP_DISTANCE: 25,
    STRETCH_DISTANCE: 35,


};

export default config;