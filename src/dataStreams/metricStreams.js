import AWS from 'aws-sdk';
import { Observable } from 'rxjs';
import { streamRetryFn } from './common';
import awsRequest from '../awsRequest';
import moment from 'moment';

const _statStreamCache = {};
const _metricStreamCache = {};

function buildCacheKey(dimensionsArray, metricName) {
    let key = '';
    for (let i=0; i < dimensionsArray.length; i++) {
        key += dimensionsArray[i].Value;
    }
    key += metricName;
    return key;
}

function cloudwatchMetricStatisticsRequest(dimensions, metricName, fromMinutes, period, to) {
    const params = {
        Namespace: 'AWS/ECS',
        MetricName: metricName,
        Dimensions: dimensions,
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

export function metricsStream$(dimensions, metricName) {
    const cacheKey = buildCacheKey(dimensions, metricName);
    const cachedObs = _metricStreamCache[cacheKey];
    if (cachedObs) {
        return cachedObs;
    }

    const obs$ = Observable.from(cloudwatchMetricStatisticsRequest(dimensions, metricName, 30, 60, moment().toDate()))
        .map(x => { 
            if (x.Datapoints.length === 0) {
                return [];
            }
            return x.Datapoints.sort((a, b) => a.Timestamp - b.Timestamp)
        })
        .filter(x => x.length !== 0)
        .retryWhen(streamRetryFn(3000))
        .share();

    _metricStreamCache[cacheKey] = obs$;
    return obs$;
}

export function metricStatStream$(dimensions, metricName) {
    const cacheKey = buildCacheKey(dimensions, metricName);
    const cachedObs = _statStreamCache[cacheKey];
    if (cachedObs) {
        return cachedObs;
    }

    // interval is 60 seconds.
    // cloudwatch only lets you define periods which are multiples of 60
    // so this is the shortest we can do without wasting requests
    const obs$ = Observable.timer(0, 60 * 1000)
        .switchMap(() => metricsStream$(dimensions, metricName))
        .map(metrics => metrics[metrics.length-1]);

    _statStreamCache[cacheKey] = obs$;
    return obs$;
}