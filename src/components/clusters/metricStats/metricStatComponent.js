import React, { Component, PropTypes } from 'react';
import CountUp from 'countup.js';
import { Observable } from 'rxjs';
import './metricStatComponent.css';

// value in percent
const LOWER_VALUE_LIMIT = 30;
const UPPER_VALUE_LIMIT = 80;

function statusClassName(value) {
    if (value >= UPPER_VALUE_LIMIT) {
        return 'danger';
    } else if (value <= LOWER_VALUE_LIMIT) {
        return 'optimal';
    }
    return 'centric';
}


class MetricStat extends Component {
    constructor(props) {
        super(props);
        this.elementId = `${this.props._key}-${this.props.title}-metric`;
        this.state = {
            value: 0
        };
    }

    updateValue(value) {
        if(!value) {
            return;
        }

        const actualValue = value.Maximum;
        if (isNaN(actualValue) ||
            actualValue === this.state.value) {
            // no changes, just return
            return;
        }

        this.setState({
            value: actualValue
        });
        this.countUp.update(actualValue);

        if (this.props.alertPredicate(actualValue) &&
            typeof this.props.alertHandler === 'function') {
                this.props.alertHandler(actualValue);
        }
    }

    componentWillUnmount() {
        this.stream.unsubscribe();
    }

    componentDidMount() {
        const countUpOptions = {
          useEasing : true, 
          useGrouping : true, 
          separator : ',', 
          decimal : '.', 
          prefix : '', 
          suffix : '%' 
        };
        this.countUp = new CountUp(this.elementId, 0, 0, 2, 3, countUpOptions);
        this.countUp.start();
        this.stream = this.props.stream.subscribe(this.updateValue.bind(this));
    }
    
    render() {
        const numberClassName = 'number ' + statusClassName(this.state.value);

        return (
            <div className="metricstat">
                <small className="title">{this.props.title}</small>
                <strong className={numberClassName} id={this.elementId}></strong>
            </div>
        );
    }
}

MetricStat.propTypes = {
    _key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    stream: PropTypes.instanceOf(Observable).isRequired,
    alertPredicate: PropTypes.func,
    alertHandler: PropTypes.func
}

export default MetricStat;