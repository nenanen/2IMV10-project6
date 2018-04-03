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
                            update={(value) => this.config.SNAP_DISTANCE = parseFloat(value)}/>
                    <span className="comment">Distance from current road's endpoint to other road's endpoint</span>

                    <Slider title={"Stretch distance"} id={"config" + ++i}
                            initial={this.config.STRETCH_DISTANCE} step="1" min={0} max={90}
                            update={(value) => this.config.STRETCH_DISTANCE = parseFloat(value)}/>
                    <span className="comment">Distance from current road's endpoint to other road's segment</span>

                    <Slider title={"Align distance"} id={"config" + ++i}
                            initial={this.config.ALIGN_DISTANCE} step="1" min={0} max={90}
                            update={(value) => this.config.ALIGN_DISTANCE = parseFloat(value)}/>
                    <span className="comment">Distance from other road's endpoint to current road's segment</span>

                    <h3>Angles</h3>
                    <hr/>
                    <Slider title={"Branch angle limit"} id={"config" + ++i}
                            initial={this.config.BRANCH_ANGLE_LIMIT} step="1" min={0} max={90}
                            update={(value) => this.config.BRANCH_ANGLE_LIMIT = parseFloat(value)}/>
                    <span className="comment">Maximum angle for branching roads. The random angle makes use of the normal distribution.</span>

                    <Slider title={"Forward angle limit"} id={"config" + ++i}
                            initial={this.config.FORWARD_ANGLE_LIMIT} step="1" min={0} max={90}
                            update={(value) => this.config.FORWARD_ANGLE_LIMIT = parseFloat(value)}/>
                    <span className="comment">Maximum angle for continuation segments. The random angle makes use of the normal distribution.</span>

                    <hr/>

                    <h3>Buildings</h3>
                    <hr/>
                    <Slider title={"Number of buildings per road."} id={"config" + ++i}
                            initial={this.config.NUMBER_BUILDINGS_PER_ROAD} step="1" min={0} max={10}
                            update={(value) => this.config.NUMBER_BUILDINGS_PER_ROAD = parseFloat(value)}/>
                    <span className="comment">The number of trials the algorithm has to randomly place a building that does not intersect anything.</span>
                    <br/><br/>

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