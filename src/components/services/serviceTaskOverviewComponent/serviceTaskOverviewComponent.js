import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { loadingBar } from '../../loading';
import { servicesStream$ } from '../../../dataStreams/serviceStreams';
import './serviceTaskOverviewComponent.css';

function buildListItem(service) {
    const matchingCountIcon = service.runningCount === service.desiredCount
        ? 'thumb_up'
        : 'warning';
    return (    
        <tr className="service-overview-entry" key={service.serviceArn}>
            <td className="service-name">{service.serviceName}</td>
            <td className="desired-count count">{service.desiredCount}</td>
            <td className="running-count count">{service.runningCount}</td>
            <td><i className={`tiny material-icons ${matchingCountIcon}`}>{matchingCountIcon}</i></td>
        </tr>
    );
}

class ServiceTaskOverview extends Component {
    constructor(props) {
        super(props);
        this.initialRender = true;
        this.state = { services: [] };
    }
    
    updateState(services) {
        this.initialRender = false;
        if (!services || services.length === 0) {
            return;
        }

        this.setState({services: services});
    }
    
    componentWillMount() {
        this.servicesStreamObserver = servicesStream$.subscribe(this.updateState.bind(this));
    }

    componentWillUnmount() {
        this.servicesStreamObserver.unsubscribe();
    }

    renderNoServices() {
        return (
            <div>
                <p>There are no services.</p>
            </div>
        );
    }

    renderTable() {
        const tableBody = this.state.services.map(buildListItem);
        return (
            <ReactCSSTransitionGroup
                        transitionName="component-fadein"
                        transitionAppear={true}
                        transitionAppearTimeout={500}
                        transitionEnter={false}
                        transitionLeave={false}>
                <table className="slimmer-table service-overview-table striped" key="service-overview-table">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Desired</th>
                            <th>Running</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableBody}
                    </tbody>
                </table>
            </ReactCSSTransitionGroup>
        );
    }
    
    render() {
        let content;
        if (this.initialRender) {
            content = loadingBar();
        } else if (this.state.services.length === 0) {
            content = this.renderNoServices();
        } else {
            content = this.renderTable();
        }
        
        return (
            <section className="service-task-overview component-panel">
                <div className="card-panel">
                    <strong className="card-header">Task overview</strong>
                    <div className="divider"></div>
                    {content}
                </div>
            </section>
        );
    }
}

export default ServiceTaskOverview;