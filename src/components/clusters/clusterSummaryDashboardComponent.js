import React, { Component } from 'react';
import PageDescription from '../pageDescription/pageDescriptionComponent';
import ClusterSummary from './summary/clusterSummaryComponent';
import Graph from './graph/graphComponent';
import MetricStatGroup from './metricStats/metricStatsGroupComponent';
import { clusterStream$ } from '../../dataStreams/clusterStreams';
import { metricsStream$ } from '../../dataStreams/metricStreams';
import moment from 'moment';

function stamp() {
    return moment().format('dddd Do MMMM YYYY, h:mm:ss a');
}

function mapToClusterName(cluster) {
    return cluster.clusterName;
}

class ClusterDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            clusters: [],
            clusterCount: 0,
            lastUpdateStamp: stamp(),
            memoryDatapoints: [],
            cpuDatapoints: []
        };
    }
    
    updateClusterState(clusters) {
        if (!clusters || clusters.length === 0) {
            return;
        }
        this.setState({
            clusters: clusters,
            clusterCount: clusters.length,
            lastUpdateStamp: stamp(),
            memoryDatapoints: this.state.memoryDatapoints,
            cpuDatapoints: this.state.cpuDatapoints
        });
    }

    updateMemoryDatapointsState(memoryDatapoints)
    {
        this.setState(
            Object.assign({}, this.state, {memoryDatapoints: memoryDatapoints})
         )
    }

    updateCpuDatapointsState(cpuDatapoints)
    {
        this.setState(
            Object.assign({}, this.state, {cpuDatapoints: cpuDatapoints})
         )
    }

    componentWillMount() {
        this.clusterStreamObserver = clusterStream$.subscribe(this.updateClusterState.bind(this));
        this.metricsMemoryStreamObserver = metricsStream$("DEV-ECS-2", "MemoryUtilization").subscribe(this.updateMemoryDatapointsState.bind(this))
        this.metricsCpuStreamObserver = metricsStream$("DEV-ECS-2", "CPUUtilization").subscribe(this.updateCpuDatapointsState.bind(this))
    }

    componentWillUnmount() {
        this.clusterStreamObserver.unsubscribe();
        this.metricsMemoryStreamObserver.unsubscribe();
        this.metricsCpuStreamObserver.unsubscribe();
    }

    render() {
        const clusterNames = this.state.clusters.map(mapToClusterName);
        const chartDatapoints = [(this.state.memoryDatapoints), (this.state.cpuDatapoints)];
        return (
            <div className="cluster-summary">
                <PageDescription header={`${this.state.clusterCount} monitored clusters`} lastUpdateStamp={this.state.lastUpdateStamp} />
                <div className="row">
                    <div className="col s6"><ClusterSummary /></div>
                    <div className="col s6">
                        <MetricStatGroup clusters={clusterNames} />
                    </div>
                </div>
                <div className="row">
                    <div className="col s6"><Graph datapoints={chartDatapoints} label="DEV-ECS-2"/></div>
                </div>
            </div>
        );
    }
}


export default ClusterDashboard;