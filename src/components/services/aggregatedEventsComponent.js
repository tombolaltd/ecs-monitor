import React, { Component } from 'react';
import { getAggregatedEventStream$ } from '../../dataStreams/serviceStreams';
import moment from 'moment';
import config from '../../config';

function buildListItem(event) {
    return (
        <li className="entry" key={event.id}>
            {moment(event.createdAt).fromNow()} - {event.message}
        </li>
    );
}

class AggregatedServiceEvents extends Component {
    constructor(props) {
        super(props);
        this.state = { events: [] };
    }
    
    updateState(events) {
        if (!events || events.length === 0) {
            return;
        }

        this.setState({events: events});
    }
    
    componentWillMount() {
        this.eventStreamObserver = getAggregatedEventStream$(config.AGGREGATED_SERVICE_EVENT_COUNT).subscribe(this.updateState.bind(this))
    }

    componentWillUnmount() {
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
                    <strong className="card-header">Events | <small>now: {now}</small></strong>
                    <div className="divider"></div>
                    <ul>
                        {body}
                    </ul>
                </div>
            </section>
        );
    }
}

export default AggregatedServiceEvents;