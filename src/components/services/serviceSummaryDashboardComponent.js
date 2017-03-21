import React, { Component } from 'react';
import PageDescription from '../pageDescription/pageDescriptionComponent';
import ServiceTaskOverview from './serviceTaskOverviewComponent/serviceTaskOverviewComponent';
import Deployments from './deploymentsComponent/deploymentsComponent';
import AggregatedServiceEvents from './aggregatedEventsComponent';
import TaskChurn from './taskChurnComponent/taskChurnComponent';
import { servicesStream$ } from '../../dataStreams/serviceStreams';
import moment from 'moment';

function stamp() {
    return moment().format('dddd Do MMMM YYYY, h:mm:ss a');
}

class ServiceSummaryDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            activeServiceCount: 0,
            lastUpdateStamp: stamp()
        };
    }

    updateState(services) {
        if(!services || services.length === 0) {
            return;
        }
        this.setState({ 
            activeServiceCount: services.length,
            lastUpdateStamp: stamp()
        });
    }

    componentWillMount() {
        this.servicesStreamObserver = servicesStream$.subscribe(this.updateState.bind(this));
    }

    componentWillUnmount() {
        this.servicesStreamObserver.unsubscribe();
    }
    
    render() {
        return (
            <div className="service-summary">
                <PageDescription header={`${this.state.activeServiceCount} monitored services`} lastUpdateStamp={this.state.lastUpdateStamp} />
                <div className="row">
                    <div className="col s4"><ServiceTaskOverview /></div>
                    <div className="col s5"><Deployments /></div>
                    <div className="col s3"><TaskChurn /></div>
                </div>
                <AggregatedServiceEvents />
            </div>
        );
    }
}

export default ServiceSummaryDashboard;