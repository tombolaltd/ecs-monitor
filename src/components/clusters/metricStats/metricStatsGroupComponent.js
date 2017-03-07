import React, { Component, PropTypes } from 'react';
import MetricStat from './metricStatComponent';
import { metricStatStream$ } from '../../../dataStreams/metricStreams';
import './metricStatsGroupComponent.css';

function isOver80PercentAlertPredicate(value) {
    return value >= 80;
}

function isOver80PercentAlertHandler(clusterName, title) {
    return (value) => {
        window.Materialize.toast(`${clusterName} :: ${title} is over 80%`, 10000);
    }
}

class MetricStatGroup extends Component {
    clusterNameToMetricStatComponent(clusterName, i) {
        const cpuTitle = 'CPU Utilization';
        const memoryTitle = 'Memory Utilization';
        const cpuStream$ = metricStatStream$(clusterName, 'CPUUtilization', 5000);
        const memoryStream$ = metricStatStream$(clusterName, 'MemoryUtilization', 5000);
        return (
            <div className="metric-stat-wrapper" key={clusterName + '-metric-' + i}>
                <p className="clustername">{clusterName}</p>
                <div className="cpu inline">
                    <MetricStat 
                        title={cpuTitle}
                        _key={clusterName}
                        stream={cpuStream$}
                        alertPredicate={isOver80PercentAlertPredicate}
                        alertHandler={isOver80PercentAlertHandler(clusterName, cpuTitle)} />
                </div>
                <div className="memory inline">
                    <MetricStat
                        title={memoryTitle}
                        _key={clusterName}
                        stream={memoryStream$}
                        alertPredicate={isOver80PercentAlertPredicate}
                        alertHandler={isOver80PercentAlertHandler(clusterName, memoryTitle)} />
                </div>
            </div>
        );
    }
    
    render() {
        const body = this.props.clusters.map(this.clusterNameToMetricStatComponent, this);
        return (
            <div className="metric-stat-group">
                {body}
            </div>
        );
    }
}

MetricStatGroup.propTypes = {
    clusters: PropTypes.arrayOf(PropTypes.string)
};

export default MetricStatGroup;