import React, { Component, PropTypes } from 'react';
import { Subject } from 'rxjs';
import { aggregatedEventStream$ } from '../../../dataStreams/serviceStreams';
import moment from 'moment';
import './aggregatedEventsComponent.css';

/* To add another amount (or edit current ones)
 * just modify this array.
 */
const COUNTS = [
    10,
    15,
    30,
    60,
    120
];
const DEFAULT_COUNT = COUNTS[0]; // 10 is the default

function buildListItem(event) {
    return (
        <li className="entry" key={event.id}>
            {moment(event.createdAt).fromNow()} - {event.message}
        </li>
    );
}

function buildCountOption(value, i) {
    const isDefault = value === DEFAULT_COUNT;
    return (
        <option defaultValue={isDefault} value={value} key={value + i}>{value}</option>
    );
}

class AggregatedServiceEvents extends Component {
    constructor(props) {
        super(props);
        this.state = { events: [] };

        this.updateState = this.updateState.bind(this);
        this.changeEventCount = this.changeEventCount.bind(this);
    }
    
    updateState(events) {
        if (!events || events.length === 0) {
            return;
        }

        this.setState({events: events});
    }

    changeEventCount(e) {
        this.countChange.next(e.target.value);
    }
    
    componentWillMount() {
        this.countChange = new Subject();
        this.eventStreamObserver = 
            this.countChange
            .combineLatest(aggregatedEventStream$)
            .map(([amount, arr]) => arr.slice(0, amount))
            .subscribe(this.updateState);
        
        // start by emitting the default count.
        this.countChange.next(DEFAULT_COUNT);
    }

    componentWillUnmount() {
        this.countChange.complete();
        this.eventStreamObserver.unsubscribe();
    }
    
    renderNoEvents() {
        return (
            <li>There are no events to show</li>
        );
    }

    render() {
        const body = this.state.events.length === 0
            ? this.renderNoEvents()
            : this.state.events.map(buildListItem);
        const now = moment().format('hh:mm:ss a');
        
        return (
            <section className="service-events">
                <div className="card-panel">
                    <div className="options-container">
                        <QuantitySelector onChange={this.changeEventCount} />
                    </div>
                    <strong className="card-header">Events | <small>now: {now}</small></strong>
                    <ul>
                        {body}
                    </ul>
                </div>
            </section>
        );
    }
}

class QuantitySelector extends Component {
    render() {
        const options = COUNTS.map(buildCountOption);
        return (
            // We need to use the 'browser-default' select as materialize doesn't fire the onChange with it's own selects.
            <select name="no-events" className="no-of-service-events-dropdown browser-default" onChange={this.props.onChange}>
                {options}
            </select>
        );
    }
}

QuantitySelector.propTypes = {
    onChange: PropTypes.func.isRequired
}

export default AggregatedServiceEvents;