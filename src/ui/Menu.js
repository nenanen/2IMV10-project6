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
        window.groups.roads.visible = !window.groups.roads.visible;
    }

    static toggleBuildings() {
        window.groups.buildings.visible = !window.groups.buildings.visible;
    }

    /**
     * Fill in input fields by evaluating their name.
     * The name should be something like ui.config.ROADS.HIGHWAY.LENGTH.
     */
    static readConfig() {
        ReactDOM.render(
            <RoadsUI path={"window.ui.config"} config={window.ui.config} generate={() => window.ui.render()}/>,
            document.getElementById("config")
        );
        $(document).foundation();
    }
}