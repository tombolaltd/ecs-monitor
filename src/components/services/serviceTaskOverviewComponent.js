import React, { Component } from 'react';
import { servicesStream$ } from '../../dataStreams/serviceStreams';

function buildListItem(service) {
    return (
        <li className="entry" key={service.serviceArn}>
            {service.serviceName}: {service.runningCount} tasks (dc::{service.desiredCount})
        </li>
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
    
    render() {
        const body = this.state.services.length === 0
            ? this.renderNoServices()
            : this.state.services.map(buildListItem);
        return (
            <section className="service-task-overview">
                <div className="card-panel">
                    <strong className="card-header">Task overview</strong>
                    <div className="divider"></div>
                    <ul>
                        {body}
                    </ul>
                </div>
            </section>
        );
    }
}

export default ServiceTaskOverview;