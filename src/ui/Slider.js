import React from 'react';

export default class Slider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.initial
        };
        this.update = this.update.bind(this);
    }

    // Updates output and calls update function with new input value
    update(event) {
        this.setState({value: event.target.value});
        this.props.update(event.target.value);
    }

    render() {
        return (
            <div className="react-slider">
                <h5>{this.props.title}</h5>
                <div className="row">
                    <div className="small-9 columns">
                        <input name={this.props.path} type="range" min={this.props.min} max={this.props.max}
                               step={this.props.step} value={this.state.value}
                               onChange={this.update}
                        />
                    </div>
                    <div className="small-3 columns">
                        <output>{this.state.value}</output>
                    </div>
                </div>
            </div>
        );
    }
}