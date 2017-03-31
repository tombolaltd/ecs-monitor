import React, { Component } from 'react';
import { loadingBar } from '../../loading';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import MetricStat from '../../metrics/metricStatComponent';
import { servicesStream$ } from '../../../dataStreams/serviceStreams';
import { metricStatStream$ } from '../../../dataStreams/metricStreams';
import { nameFromAwsArn } from '../../../utils/stringFormatting';
import './serviceMetricsComponent.css';

function mapServiceToUseableObject(service) {
    return {
        serviceName: service.serviceName,
        serviceArn: service.serviceArn,
        clusterArn: service.clusterArn
    };
}

function serviceToMetrics(service, i) {
    const dimentions = [
        { Name: 'ClusterName', Value: nameFromAwsArn(service.clusterArn) },
        { Name: 'ServiceName', Value: service.serviceName },
    ];
    const cpuStream$ = metricStatStream$(dimentions, 'CPUUtilization', 5000);
    const memoryStream$ = metricStatStream$(dimentions, 'MemoryUtilization', 5000);
    
    return (
        <tr key={service.serviceName + i}>
            <td>{service.serviceName}</td>
            <td>
                <MetricStat
                    _key={`servicestat-${service.serviceName}-cpu`}
                    stream={cpuStream$} />
            </td>
            <td>
                <MetricStat
                    _key={`servicestat-${service.serviceName}-memory`}
                    stream={memoryStream$} />
            </td>
        </tr>
    )
}

class ServiceMetrics extends Component {
    constructor(props) {
        super(props);
        this.initialRender = true;
        this.state = {
            services: []
        };
    }

    componentWillMount() {
        this.servicesObserver = servicesStream$.subscribe(this.updateState.bind(this));
        // subscribe to all 
    }

    componentWillUnmount() {
        this.servicesObserver.unsubscribe();
    }

    updateState(newState) {
        this.initialRender = false;
        if (!newState || newState.length === 0) return;

        this.setState({
            services: newState.map(mapServiceToUseableObject)
        });
    }
    
    renderNoMetrics() {
        return (
            <p>No services</p>
        );
    }

    renderMetricsTable() {
        const tableBody = this.state.services.map(serviceToMetrics);
        return (
            <ReactCSSTransitionGroup
                    transitionName="component-fadein"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    transitionLeave={false}>
                <table className="slimmer-table deployments-table striped">
                    <thead>
                        <tr>
                            <th>Service Name</th>
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
            content = this.renderNoMetrics();
        } else {
            content = this.renderMetricsTable();
        }
        
        return (
            <section className="service-deployments component-panel">
                <div className="card-panel">
                    <strong className="card-header">Metrics</strong>
                    <div className="divider"></div>
                    {content}
                </div>
            </section>
        );
    }
}


export default ServiceMetrics;