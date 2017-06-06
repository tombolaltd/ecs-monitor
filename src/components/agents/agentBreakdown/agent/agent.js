import React, { Component, PropTypes } from 'react';
import { nameFromAwsArn } from '../../../../utils/stringFormatting';
import './agent.css';

/**
 * IDEAS:
 * - Add a tooltip on hover to display more info about the task
 */

class Agent extends Component {
    getColour(taskDefinitionArn) {
        return this.props.taskDefinitionColours[taskDefinitionArn];
    }
    
    renderTaskListEntry(task) {
        console.log(task);
        const style = {
            backgroundColor: this.getColour(task.taskDefinitionArn)
        };
        return (
            <li className="task" key={task.taskArn} style={style}>
                <i className={`status-icon ${task.lastStatus.toLowerCase()}`}></i>
                <p>{nameFromAwsArn(task.taskDefinitionArn)}</p>
            </li>
        );
    }
    
    render() {
        const details = this.props.agentDetails;
        const taskListItems = details.tasks.map(this.renderTaskListEntry, this);
        return (
            <div className="agent col">
                <strong>{details.instance.ec2InstanceId}</strong>
                <em>{details.tasks.length} tasks</em>
                <hr />
                <ul>
                    {taskListItems}
                </ul>
            </div>
        );
    }
}

Agent.propTypes = {
    agentDetails: PropTypes.object.isRequired,
    taskDefinitionColours: PropTypes.object.isRequired
};

export default Agent;