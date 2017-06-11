import React, { Component, PropTypes } from 'react';
import Rx from 'rxjs';
import Agent from './agent/agent';
import { containerInstancesStream } from '../../../dataStreams/ec2Streams';
import { tasksStream } from '../../../dataStreams/taskStreams';
import './clusterAgentBreakdown.css';

function filterTasksBasedOnContainerInstanceArn(task) {
    // context 'this' is the containerInstanceArn.
    return task.containerInstanceArn === this;
}

function mapContainerInstanceGroup(containerInstance) {
    // context 'this' is the tasks.
    const tasks = this;
    const relevantTasks = tasks.filter(filterTasksBasedOnContainerInstanceArn, containerInstance.containerInstanceArn);
    return {
        instance: containerInstance,
        tasks: relevantTasks
    };
}

/**
 * IDEAS:
 * - Monitor the agents as well as the tasks running on them. Each agent will have a status, e.g. Connected or not.
 */

class ClusterAgentBreakdown extends Component {
    constructor() {
        super();
        this.state = {
            data: []
        };

        //  bind functions
        this.updateState = this.updateState.bind(this);
        this.renderAgentComponent = this.renderAgentComponent.bind(this);
    }
    
    updateState(newState) {
        this.setState({
            data: newState
        });
    }

    taskCount(data) {
        if (data.length === 0) 
            return 0;

        return data.reduce((acc, next) => acc + next.tasks.length, 0);
    }

    componentWillMount() {
        const clusterName = this.props.clusterName;
        this.tasksDataObservable =
            Rx.Observable.combineLatest(
                containerInstancesStream(clusterName),
                tasksStream(clusterName),
                (containerInstances, tasks) => {
                    return containerInstances.map(mapContainerInstanceGroup, tasks)
                }
            ).subscribe(this.updateState);
    }

    componentWillUnmount() {
        this.tasksDataObservable.unsubscribe();
    }
    
    renderAgentComponent(entry) {
        return (
            <Agent 
                agentDetails={entry}
                key={entry.instance.ec2InstanceId}
                taskDefinitionColours={this.props.taskDefinitionColours} />
        );
    }

    render() {
        const activeClass = this.props.runningTasksCount < 1 
            ? 'inactive'
            : '';
        const agents = this.state.data.map(this.renderAgentComponent);
        return (
            <div className={`cluster ${activeClass}`}>
                <div className="cluster-info-header">
                    <h3 className="header">{this.props.clusterName} cluster</h3>
                    <strong className="stats">
                        {this.props.agentCount} connected agents | running {this.props.runningTasksCount} tasks
                    </strong>
                </div>
                <div className="agents-collection row">
                    {agents}
                </div>
            </div>
        );
    }
}

ClusterAgentBreakdown.propTypes = {
    clusterName: PropTypes.string.isRequired,
    agentCount: PropTypes.number.isRequired,
    runningTasksCount: PropTypes.number.isRequired,
    taskDefinitionColours: PropTypes.object.isRequired
}

export default ClusterAgentBreakdown;