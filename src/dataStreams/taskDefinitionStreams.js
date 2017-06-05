import AWS from 'aws-sdk';
import { Observable, ReplaySubject } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';

function getTaskDefinitionArns() {
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.listTaskDefinitions().promise();
    });
}


// STREAMS ===============

export const taskDefinitionStream$ = 
    Observable.timer(0, config.TASK_DEFINITION_REFRESH_INTERVAL * 1000) // in seconds
    .flatMap(() => getTaskDefinitionArns())
    .pluck('taskDefinitionArns')
    .retryWhen(streamRetryFn(3000))
    .multicast(() => new ReplaySubject(1))
    .refCount();