import AWS from 'aws-sdk';
import { Observable, ReplaySubject } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';


const _tasksStreamCache = {};


function getTaskArnsForCluster(cluster) {
    const params = {
        cluster: cluster
    };
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.listTasks(params).promise();
    });
}

function describeTasksFn(cluster) {
    return (listTasksResponse) => {
        if (listTasksResponse.taskArns.length === 0) {
            return Promise.resolve({ tasks: [] });
        }
        const params = { 
            cluster: cluster,
            tasks: listTasksResponse.taskArns
        };
        return awsRequest.create((awsConfig) => {
            const ecs = new AWS.ECS(awsConfig);
            return ecs.describeTasks(params).promise();
        });
    };
}


// STREAMS ===============

export function tasksStream(cluster) {
    const cacheKey = `tasksStream::${cluster}`;
    if (_tasksStreamCache[cacheKey]) {
        return _tasksStreamCache[cacheKey];
    }
    
    const obs$ = Observable.timer(0, config.TASK_STREAM_REFRESH_INTERVAL * 1000) // timer in seconds
        .flatMap(() => {
            const listTasks = getTaskArnsForCluster(cluster);
            return listTasks.then(describeTasksFn(cluster));
        })
        .pluck('tasks')
        .retryWhen(streamRetryFn(3000))
        .multicast(() => new ReplaySubject(1))
        .refCount();

    _tasksStreamCache[cacheKey] = obs$;

    return obs$;
} 