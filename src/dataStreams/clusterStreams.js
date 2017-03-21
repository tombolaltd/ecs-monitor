import AWS from 'aws-sdk';
import { Observable } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';

function getClusterArns() {
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.listClusters().promise();
    });
}

function getDescribedClusters(clusterArns) {
    const params = { clusters: clusterArns };
    return awsRequest.create((awsConfig) => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.describeClusters(params).promise();
    });
}


// STREAMS ===============

export const clusterArnStream$ = 
  Observable.timer(0, config.CLUSTER_ARN_REFRESH_INTERVAL * 60000) // timer in minutes
  .flatMap(() => getClusterArns())
  .retryWhen(streamRetryFn(3000))
  .share();

// emits cluster updates
export const clusterStream$ =
    Observable.timer(0, config.CLUSTER_REFRESH_INTERVAL * 1000) // timer in seconds
        .combineLatest(clusterArnStream$)
        .flatMap(([_, clusterArnsResponse]) => getDescribedClusters(clusterArnsResponse.clusterArns))
        .retryWhen(streamRetryFn(3000))
        .map(x => x.clusters)
        .share();