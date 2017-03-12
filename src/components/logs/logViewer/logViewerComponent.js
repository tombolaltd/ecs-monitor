import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import './logViewerComponent.css';

class LogViewer extends Component {
    constructor(props) {
        super(props);

        // bind functions
        this.mapLogToEventListItem = this.mapLogToEventListItem.bind(this);
    }

    mapLogToEventListItem(log, i) {
        return (
            <li className="log-event-item" key={log.timestamp + i}>
                {moment(log.timestamp).format()} :: {log.message}
            </li>
        );
    }

    renderEmpty() {
        return (
            <div></div>
        );
    }

    renderEvents() {
        const eventList = this.props.logStream.events.map(this.mapLogToEventListItem);
        return (
            <div className="log-viewer">
                <div><strong>{this.props.logStreamName || ''}</strong></div>
                <ul className="log-event-list">
                    {eventList}
                </ul>
                <a href="#!" className="load-more-button">load more</a>
            </div>
        );
    }

    render() {
        return this.props.logStream ? this.renderEvents() : this.renderEmpty();
    }
}


LogViewer.propTypes = {
    logStream: PropTypes.shape({
        events: PropTypes.array,
        nextForwardToken: PropTypes.string,
        nextBackwardToken: PropTypes.string
    })
};


export default LogViewer;