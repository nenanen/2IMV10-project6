import React from 'react';
import Slider from "./Slider";

export default class RoadUI extends React.Component {

    constructor(props) {
        super();
        this.road = props.road;
        this.update = this.update.bind(this);
    }

    // Updates entire ROAD setting
    update(key, value) {
        this.road[key] = value;
        this.props.update(this.road);
    }

    render() {
        let i = 0;

        return (
            <li className="accordion-item" data-accordion-item>
                <a href="#" className="accordion-title">{this.road.NAME}</a>
                <div className="accordion-content" data-tab-content>

                    <Slider title={"length"} id={this.road.KEY + ++i}
                            initial={this.road.LENGTH}
                            step="1" min={0} max={500}
                            update={(value) => this.update("LENGTH", value)}/>

                    <Slider title="forward delay" id={this.road.KEY + ++i}
                            initial={this.road.FORWARD_DELAY}
                            step="1" min={0} max={10}
                            update={(value) => this.update("FORWARD_DELAY", value)}/>

                    <Slider title="branch delay" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_DELAY}
                            step="1" min={0} max={10}
                            update={(value) => this.update("BRANCH_DELAY", value)}/>

                    <Slider title="branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY", value)}/>

                    <Slider title="branch population threshold" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_POPULATION_THRESHOLD}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_POPULATION_THRESHOLD", value)}/>

                    <Slider title="urban branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.URBAN}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.URBAN", value)}/>

                    <Slider title="provincial branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.PROVINCIAL}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.PROVINCIAL", value)}/>

                    <Slider title="highway branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.HIGHWAY}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.HIGHWAY", value)}/>
                </div>
            </li>
        );

    }
}