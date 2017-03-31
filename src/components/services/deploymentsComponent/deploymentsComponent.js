import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { loadingBar } from '../../loading';
import moment from 'moment';
import { aggregatedServiceDeploymentStream$ } from '../../../dataStreams/serviceStreams';
import { nameFromAwsArn } from '../../../utils/stringFormatting';
import './deploymentsComponent.css';


function buildListItem(deployment) {
    return (
        <tr key={deployment.id}>
            <td>{moment(deployment.createdAt).fromNow()}</td>
            <td className="count">{deployment.desiredCount}</td>
            <td className="count">{deployment.pendingCount}</td>
            <td>{nameFromAwsArn(deployment.taskDefinition)}</td>
        </tr>
    );
}

class Deployments extends Component {
    constructor(props) {
        super(props);
        this.initialRender = true;
        this.state = { deployments: [] };
    }
    
    updateState(deployments) {
        this.initialRender = false;
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
            <ReactCSSTransitionGroup
                    transitionName="component-fadein"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    transitionLeave={false}>
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
            </ReactCSSTransitionGroup>
        );
    }

    render() {
        let content;
        if (this.initialRender) {
            content = loadingBar();
        } else if (this.state.deployments.length === 0) {
            content = this.renderNoDeployments();
        } else {
            content = this.renderTable();
        }

        return (
            <section className="service-deployments component-panel">
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