import React, { Component } from 'react';
import PageDescription from '../pageDescription/pageDescriptionComponent';
import ClusterAgentBreakdown from './agentBreakdown/clusterAgentBreakdown';
import { taskDefinitionStream$ } from '../../dataStreams/taskDefinitionStreams';
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

class ClusterDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            lastUpdateStamp: stamp()
        };
    }

    componentWillMount() {
        this.taskDefinitionObserver = 
            taskDefinitionStream$.subscribe(assignColoursToTaskDefinitions);
    }

    componentWillUnmount() {
        this.taskDefinitionObserver.unsubscribe();
    }

    render() {
        return (
            <div className="ec2-summary">
                <PageDescription header={`X monitored agents`} lastUpdateStamp={this.state.lastUpdateStamp} />

                {/* todo - FOREACH CLUSTER */}
                <ClusterAgentBreakdown clusterName="default" taskDefinitionColours={taskDefColourCache} />
            </div>
        );
    }
}

export default ClusterDashboard;