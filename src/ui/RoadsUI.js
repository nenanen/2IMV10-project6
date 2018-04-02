import React from 'react';
import RoadUI from "./RoadUI";
import Slider from "./Slider";

export default class RoadsUI extends React.Component {

    render() {
        this.config = this.props.config;

        let i = 0;
        const get_path = (property) => this.props.path + "." + property;
        return (
            <div key="config">
                <form id={"road-ui"}>
                    <h3>Roads</h3>
                    <hr/>
                    <ul className="accordion" data-accordion data-allow-all-closed="true">
                        {Object.keys(this.config.ROADS).map((key) => <RoadUI key={key} settings={this.config.ROADS[key]} path={get_path(`ROADS.${key}`)}/>)}
                    </ul>

                    <h3>Local constraints</h3>
                    <hr/>
                    <Slider title={"Snap distance"} id={"config" + ++i} initial={this.config.SNAP_DISTANCE} step="1" min={0} max={90}
                        path={get_path("SNAP_DISTANCE")}/>

                    <Slider title={"Stretch distance"} id={"config" + ++i} initial={this.config.STRETCH_DISTANCE} step="1" min={0} max={90}
                        path={get_path("STRETCH_DISTANCE")}/>

                    <Slider title={"Align distance"} id={"config" + ++i} initial={this.config.ALIGN_DISTANCE} step="1" min={0} max={90}
                        path={get_path("ALIGN_DISTANCE")}/>

                    <h3>Angles</h3>
                    <hr/>
                    <Slider title={"Branch angle limit"} id={"config" + ++i} initial={this.config.BRANCH_ANGLE_LIMIT} step="1" min={0} max={90}
                        path={get_path("BRANCH_ANGLE_LIMIT")} />

                    <Slider title={"Forward angle limit"} id={"config" + ++i} initial={this.config.FORWARD_ANGLE_LIMIT} step="1" min={0} max={90}
                        path={get_path("FORWARD_ANGLE_LIMIT")} />

                    <hr/>

                    <h3>Buildings</h3>
                    <hr/>
                    <textarea title={"Rules"} name="comment">
                    Enter text here...
                    </textarea>
                </form>
                <button className="button primary large expanded" onClick={() => this.props.generate()}>Generate city</button>
            </div>
        )
    }
}