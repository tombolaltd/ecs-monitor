import AWS from 'aws-sdk';
import { Observable } from 'rxjs';
import { streamRetryFn } from './common';
import awsRequest from '../awsRequest';
import moment from 'moment';

const _statStreamCache = {};

function makeCloudwatchClusterMetricStatisticsRequest(clusterName, metricName, fromMinutes, period, to) {
    const params = {
        Namespace: 'AWS/ECS',
        MetricName: metricName,
        Dimensions: [
            { Name:'ClusterName', Value: clusterName },
        ],
        StartTime: moment().subtract(fromMinutes, 'minutes').toDate(),
        EndTime: to,
        Period: period, // seconds
        Statistics: ['Maximum']
    };
    return awsRequest.create(awsConfig => {
        const cloudWatch = new AWS.CloudWatch(awsConfig);
        return cloudWatch.getMetricStatistics(params).promise();
    });
}

export function metricsStream$(clusterName, metricName) {
    // todo - cache the stream, so we return the same stream given the same params again
    return Observable.from(makeCloudwatchClusterMetricStatisticsRequest(clusterName, metricName, 30, 60, moment().toDate()))
        .map(x => { 
            if (x.Datapoints.length === 0) {
                return [];
            }
            return x.Datapoints.sort((a, b) => a.Timestamp - b.Timestamp)
        })
        .filter(x => x.length !== 0)
        .retryWhen(streamRetryFn(3000))
        .share();
}

export function metricStatStream$(clusterName, metricName) {
    const cacheKey = clusterName + metricName;
    const cachedObs = _statStreamCache[cacheKey];
    if (cachedObs) {
        return cachedObs;
    }

    // interval is 60 seconds.
    // cloudwatch only lets you define periods which are multiples of 60
    // so this is the shortest we can do without wasting requests
    const obs$ = Observable.timer(0, 60 * 1000)
        .switchMap(() => metricsStream$(clusterName, metricName))
        .map(metrics => metrics[metrics.length-1]);

    _statStreamCache[cacheKey] = obs$;
    return obs$;
}