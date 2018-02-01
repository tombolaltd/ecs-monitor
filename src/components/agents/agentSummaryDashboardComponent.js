import React, { Component } from 'react';
import PageDescription from '../pageDescription/pageDescriptionComponent';
import ClusterAgentBreakdown from './agentBreakdown/clusterAgentBreakdown';
import { taskDefinitionStream$ } from '../../dataStreams/taskDefinitionStreams';
import { clusterStream$ } from '../../dataStreams/clusterStreams';
import moment from 'moment';

const taskDefColourCache = {};

function stamp() {
    return moment().format('dddd Do MMMM YYYY, h:mm:ss a');
}

function stringToColour(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function assignColoursToTaskDefinitions(arns) {
    for (let i=0; i < arns.length; i++) {
        const arn = arns[i];
        if (taskDefColourCache[arn]) {
            continue;
        }
        taskDefColourCache[arn] = stringToColour(arn);
    }
    
    return taskDefColourCache;
}

function byHighestTaskCountDesc(clusterA, clusterB) {
    return clusterA.runningTasksCount < clusterB.runningTasksCount;
}

class ClusterDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            lastUpdateStamp: stamp(),
            clusters: []
        };
        this.updateClusterState = this.updateClusterState.bind(this);
    }

    updateClusterState(newState) {
        const clusters = newState.sort(byHighestTaskCountDesc);
        this.setState({
            clusters: clusters,
            lastUpdateStamp: stamp()
        })
    }

    componentWillMount() {
        this.taskDefinitionObserver = 
            taskDefinitionStream$.subscribe(assignColoursToTaskDefinitions);
        
        this.clusterObserver = clusterStream$.subscribe(this.updateClusterState);
    }

    componentWillUnmount() {
        this.taskDefinitionObserver.unsubscribe();
        this.clusterObserver.unsubscribe();
    }

    renderClusterAgentBreakdown(cluster) {
        return (
            <ClusterAgentBreakdown
                key={`breakdown::${cluster.clusterName}`}
                clusterName={cluster.clusterName} 
                agentCount={cluster.registeredContainerInstancesCount}
                runningTasksCount={cluster.runningTasksCount + cluster.pendingTasksCount}
                taskDefinitionColours={taskDefColourCache} />
        );
    }

    render() {
        const clusterBreakdownComponents = this.state.clusters.map(this.renderClusterAgentBreakdown);
        return (
            <div className="ec2-summary">
                <PageDescription header={`${this.state.clusters.length} monitored clusters`} lastUpdateStamp={this.state.lastUpdateStamp} />
                
                {clusterBreakdownComponents}
            </div>
        );
    }
}

export default ClusterDashboard;