import React, { Component } from 'react';
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
        this.state = { services: [] };
    }
    
    updateState(services) {
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
            <li>There are no services to show</li>
        )
    }

    renderTable() {
        const tableBody = this.state.services.map(buildListItem);
        return (
            <table className="service-overview-table striped responsive-table">
                <thead>
                    <th>Service Name</th>
                    <th>Desired</th>
                    <th>Running</th>
                    <th></th>
                </thead>
                <tbody>
                    {tableBody}
                </tbody>
            </table>
        );
    }
    
    render() {
        const content = this.state.services.length === 0
            ? this.renderNoServices()
            : this.renderTable();
        
        return (
            <section className="service-task-overview">
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