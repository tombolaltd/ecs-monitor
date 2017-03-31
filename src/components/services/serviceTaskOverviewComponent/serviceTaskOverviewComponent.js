import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import MetricStat from '../../metrics/metricStatComponent';
import { loadingBar } from '../../loading';
import { servicesStream$ } from '../../../dataStreams/serviceStreams';
import { metricStatStream$ } from '../../../dataStreams/metricStreams';
import { nameFromAwsArn } from '../../../utils/stringFormatting';
import './serviceTaskOverviewComponent.css';

function buildListItem(service) {
    const matchingCountIcon = service.runningCount === service.desiredCount
        ? 'thumb_up'
        : 'warning';
    const dimentions = [
        { Name: 'ClusterName', Value: nameFromAwsArn(service.clusterArn) },
        { Name: 'ServiceName', Value: service.serviceName },
    ];
    const cpuStream$ = metricStatStream$(dimentions, 'CPUUtilization', 5000);
    const memoryStream$ = metricStatStream$(dimentions, 'MemoryUtilization', 5000);

    return (    
        <tr className="service-overview-entry" key={service.serviceArn}>
            <td className="service-name">{service.serviceName}</td>
            <td className="desired-count count">{service.desiredCount}</td>
            <td className="running-count count">{service.runningCount}</td>
            <td><i className={`tiny material-icons ${matchingCountIcon}`}>{matchingCountIcon}</i></td>
            <td className="cpu">
                <MetricStat
                    _key={`servicestat-${service.serviceName}-cpu`}
                    stream={cpuStream$} />
            </td>
            <td className="memory">
                <MetricStat
                    _key={`servicestat-${service.serviceName}-memory`}
                    stream={memoryStream$} />
            </td>
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
                            <th>CPU</th>
                            <th>Mem (res)</th>
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