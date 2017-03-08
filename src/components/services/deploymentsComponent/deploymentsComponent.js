import React, { Component } from 'react';
import moment from 'moment';
import { aggregatedServiceDeploymentStream$ } from '../../../dataStreams/serviceStreams';
import './deploymentsComponent.css';

function formatTaskDefinitionString(taskDefinition) {
    let lastIndexOfSlash = taskDefinition.lastIndexOf('/');
    return taskDefinition.substring(lastIndexOfSlash + 1);
}

function buildListItem(deployment) {
    return (
        <tr key={deployment.id}>
            <td>{moment(deployment.createdAt).fromNow()}</td>
            <td className="count">{deployment.desiredCount}</td>
            <td className="count">{deployment.pendingCount}</td>
            <td>{formatTaskDefinitionString(deployment.taskDefinition)}</td>
        </tr>
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
            <p>There are no deployments to show</p>
        );
    }

    renderTable() {
        const tableBody = this.state.deployments.map(buildListItem);
        return (
            <table className="slimmer-table deployments-table striped">
                <thead>
                    <tr>
                        <th>When</th>
                        <th>Desired</th>
                        <th>Pending</th>
                        <th>Task Definition</th>
                    </tr>
                </thead>
                <tbody>
                    {tableBody}
                </tbody>
            </table>
        );
    }

    render() {
        const content = this.state.deployments.length === 0
            ? this.renderNoDeployments()
            : this.renderTable();

        return (
            <section className="service-deployments">
                <div className="card-panel">
                    <strong className="card-header">Deployments</strong>
                    <div className="divider"></div>
                    {content}
                </div>
            </section>
        );
    }
}

export default Deployments;