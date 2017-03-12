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
        this.handleGetLogsClick = this.handleGetLogsClick.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.renderLogEntry = this.renderLogEntry.bind(this);
    }
    
    updateLogsState(logsResponse) {
        progressBarEvent$.next(new Event(this, 'done'));
        this.setState({
            logs: logsResponse.logStreams,
            logStreamResponse: this.state.logStreamResponse,
            activeLogStreamName:this.state.activeLogStreamName
        });
    }

    updateLogResponseState(logStreamResponse) {
        progressBarEvent$.next(new Event(this, 'done'));
        this.setState({
            logs: this.state.logs,
            logStreamResponse: logStreamResponse,
            activeLogStreamName: this.state.activeLogStreamName
        });
    }

    handleGetLogsClick() {
        getLogs().then(this.updateLogsState);
    }

    handleSearch(e) {
        e.preventDefault();
        progressBarEvent$.next(new Event(this, 'start'));
        getLogs(this.refs['logSearch'].value).then(this.updateLogsState);
    }

    handleLogClick(log, e) {
        e.preventDefault();
        progressBarEvent$.next(new Event(this, 'start'));
        this.setState({
            logs: this.state.logs,
            logStreamResponse: this.state.logStreamResponse,
            activeLogStreamName: log.logStreamName
        })
        getLogEvents(log.logStreamName).then(this.updateLogResponseState);
    }

    renderLogEntry(log) {
        return (
            <li key={log.arn}>
                <a href="#!" className="log-stream-entry" onClick={this.handleLogClick.bind(this, log)}>{log.logStreamName}</a>
            </li>
        );
    }
    
    render() {
        const list = this.state.logs.map(this.renderLogEntry);
        return (
            <div className="logs-dashboard-container">
                <header>
                    <button onClick={this.handleGetLogsClick} className="waves-effect waves-light btn">Recent 50 streams</button>
                    <form onSubmit={this.handleSearch}>
                        <div className="input-field">
                            <input id="logSearch" ref="logSearch" name="logSearch" type="text" className="log-search-input" />
                            <label htmlFor="logSearch">Search</label>
                        </div>
                    </form>
                </header>
                <div className="results">
                    <ul>
                        {list}
                    </ul>
                    <section className="log-viewer-container">
                        <LogViewer logStream={this.state.logStreamResponse} logStreamName={this.state.activeLogStreamName} />
                    </section>
                </div>
            </div>
        );
    }
}


export default LogsDashboard;