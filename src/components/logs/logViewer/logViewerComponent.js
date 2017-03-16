import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getLogEvents } from '../../../dataRequests/logRequests';
import './logViewerComponent.css';

class State {
    constructor(logCollection, logStreamName, nextToken) {
        if (!logCollection || logCollection.length === 0 || !logStreamName) {
            throw Error('Cannot create a new state with logCollection or logStreamName falsy');
        }
        
        this.logCollection = logCollection
        this.logStreamName = logStreamName;
        this.nextToken = nextToken || '';
    }
}

class LogViewer extends Component {
    constructor(props) {
        super(props);
        this.state = new State(
            [ props.logStream.events ],
            props.logStreamName,
            props.logStream.nextForwardToken
        );
        
        // bind functions
        this.mapLogCollectionToListBodyComponents = this.mapLogCollectionToListBodyComponents.bind(this);
        this.loadMoreButtonClickHandler = this.loadMoreButtonClickHandler.bind(this);
    }

    mapLogCollectionToListBodyComponents(events, i) {
        // todo - we should support the case where there is no events
        return (
            <ListBody data={events} key={`listbody-${i}`} />
        );
    }

    componentWillReceiveProps(nextProps) {
        // if it's the same log stream coming in don't re-render
        if (nextProps.logStreamName === this.state.logStreamName) {
            return;
        }

        // from here we presume a new log entry has been selected
        // we should re-initialise the state using the new props.
        this.setState(new State(
            [ nextProps.logStream.events ],
            nextProps.logStreamName,
            nextProps.logStream.nextForwardToken
        ));
    }

    loadMoreButtonClickHandler() {
        return getLogEvents(this.state.logStreamName)
            .then((nextResult) => {
                console.log('> existing state...');
                console.log(this.state);

                console.log('> next result...');
                console.log(nextResult);

                if (nextResult.nextForwardToken === this.state.nextToken) {
                    // the next token is the same as the one we already have
                    // this means there is currently no further events to show.
                    // todo - tell the user about this...
                    console.log('forward token is the same as current');
                    return;
                }
                if (nextResult.events.length === 0) {
                    // there are no new events to add.
                    console.log('next events is 0');
                    return;
                }

                // add the nextResult.events to the logCollection
                // update the nextToken
                // set the state
                this.state.logCollection.push(nextResult.events)
                const newState = new State(
                    this.state.logCollection,
                    this.state.logStreamName,
                    nextResult.nextForwardToken
                );
                this.setState(newState);
                console.log('new state...');
                console.log(this.state);
            });
    }

    renderEvents() {
        //const eventList = this.props.logStream.events.map(this.mapLogToEventListItem);
        const listBodies = this.state.logCollection.map(this.mapLogCollectionToListBodyComponents);
        return (
            <div className="log-viewer">
                <strong>{this.props.logStreamName || ''}</strong>
                <hr />
                {listBodies}
                {this.state.nextToken 
                    ? ( <LoadMoreButton onClick_promise={this.loadMoreButtonClickHandler} /> )
                    : null}
                
            </div>
        );
    }

    render() {
        return this.props.logStream ? this.renderEvents() : null;
    }
}


class ListBody extends Component {
    mapLogToListItem(log, i) {
        return (
            <li className="log-event-item" key={log.timestamp + i}>
                <em className="timestamp">{moment(log.timestamp).format()}</em> :: {log.message}
            </li>
        );
    }
    
    render() {
        const listItems = this.props.data.map(this.mapLogToListItem);
        return (
            <ul className="log-event-list-chunk">
                {listItems}
            </ul>
        );
    }
}


class LoadMoreButton extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            isLoading: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.loading = this.loading.bind(this);
    }

    loading(isLoading) {
        this.setState({
            isLoading: isLoading
        });
    }
    
    handleClick(e) {
        if (this.state.isLoading) {
            return;
        }
        
        const setLoadingFalse = () => { this.loading(false); };
        
        this.loading(true);
        this.props.onClick_promise()
            .then(setLoadingFalse)
            .catch(setLoadingFalse);
    }

    renderLoadingSpinner() {
        const style = {
            marginTop: '0.38em',
            borderColor:'white',
            borderRightColor:'#ff9800',
            borderBottomColor:'#ff9800'
        }
        return (
            <i className="spinner left" style={style}></i>
        );
    }
    
    render() {
        return (
            <button onClick={this.handleClick} className="load-more-button waves-effect waves-light btn">
                {this.state.isLoading ? this.renderLoadingSpinner() : null}
                load more
            </button>
        );
    }
}

LogViewer.propTypes = {
    logStream: PropTypes.shape({
        events: PropTypes.array,
        nextForwardToken: PropTypes.string,
        nextBackwardToken: PropTypes.string
    }).isRequired,
    logStreamName: PropTypes.string.isRequired
};

ListBody.propTypes = {
    data: PropTypes.array.isRequired
};

LoadMoreButton.propTypes = {
    onClick_promise: PropTypes.func.isRequired
};


export default LogViewer;