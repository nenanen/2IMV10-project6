import React from 'react';
import RoadUI from "./RoadUI";
import Slider from "./Slider";

export default class RoadsUI extends React.Component {

    constructor(props) {
        super(props);
        this.config = this.props.config;
    }

    render() {
        let i = 0;
        return (
            <div key="config">
                <form id={"road-ui"}>
                    <h3>Roads</h3>
                    <hr/>
                    <ul className="accordion" data-accordion data-allow-all-closed="true">
                        {
                            Object.keys(this.config.ROADS).map((key) =>
                                <RoadUI key={key} road={this.config.ROADS[key]}
                                        update={(value) => this.config.ROADS[key] = value}/>
                            )
                        }
                    </ul>

                    <h3>Local constraints</h3>
                    <hr/>
                    <Slider title={"Snap distance"} id={"config" + ++i}
                            initial={this.config.SNAP_DISTANCE} step="1" min={0} max={90}
                            update={(value) => this.config.SNAP_DISTANCE = value}/>

                    <Slider title={"Stretch distance"} id={"config" + ++i}
                            initial={this.config.STRETCH_DISTANCE} step="1" min={0} max={90}
                            update={(value) => this.config.STRETCH_DISTANCE = value}/>

                    <Slider title={"Align distance"} id={"config" + ++i}
                            initial={this.config.ALIGN_DISTANCE} step="1" min={0} max={90}
                            update={(value) => this.config.ALIGN_DISTANCE = value}/>

                    <h3>Angles</h3>
                    <hr/>
                    <Slider title={"Branch angle limit"} id={"config" + ++i}
                            initial={this.config.BRANCH_ANGLE_LIMIT} step="1" min={0} max={90}
                            update={(value) => this.config.BRANCH_ANGLE_LIMIT = value}/>

                    <Slider title={"Forward angle limit"} id={"config" + ++i}
                            initial={this.config.FORWARD_ANGLE_LIMIT} step="1" min={0} max={90}
                            update={(value) => this.config.FORWARD_ANGLE_LIMIT = value}/>

                    <hr/>

                    <h3>Buildings</h3>
                    <hr/>
                    <textarea name={"Rules"} id={"config" + ++i} defaultValue={this.config.RULES}
                              onChange={(event) => this.config.RULES = event.currentTarget.value}/>
                </form>
                <button className="button primary large expanded" onClick={() => this.props.generate()}>
                    Generate city
                </button>
            </div>
        )
    }
}