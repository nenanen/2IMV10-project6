import $ from "jquery";
import ReactDOM from "react-dom";
import RoadsUI from "./RoadsUI";
import React from "react";

export default class Menu {
    static toggle() {
        document.querySelector('#menu').classList.toggle('active');
        document.querySelector('#toggle').classList.toggle('active');
        Menu.readConfig();
    }

    static toggleVertices() {
        window.groups.vertices.visible = !window.groups.vertices.visible;
    }

    static toggleRoads() {
        let roadsVisible = !(window.groups.roads.visible || window.groups.roadLines.visible);
        let realRoads = typeof window.realRoads !== 'undefined'? window.realRoads : true;
        window.groups.roads.visible = roadsVisible && realRoads;
        window.groups.roadLines.visible = roadsVisible && !realRoads;
    }

    static toggleRoadStyle() {
        let roadsVisible = window.groups.roads.visible || window.groups.roadLines.visible;
        window.realRoads = typeof window.realRoads !== 'undefined'? !window.realRoads : false;
        window.groups.roads.visible = roadsVisible && window.realRoads;
        window.groups.roadLines.visible = roadsVisible && !window.realRoads;
    }

    static toggleBuildings() {
        let showBuildings = !window.groups.buildings.visible;
        window.groups.buildings.visible = showBuildings;
        window.groups.lots.visible = !showBuildings;
    }

    /**
     * Fill in input fields by evaluating their name.
     * The name should be something like ui.config.ROADS.HIGHWAY.LENGTH.
     */
    static readConfig() {
        ReactDOM.render(
            <RoadsUI config={window.ui.config} generate={() => window.ui.render()}/>,
            document.getElementById("config")
        );
        $(document).foundation();
    }
}