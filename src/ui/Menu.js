import $ from "jquery";

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

    /**
     * Fill in input fields by evaluating their name.
     * The name should be something like ui.config.ROADS.HIGHWAY.LENGTH.
     */
    static readConfig() {
        for (let x of $("form input")) {
            console.log($(x).attr("name") + ":" + eval($(x).attr("name")));
            $(x).val(eval($(x).attr("name")));
        }

        $(".slider").foundation("_reflow")
    }

    /**
     * Update the config by serializing the form and evaluating the result.
     * If the input has for example name ui.config.ROADS.HIGHWAY.LENGTH and a value of 150, then we evaluate:
     *   "ui.config.ROADS.HIGHWAY.LENGTH = 150;"
     */
    static updateConfig() {
        const serialized = $("form").serialize().replace(/&/g, ";");
        console.log(serialized);
        eval(serialized)
    }
}