import React from 'react';

export default class Slider extends React.Component {

    static updateOutput(variable) {
        const query = `input[name='${variable}']`;
        const val = document.querySelector(query).value;
        for (let elem of document.querySelectorAll(`output[name='${variable}']`)) {
            elem.value = val;
        }
    }

    evaluateInput(evt) {
        eval(`${this.props.path} = ${evt.target.value}`)
    }

    render() {
        const get_name = (path) => path.replace(/\./g, "_");
        return (
            <div className="react-slider">
                <h5>{this.props.title}</h5>
                <div className="row">
                    <div className="small-9 columns">
                        <input name={this.props.path} type="range" min={this.props.min} max={this.props.max}
                               step={this.props.step} defaultValue={this.props.initial}
                               onInput={() => Slider.updateOutput(this.props.path)}
                               onChange={(evt) => this.evaluateInput(evt)}
                        />
                    </div>
                    <div className="small-3 columns">
                        <output name={this.props.path}>{this.props.initial}</output>
                    </div>
                </div>
            </div>
        );
    }
}