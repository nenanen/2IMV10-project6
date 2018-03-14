export const ROADS = {
    HIGHWAY: {
        LENGTH: 150,
        BRANCH_PROBABILITY: 0.05,
        BRANCH_POPULATION_THRESHOLD: 0.1,
        BRANCH_DELAY: 5,
        SEGMENT_WIDTH: 16,
        COLOR: 0xdfe6e9,
        COLOR_LOW_POP: 0x2d3436
    },
    URBAN: {
        LENGTH: 100,
        BRANCH_PROBABILITY: 0.4,
        BRANCH_POPULATION_THRESHOLD: 0.1,
        BRANCH_DELAY: 1,
        SEGMENT_WIDTH: 3,
        COLOR: 0xfdcb6e
    },

    PROVINCIAL: 2,

};

// Angles
export const BRANCH_ANGLE_LIMIT = 10;
export const FORWARD_ANGLE_LIMIT = 30;

// Quad Tree
export const QUADTREE_PARAMS = {x: -20000, y: -20000, width: 40000, height: 40000};
export const QUADTREE_MAX_OBJECTS = 10;
export const QUADTREE_MAX_LEVELS = 10;

// Heatmap
export const TILE_SIZE = 100;

// Vertices
export const INTERSECT_COLOR = 0xd63031;
export const SNAP_COLOR = 0x0984e3;
export const STRETCH_COLOR = 0x00b894;
