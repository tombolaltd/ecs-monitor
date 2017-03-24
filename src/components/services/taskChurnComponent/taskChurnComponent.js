import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { loadingBar } from '../../loading';
import moment from 'moment';
import config from '../../../config';
import { servicesStream$ } from '../../../dataStreams/serviceStreams';
import './taskChurnComponent.css';


const tooltip = `
            Monitors for 'task churn' in each service. 
            A task churn is triggered when many 'task started' events are fired on a given service within a specified timeframe (${config.TASK_CHURN_DETECTION_TIME_THRESHOLD} minutes).
            This would usually lead to investigation - Why is ECS starting (and stopping?) tasks frantically?
        `;


class ChurnModel {
    constructor(serviceName, churnEvents) {
        this.serviceName = serviceName;
        this.churnEvents = churnEvents;
        this.isChurnDetected = churnEvents.length >= config.TASK_CHURN_DETECTION_BUFFER_COUNT;
    }
}

class TaskChurn extends Component {
    constructor(props) {
        super(props);
        this.initialRender = true;
        this.state = { churnEntries: [] };

        // bind methods
        this.mapChurnToDOM = this.mapChurnToDOM.bind(this);
    }

    scanServiceEventsForTaskChurn(services) {
        let comparisonDate = moment().subtract(config.TASK_CHURN_DETECTION_TIME_THRESHOLD, 'minutes');
        let churnModels = services.map(s => {
            const churnEvents = s.events.filter((e) => {
                // if the message includes HAS STARTED, AND the event is within the threshold
                return (e.message.indexOf('has started') !== -1) && (moment(e.createdAt) >= comparisonDate);
            });
            return new ChurnModel(s.serviceName, churnEvents);
        });
        return churnModels;
    }

    updateState(services) {
        this.initialRender = false;
        if (!services || services.length === 0) {
            return;
        }

        let churnModels = this.scanServiceEventsForTaskChurn(services);
        this.setState({ churnEntries: churnModels });
    }

    shouldUpdateComponent(nextProps, nextState) {
        return nextState.churnEntries.some(x => x.isChurnDetected);
    }

    componentWillUpdate(nextProps, nextState) {
        let shouldFireToast = false;
        for (var i=0; i < this.state.churnEntries.length; i++) {
            if (this.state.churnEntries[i].isChurnDetected === false && nextState.churnEntries[i].isChurnDetected === true) {
                shouldFireToast = true;
                break;
            } else {
                shouldFireToast = false;
            }
        }
        
        if (shouldFireToast && nextState.churnEntries.some(x => x.isChurnDetected)) {
            window.Materialize.toast("TASK CHURN DETECTED!", 20000);
        }
    }

    componentWillMount() {
        this.servicesStreamObserver = servicesStream$.subscribe(this.updateState.bind(this));
    }
    
    componentWillUnmount() {
        this.servicesStreamObserver.unsubscribe();
    }

    mapChurnToDOM(churnEntry, i) {
        if (churnEntry.isChurnDetected) {
            return (
                <div key={i} className="unhealthy churn-entry">
                    <dt>{churnEntry.serviceName}</dt>
                    <dd>
                        - <i className="tiny material-icons">report_problem</i> CHURN DETECTED
                        <span className="new red badge" data-badge-caption="new tasks">{churnEntry.churnEvents.length}</span>
                    </dd>
                </div>
            );
        } else {
            return (
                <div key={i} className="churn-entry">
                    <dt>{churnEntry.serviceName}</dt>
                    <dd>- <i className="tiny material-icons healthy">thumb_up</i> healthy</dd>
                </div>
            );
        }
    }

    renderNoEntries() {
        return (
            <p className="no-task-churn-text">
                <i className="tiny material-icons no-churns-icon">thumb_up</i>
                No task churn detected</p>
        );
    }

    renderList() {
        const churnEntries = this.state.churnEntries.map(this.mapChurnToDOM);
        return (
            <ReactCSSTransitionGroup
                    transitionName="component-fadein"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    transitionLeave={false}>
                <dl>
                    {churnEntries}
                </dl>
            </ReactCSSTransitionGroup>
        );
    }

    render() {
        let body;
        if (this.initialRender) {
            body = loadingBar();
        }
        else if (this.state.churnEntries.length === 0) {
            body = this.renderNoEntries();
        } else {
            body = this.renderList();
        }

        return (
            <section className="service-task-churn component-panel">
                <div className="card-panel">
                    <strong className="card-header">
                        Task Churn 
                        <i className="tiny material-icons tooltipped" 
                            data-position="top"
                            data-delay="20"
                            data-tooltip={tooltip}>info</i></strong>
                    <div className="divider"></div>
                    {body}
                </div>
            </section>
        );
    }
}

export default TaskChurn;