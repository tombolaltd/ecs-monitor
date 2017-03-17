import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Chart from 'chart.js';

function dataPointToMaximum(point) {
    return point.Maximum;
}

function dataPointTimestamp(point) {
    return moment(point.Timestamp).format("HH:mm");
}

// function assignChartData(chart) {
//     return (point, index) => {
//         console.log(point);
//         chart.data.labels = point.map(dataPointTimestamp);
//         chart.data.datasets.data = point.map(dataPointToMaximum);
//     }
// }

class Graph extends Component {    
    componentWillReceiveProps(nextProps) {
        // if this.props is the same as nextProps, just return
        // if nextProps is falsy, just return
        
        // nextProps.datapoints.assignChartData(this.chart);
        this.chart.data.labels = nextProps.datapoints[0].map(dataPointTimestamp);
        this.chart.data.datasets[0].data = nextProps.datapoints[0].map(dataPointToMaximum);
        this.chart.data.labels = nextProps.datapoints[1].map(dataPointTimestamp);
        this.chart.data.datasets[1].data = nextProps.datapoints[1].map(dataPointToMaximum);
        // safely call after updating the datasets
        // duration is the time for the animation of the redraw in milliseconds
        // lazy is a boolean. if true, the animation can be interrupted by other animations
        this.chart.update(1500, false);
    }

    componentDidMount() {
        const thisNode = ReactDOM.findDOMNode(this);
        this.chart = new Chart(thisNode, {
            type: 'line',
            data: {
                labels: this.props.datapoints[0].map(point => point.Timestamp.toString()),
                datasets: [
                    {
                        label: 'Memory Utilization',
                        data: this.props.datapoints[0].map(dataPointToMaximum),
                        backgroundColor: "rgba(75,192,192,0.4)",
                        lineTension: 0.1
                    },
                    { 
                        label: 'CPU Utilization',
                        data: this.props.datapoints[1].map(dataPointToMaximum),
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
                            max: 100,
                            stepsize: 20
                        }
                    }]
                }
            }
        });
    }
    
    render() {
        return (
            <canvas id={this.props.label + '-graph'} className="graph" width="400" height="400"></canvas>
        );
    }
}

Graph.propTypes = {
    label: PropTypes.string.isRequired,
    datapoints: PropTypes.array.isRequired
};

export default Graph;