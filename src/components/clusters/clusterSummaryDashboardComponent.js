import React, { Component } from 'react';
import PageDescription from '../pageDescription/pageDescriptionComponent';
import ClusterSummary from './summary/clusterSummaryComponent';
import Graph from './graph/graphComponent';
import MetricStatGroup from './metricStats/metricStatsGroupComponent';
import { clusterStream$ } from '../../dataStreams/clusterStreams';
import { metricsStream$ } from '../../dataStreams/metricStreams';
import moment from 'moment';

const inlineBlock = {
    display: 'inline-block'
};

function stamp() {
    return moment().format('dddd Do MMMM YYYY, h:mm:ss a');
}

function mapToClusterName(cluster) {
    return cluster.clusterName;
}

function mapClusterToMetrics(cluster, i) {
    const clusterName = cluster.clusterName;
    const dimensions = [
        { Name: 'ClusterName', Value: clusterName }
    ];
    const cpuDataStream$ = metricsStream$(dimensions, "CPUUtilization");
    const memoryDataStream$ = metricsStream$(dimensions, "MemoryUtilization");
    return (
        <li key={clusterName + '-graphMetric' + i} style={inlineBlock}>
            <Graph memoryStream={memoryDataStream$} cpuStream={cpuDataStream$} label={clusterName} />
        </li>
    );
}

class ClusterDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clusters: [],
            clusterCount: 0,
            lastUpdateStamp: stamp()
        };
    }

    updateClusterState(clusters) {
        if (!clusters || clusters.length === 0) {
            return;
        }
        this.setState({
            clusters: clusters,
            clusterCount: clusters.length,
            lastUpdateStamp: stamp()
        });
    }

    componentWillMount() {
        this.clusterStreamObserver = clusterStream$.subscribe(this.updateClusterState.bind(this));
    }

    componentWillUnmount() {
        this.clusterStreamObserver.unsubscribe();
    }

    render() {
        const clusterNames = this.state.clusters.map(mapToClusterName);
        const graphBody = this.state.clusters.map(mapClusterToMetrics, this);
        return (
            <div className={`cluster-summary count-${this.state.clusters.length}`}>
                <PageDescription header={`${this.state.clusterCount} monitored clusters`} lastUpdateStamp={this.state.lastUpdateStamp} />
                <div className="row">
                    <div className="col s6">
                        <ClusterSummary />
                    </div>
                    <div className="col s6">
                        <MetricStatGroup clusters={clusterNames} />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12">
                        <ul>
                            {graphBody}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default ClusterDashboard;