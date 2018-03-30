export default class Angle {
    constructor(angle, degrees=true) {
        this.degrees = degrees ? angle : angle / Math.PI * 180;
        this.radians = degrees ? angle / 180 * Math.PI : angle;
    }
}