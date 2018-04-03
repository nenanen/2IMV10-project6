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
        let keys = key.split(".");

        if (keys.length === 2) {
            this.road[keys[0]][keys[1]] = value;
        } else {
            this.road[keys[0]] = value;
        }

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
                            update={(value) => this.update("LENGTH", parseFloat(value))}/>
                    <span className="comment">The default length of each road segment.</span><br/><br/>

                    <Slider title="forward delay" id={this.road.KEY + ++i}
                            initial={this.road.FORWARD_DELAY}
                            step="1" min={0} max={10}
                            update={(value) => this.update("FORWARD_DELAY", parseFloat(value))}/>
                    <span className="comment">The delay until the next road segment is inserted. Only used if this type of road is not branching-only.</span><br/><br/>

                    <Slider title="branch delay" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_DELAY}
                            step="1" min={0} max={10}
                            update={(value) => this.update("BRANCH_DELAY", parseFloat(value))}/>
                    <span className="comment">The delay until a road segment that branches off from ths road is inserted.
                    The delay makes sure that more important roads do not get obstructed.</span><br/><br/>

                    <Slider title="branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY", parseFloat(value))}/>
                    <span className="comment">The chance that a new road will branch off were possible.</span><br/><br/>

                    <Slider title="branch population threshold" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_POPULATION_THRESHOLD}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_POPULATION_THRESHOLD", parseFloat(value))}/>
                    <span className="comment">The minimum population required to generate new branches.</span>

                    <hr/>
                    <p><b>NOTE:</b> the three sliders below should add up to 1.</p>

                    <Slider title="urban branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.URBAN}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.URBAN", parseFloat(value))}/>
                    <span className="comment">Chance that an urban road will branch off from this road.</span><br/><br/>

                    <Slider title="provincial branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.PROVINCIAL}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.PROVINCIAL", parseFloat(value))}/>
                    <span className="comment">Chance that a provincial road will branch off from this road.</span><br/><br/>

                    <Slider title="highway branch probability" id={this.road.KEY + ++i}
                            initial={this.road.BRANCH_PROBABILITY_TYPE.HIGHWAY}
                            step="0.05" min={0} max={1}
                            update={(value) => this.update("BRANCH_PROBABILITY_TYPE.HIGHWAY", parseFloat(value))}/>
                    <span className="comment">Chance that a highway will branch off from this road.</span><br/>
                </div>
            </li>
        );

    }
}