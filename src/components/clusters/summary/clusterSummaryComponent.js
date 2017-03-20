import React, { Component } from 'react';
import { clusterStream$ } from '../../../dataStreams/clusterStreams';
import './clusterSummaryComponent.css';

function mapClusterSummaryEntryToDOM(entry) {    
    return (
        <tr className="cluster-entry" key={entry.clusterArn}>
            {/*{entry.status}*/}
            {/*{entry.clusterArn}*/}
            <td className="cluster-name">{entry.clusterName}</td>
            <td className="number">{entry.activeServicesCount}</td>
            <td className="number">{entry.registeredContainerInstancesCount}</td>
            <td className="number">{entry.runningTasksCount}</td>
        </tr>
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
            <tr><td>There are no clusters</td></tr>
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
                    <table>
                        <thead>
                            <tr>
                                <th>Cluster Name</th>
                                <th># Active Services</th>
                                <th># Instances</th>
                                <th>Running Tasks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {body}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}

export default ClusterSummary;