import React, { Component, PropTypes } from 'react';
import { nameFromAwsArn } from '../../../utils/stringFormatting';

class Agent extends Component {
    renderTaskListEntry(task) {
        return (
            <li className="task" key={task.taskArn}>
                <i className="active-status-icon"></i>
                <p>{nameFromAwsArn(task.taskDefinitionArn)}</p>
            </li>
        );
    }
    
    render() {
        const details = this.props.agentDetails;
        const taskListItems = details.tasks.map(this.renderTaskListEntry);
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
    agentDetails: PropTypes.object.isRequired
};

export default Agent;