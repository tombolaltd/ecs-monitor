import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Chart from 'chart.js';
import { Observable } from 'rxjs';

function dataPointToMaximum(point) {
    return point.Maximum;
}

function dataPointTimestamp(point) {
    return moment(point.Timestamp).format("HH:mm");
}

class Graph extends Component {    

    updateMemoryDatapointsState(memoryDatapoints)
    {
        this.chart.data.labels = memoryDatapoints.map(dataPointTimestamp);
        this.chart.data.datasets[0].data = memoryDatapoints.map(dataPointToMaximum);
        this.chart.update(1500, false);
    }

    updateCpuDatapointsState(cpuDatapoints)
    {
        this.chart.data.labels = cpuDatapoints.map(dataPointTimestamp);
        this.chart.data.datasets[1].data = cpuDatapoints.map(dataPointToMaximum);
        this.chart.update(1500, false);
    }

    componentDidMount() {
        this.memoryStream = this.props.memoryStream.subscribe(this.updateMemoryDatapointsState.bind(this));
        this.cpuStream = this.props.cpuStream.subscribe(this.updateCpuDatapointsState.bind(this));

        const thisNode = ReactDOM.findDOMNode(this);
      
        this.chart = new Chart(thisNode, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Memory Utilization',
                        data: [],
                        backgroundColor: "rgba(75,192,192,0.4)",
                        lineTension: 0.1
                    },
                    { 
                        label: 'CPU Utilization',
                        data: [],
                        backgroundColor: "rgba(255,152,0,1)",
                        lineTension: 0.1 
                    }
                ]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: this.props.label
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            autoSkipPadding:10,
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            max: 100
                        }
                    }]
                }
            }
        }); 
    }
    
    componentWillUnmount() {
        this.memoryStream.unsubscribe();
        this.cpuStream.unsubscribe();
    }

    render() {
        return (           
            <canvas id={this.props.label + '-graph'} className="graph" width="400" height="400"></canvas>
        );
    }
}

Graph.propTypes = {
    label: PropTypes.string.isRequired,
    memoryStream: PropTypes.instanceOf(Observable).isRequired,
    cpuStream: PropTypes.instanceOf(Observable).isRequired
};

export default Graph;