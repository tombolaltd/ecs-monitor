import React, { Component } from 'react';
import { clusterStream$ } from '../../../dataStreams/clusterStreams';

function mapClusterSummaryEntryToDOM(entry) {    
    return (
        <li className="cluster-entry" key={entry.clusterArn}>
            {/*{entry.status}*/}
            {/*{entry.clusterArn}*/}
            <p>Cluster name: <strong>{entry.clusterName}</strong></p>
            <p>Active services: {entry.activeServicesCount}</p>
            <p>Registered Instances {entry.registeredContainerInstancesCount}</p>
            <p>Pending::Running tasks {entry.pendingTasksCount} :: {entry.runningTasksCount}</p>
            <div className="divider"></div>
        </li>
    );
}


class ClusterSummary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            clusters: []
        };
    }
    
    updateState(clusters) {
        if (!clusters || clusters.length === 0) {
            return;
        }
        this.setState({ 
            clusters: clusters
        });
    }
    
    componentWillMount() {
        this.clusterStreamObserver = clusterStream$.subscribe(this.updateState.bind(this));
    }

    componentWillUnmount() {
        this.clusterStreamObserver.unsubscribe();
    }

    renderNoClusters() {
        return (
            <li>There are no clusters</li>
        );
    }
    
    render() {
        const body = this.state.clusters.length === 0
            ? this.renderNoClusters()
            : this.state.clusters.map(mapClusterSummaryEntryToDOM);
        return (
            <section className="cluster-summary">
                <div className="card-panel">
                    <strong className="card-header">Summary</strong>
                    <div className="divider"></div>
                    <ul>
                        {body}
                    </ul>
                </div>
            </section>
        );
    }
}

export default ClusterSummary;