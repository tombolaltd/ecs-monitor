import AWS from 'aws-sdk';
import { Observable, ReplaySubject } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';


const _containerInstancesStreamCache = {};


function getContainerInstanceArns(cluster) {
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.listContainerInstances().promise();
    });
}

function getContainerInstanceDetails(cluster, instances) {
    const params = { 
        cluster: cluster,
        containerInstances: instances
    };
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.describeContainerInstances(params).promise();
    });
}


// STREAMS ===============

export function containerInstancesStream(cluster) {
    const cacheKey = `containerInstancesStream::${cluster}`;
    if (_containerInstancesStreamCache[cacheKey]) {
        return _containerInstancesStreamCache[cacheKey];
    }
    
    const obs$ = Observable.timer(0, config.CONTAINER_INSTANCES_REFRESH_INTERVAL * 1000) // timer in seconds
        .flatMap(() => {
            const containerInstances = getContainerInstanceArns(cluster);
            return containerInstances.then(({containerInstanceArns}) =>
                    getContainerInstanceDetails(cluster, containerInstanceArns));
        })
        .pluck('containerInstances')
        .retryWhen(streamRetryFn(3000))
        .multicast(() => new ReplaySubject(1))
        .refCount();

    _containerInstancesStreamCache[cacheKey] = obs$;

    return obs$;
}