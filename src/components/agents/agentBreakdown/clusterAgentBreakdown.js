import React, { Component, PropTypes } from 'react';
import Rx from 'rxjs';
import Agent from './agent';
import { containerInstancesStream } from '../../../dataStreams/ec2Streams';
import { tasksStream } from '../../../dataStreams/taskStreams';

function mapContainerInstanceGroup(tasks) {
    return (containerInstance) => {
        const associatedTasks = tasks.filter(
            (t) => t.containerInstanceArn === containerInstance.containerInstanceArn);
        return {
            instance: containerInstance,
            tasks: associatedTasks
        };
    };
}

class ClusterAgentBreakdown extends Component {
    constructor() {
        super();
        this.state = {
            data: []
        };
        this.updateState = this.updateState.bind(this);
    }
    
    getColour(taskDefinitionArn) {
        return this.props.taskDefinitionColours[taskDefinitionArn];
    }

    updateState(newState) {
        this.setState({
            data: newState
        });
    }

    componentWillMount() {
        this.tasksDataObservable =
            Rx.Observable.combineLatest(
                containerInstancesStream(this.props.clusterName),
                tasksStream(this.props.clusterName),
                (containerInstances, tasks) => {
                    return containerInstances.map(mapContainerInstanceGroup(tasks))
                }
            ).do(console.log.bind(console)).subscribe(this.updateState);
    }

    componentWillUnmount() {
        this.tasksDataObservable.unsubscribe();
    }
    
    render() {
        const agents = this.state.data.map((entry) => {
            return (
                <Agent agentDetails={entry} key={entry.instance.ec2InstanceId} />
            );
        });
        return (
            <div>
                <h3>{this.props.clusterName} cluster</h3>
                <span>{this.state.data.length} instances</span>
                <div className="agents-collection row">
                    {agents}
                </div>
            </div>
        );
    }
}

ClusterAgentBreakdown.propTypes = {
    clusterName: PropTypes.string.isRequired,
    taskDefinitionColours: PropTypes.object.isRequired
}

export default ClusterAgentBreakdown;