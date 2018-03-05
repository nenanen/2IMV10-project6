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
        BRANCH_DELAY: 0,
        SEGMENT_WIDTH: 3,
        COLOR: 0x0000ff
    },

    PROVINCIAL: 2,

};

export const BRANCH_ANGLE_LIMIT = 3;
export const FORWARD_ANGLE_LIMIT = 15;
// export const HIGHWAY_BRANCH_POPULATION_THRESHOLD = 0.1;
// export const DEFAULT_BRANCH_PROBABILITY = 0.4;
// export const HIGHWAY_BRANCH_PROBABILITY = 0.05;
// export const DEFAULT_SEGMENT_LENGTH = 100;
// export const HIGHWAY_SEGMENT_LENGTH = 150;
// export const DEFAULT_SEGMENT_WIDTH = 3;
// export const HIGHWAY_SEGMENT_WIDTH = 16;
// export const URBAN_BRANCH_POPULATION_THRESHOLD =  0.1;
// export const HIGHWAY_BRANCH_DELAY = 5;