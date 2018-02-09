import React, { Component, PropTypes } from 'react';
import { nameFromAwsArn } from '../../../../utils/stringFormatting';
import Tooltip from '../../../tooltip/tooltip';
import './agent.css';


class Agent extends Component {
    get instanceId() {
        return this.props.agentDetails.instance.ec2InstanceId;
    }

    get tooltipSettings() {
        return {
            trigger: 'mouseenter',
            arrow: true,
            html: `#tooltip-${this.instanceId}`
        };
    }
    
    constructor(props) {
        super(props);
        this.handleMouseOverIcon = this.handleMouseOverIcon.bind(this);
        this.setEc2DetailState = this.setEc2DetailState.bind(this);
        
        this.state = {
            ec2Details: {}
        };
    }
    
    getColour(taskDefinitionArn) {
        return this.props.taskDefinitionColours[taskDefinitionArn];
    }
    
    setEc2DetailState(ec2Details) {
        this.setState({ ec2Details });
        return ec2Details;
    }

    handleMouseOverIcon() {
        // getEc2InstanceDetails(this.instanceId)
        //     .then(this.setEc2DetailState)
        //     .then(console.log.bind(console));
    }

    renderTaskListEntry(task) {
        const style = {
            backgroundColor: this.getColour(task.taskDefinitionArn)
        };
        const lastStatus = task.lastStatus.toLowerCase();
        return (
            <li className={`task card-panel ${lastStatus}`} key={task.taskArn} style={style}>
                <i className="status-icon"></i>
                <p className="task-definition">{nameFromAwsArn(task.taskDefinitionArn)}</p>
            </li>
        );
    }
    
    render() {
        const details = this.props.agentDetails;
        const taskListItems = details.tasks.map(this.renderTaskListEntry, this);
        return (
            <div className="agent col" id={`agent-${this.instanceId}`}>
                <Tooltip
                        tooltipId={`tooltip-${this.instanceId}`}
                        triggerId={`#agent-${this.instanceId} .agent-icon`}
                        tippySettings={this.tooltipSettings}>
                    <ul className="tooltip-details-list">
                        <li>Status: {details.instance.status}</li>
                        <li>Instance type: {details.instance.attributes[2].value}</li>
                        <li>Registered CPU: {details.instance.registeredResources[0].integerValue} units</li>
                        <li>Remaining CPU: {details.instance.remainingResources[0].integerValue} units</li>
                        <li>Registered Memory: {details.instance.registeredResources[1].integerValue} mb</li>
                        <li>Remaining Memory: {details.instance.remainingResources[1].integerValue} mb</li>
                    </ul>
                </Tooltip> 
                <div className="agent-info">
                    <i className="agent-icon small material-icons"
                        onMouseOver={this.handleMouseOverIcon}>perm_identity</i>
                    <strong className="instanceid">{this.instanceId}</strong>
                </div>
                <em className="task-count">{details.tasks.length} tasks</em>
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