import React, { Component } from 'react';
import LogViewer from '../logViewer/logViewerComponent';
import { getLogs, getLogEvents } from '../../../dataRequests/logRequests';
import { Event, progressBarEvent$ } from '../../../pubsub/eventStreams';
import './logsDashboardComponent.css';

class LogsDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            logStreamResponse: void 0,
            activeLogStreamName: ''
        };

        // bind functions
        this.updateLogsState = this.updateLogsState.bind(this);
        this.updateLogResponseState = this.updateLogResponseState.bind(this);
        this.handleGetRecentStreamsClick = this.handleGetRecentStreamsClick.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.renderLogEntry = this.renderLogEntry.bind(this);
        this.renderLogViewer = this.renderLogViewer.bind(this);
    }
    
    updateLogsState(logsResponse) {
        progressBarEvent$.next(new Event(this, 'done'));
        this.setState(
            Object.assign({}, this.state, { logs: logsResponse.logStreams })
        );
    }

    updateLogResponseState(logStreamResponse) {
        progressBarEvent$.next(new Event(this, 'done'));
        this.setState(
            Object.assign({}, this.state, { logStreamResponse: logStreamResponse })
        );
    }

    handleGetRecentStreamsClick() {
        progressBarEvent$.next(new Event(this, 'start'));
        getLogs().then(this.updateLogsState);
    }

    handleSearch(e) {
        e.preventDefault();
        
        const fieldValue = this.refs['logSearch'].value;
        if (!fieldValue) return;

        progressBarEvent$.next(new Event(this, 'start'));
        getLogs(this.refs['logSearch'].value).then(this.updateLogsState);
    }

    handleLogClick(log, e) {
        e.preventDefault();
        progressBarEvent$.next(new Event(this, 'start'));
        this.setState(
            Object.assign({}, this.state, { activeLogStreamName: log.logStreamName })
        );
        getLogEvents(log.logStreamName).then(this.updateLogResponseState);
    }

    renderLogEntry(log) {
        return (
            <li key={log.arn}>
                <a href="#!" className="log-stream-entry" onClick={this.handleLogClick.bind(this, log)}>{log.logStreamName}</a>
            </li>
        );
    }
    
    renderLogViewer() {
        return (
            <LogViewer 
                logStream={this.state.logStreamResponse}
                logStreamName={this.state.activeLogStreamName} />
        );
    }

    render() {
        const list = this.state.logs.map(this.renderLogEntry);
        return (
            <div className="logs-dashboard-container">
                <header>
                    <button onClick={this.handleGetRecentStreamsClick} className="waves-effect waves-light btn">
                        <i className="material-icons left">view_list</i>
                        Recent 50 streams
                        </button>
                    <form onSubmit={this.handleSearch}>
                        <div className="input-field">
                            <input id="logSearch" ref="logSearch" name="logSearch" type="text" className="log-search-input validate" />
                            <label htmlFor="logSearch">Search</label>
                        </div>
                    </form>
                </header>
                <div className="results row">
                    <ul className="col s3">
                        {list}
                    </ul>
                    <section className="log-viewer-container col s9">
                        {this.state.logStreamResponse ? this.renderLogViewer() : null}
                    </section>
                </div>
            </div>
        );
    }
}


export default LogsDashboard;