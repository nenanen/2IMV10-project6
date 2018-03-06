export const ROADS = {
    HIGHWAY: {
        LENGTH: 150,
        BRANCH_PROBABILITY: 0.05,
        BRANCH_POPULATION_THRESHOLD: 0.1,
        BRANCH_DELAY: 5,
        SEGMENT_WIDTH: 16,
        COLOR: 0xff0000
    },
    URBAN: {
        LENGTH: 100,
        BRANCH_PROBABILITY: 0.4,
        BRANCH_POPULATION_THRESHOLD: 0.1,
        BRANCH_DELAY: 1,
        SEGMENT_WIDTH: 3,
        COLOR: 0x0000ff
    },

    PROVINCIAL: 2,

};

export const BRANCH_ANGLE_LIMIT = 3;
export const FORWARD_ANGLE_LIMIT = 15;
export const QUADTREE_PARAMS = {x: -20000, y: -20000, width: 40000, height: 40000};
export const QUADTREE_MAX_OBJECTS = 10;
export const QUADTREE_MAX_LEVELS = 10;