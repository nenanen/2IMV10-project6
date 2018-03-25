import React from 'react';
import Slider from "./Slider";

export default class RoadUI extends React.Component {

    render() {
        let s = this.props.settings;
        const get_path = (property) => this.props.path + "." + property;
        let i = 0;

        return (
            <li className="accordion-item" data-accordion-item>
                <a href="#" className="accordion-title">{s.NAME}</a>
                <div className="accordion-content" data-tab-content>

                    <Slider title="length" id={s.KEY + ++i} initial={s.LENGTH} step="1" min={0} max={500}
                            path={get_path("LENGTH")}/>

                    <Slider title="forward delay" id={s.KEY + ++i} initial={s.FORWARD_DELAY} step="1"
                            min={0} max={10} path={get_path("FORWARD_DELAY")}/>

                    <Slider title="branch delay" id={s.KEY + ++i} initial={s.BRANCH_DELAY} step="1"
                            min={0} max={10} path={get_path("BRANCH_DELAY")}/>

                    <Slider title="branch probability" id={s.KEY + ++i} initial={s.BRANCH_PROBABILITY} step="0.05"
                            min={0} max={1} path={get_path("BRANCH_PROBABILITY")}/>

                    <Slider title="branch population threshold" id={s.KEY + ++i} initial={s.BRANCH_POPULATION_THRESHOLD}
                            step="0.05" min={0} max={1} path={get_path("BRANCH_POPULATION_THRESHOLD")}/>

                    <Slider title="urban branch probability" id={s.KEY + ++i} initial={s.BRANCH_PROBABILITY_TYPE.URBAN}
                            step="0.05" min={0} max={1} path={get_path("BRANCH_PROBABILITY_TYPE.URBAN")}/>

                    <Slider title="provincial branch probability" id={s.KEY + ++i} initial={s.BRANCH_PROBABILITY_TYPE.PROVINCIAL}
                            step="0.05" min={0} max={1} path={get_path("BRANCH_PROBABILITY_TYPE.PROVINCIAL")}/>

                    <Slider title="highway branch probability" id={s.KEY + ++i} initial={s.BRANCH_PROBABILITY_TYPE.HIGHWAY}
                            step="0.05" min={0} max={1} path={get_path("BRANCH_PROBABILITY_TYPE.HIGHWAY")}/>
                </div>
            </li>
        );

    }
}