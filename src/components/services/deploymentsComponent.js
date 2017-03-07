import React, { Component } from 'react';
import moment from 'moment';
import { aggregatedServiceDeploymentStream$ } from '../../dataStreams/serviceStreams';

function formatTaskDefinitionString(taskDefinition) {
    let lastIndexOfSlash = taskDefinition.lastIndexOf('/');
    return taskDefinition.substring(lastIndexOfSlash + 1);
}

function buildListItem(deployment) {
    return (
        <li className="entry" key={deployment.id}>
            {moment(deployment.createdAt).format('ddd Do MMM, h:mm:ss a')} -
            dc::{deployment.desiredCount} - td::{formatTaskDefinitionString(deployment.taskDefinition)}
        </li>
    );
}

class Deployments extends Component {
    constructor(props) {
        super(props);
        this.state = { deployments: [] };
    }
    
    updateState(deployments) {
        if (!deployments || deployments.length === 0) {
            return;
        }

        this.setState({deployments: deployments});
    }
    
    componentWillMount() {
        this.serviceDeploymentObserver = aggregatedServiceDeploymentStream$(5).subscribe(this.updateState.bind(this))
    }

    componentWillUnmount() {
        this.serviceDeploymentObserver.unsubscribe();
    }
    
    renderNoDeployments() {
        return (
            <li>There are no deployments to show</li>
        );
    }

    render() {
        const body = this.state.deployments.length === 0
            ? this.renderNoDeployments()
            : this.state.deployments.map(buildListItem);
        return (
            <section className="service-deployments">
                <div className="card-panel">
                    <strong className="card-header">Deployments</strong>
                    <div className="divider"></div>
                    <ul>
                        {body}
                    </ul>
                </div>
            </section>
        );
    }
}

export default Deployments;