import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { loadingBar } from '../../loading';
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
        this.initialRender = true;
        this.state = { 
            clusters: []
        };
    }
    
    updateState(clusters) {
        this.initialRender = false;
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
            <p>There are no clusters</p>
        );
    }

    renderTable() {
        const tableBody = this.state.clusters.map(mapClusterSummaryEntryToDOM);
        return (
            <ReactCSSTransitionGroup
                        transitionName="component-fadein"
                        transitionAppear={true}
                        transitionAppearTimeout={500}
                        transitionEnter={false}
                        transitionLeave={false}>
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
        } else if (this.state.clusters.length === 0) {
            content = this.renderNoClusters();
        } else {
            content = this.renderTable();
        }

        return (
            <section className="cluster-summary component-panel">
                <div className="card-panel">
                    <strong className="card-header">Summary</strong>
                    <div className="divider"></div>
                    {content}
                </div>
            </section>
        );
    }
}

export default ClusterSummary;