import AWS from 'aws-sdk';
import { Observable, ReplaySubject } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';
import { clusterArnStream$ } from './clusterStreams';
import { chunk, flatten } from '../utils/array';

const _serviceStreamCache = {};

function getServiceArns(clusterArn) {
    const params = { cluster: clusterArn };
    return awsRequest.create(awsConfig => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.listServices(params).promise();
    });
}

function getDescribedServices(serviceArns, clusterNameOrArn) {
    const params = { services: serviceArns, cluster: clusterNameOrArn || 'default' };
    return awsRequest.create(awsConfig => {
        const ecs = new AWS.ECS(awsConfig);
        return ecs.describeServices(params).promise();
    });
}


// STREAMS ===============

// Manages multiple clusters
export const serviceArnStream$ = 
  Observable.timer(0, config.SERVICE_ARN_REFRESH_INTERVAL * 1000) // timer in seconds
  .combineLatest(clusterArnStream$)
  .switchMap(([_, clusterArnResponse]) => {
    // foreach cluster arn
    // run a get service request and project the result into an object containing the clusterArn string and the resulting arns.
    const serviceArnsRequestObservables$ = clusterArnResponse.clusterArns.map(
            clusterArn =>
                Observable.forkJoin(getServiceArns(clusterArn), (resp) => ({ clusterArn, serviceArns: resp.serviceArns })));
        
    // after all observables emit... Emit.
    return Observable.zip(...serviceArnsRequestObservables$);
  })
  // ensure we remove any cluster from the stream which dont contain any services.
  .map(results => results.filter(x => x.serviceArns.length !== 0))
  .retryWhen(streamRetryFn(3000))
  .multicast(() => new ReplaySubject(1))
  .refCount();

// Emits service updates
export const servicesStream$ = 
    Observable.timer(0, config.SERVICE_REFRESH_INTERVAL * 1000) // timer in seconds
    .combineLatest(serviceArnStream$)
    .flatMap(([_, clusters]) => {
        /* foreach cluster object - { clusterArn:string, serviceArns:string[] }
         * run a describe services request for each cluster
         * If there are more than 10 services in the cluster, we need to split it into multiple requests
         * This is an AWS API limitation
         */
        const requestPromises = clusters.map(cluster => {
            if (cluster.serviceArns.length > 10) {
                const serviceArnsInChunks = chunk(cluster.serviceArns, 10);
                const describeRequestPromises = serviceArnsInChunks.map(
                    (serviceArns) => getDescribedServices(serviceArns, cluster.clusterArn));

                return Promise.all(describeRequestPromises);
            } else {
                return getDescribedServices(cluster.serviceArns, cluster.clusterArn);
            }
        })

        return Observable.zip(...requestPromises);
    })
    .map(x => {
        // we want to flatten/concat any arrays inside x first so we can run a reduce over it.
        return flatten(x).reduce((acc, y) => acc.concat(y.services), []) 
    })
    .retryWhen(streamRetryFn(3000))
    .multicast(() => new ReplaySubject(1))
    .refCount();

// Deployment component stream
export function aggregatedServiceDeploymentStream$(deploymentCount) {
    const cacheKey = `aggregatedServiceDeploymentStream::${deploymentCount}`;
    const cachedObs$ = _serviceStreamCache[cacheKey];
    if (cachedObs$) {
        return cachedObs$;
    }

    const obs$ = 
        servicesStream$
        .map(services => {
            return services
                .reduce((acc, x) => acc.concat(x.deployments), [])
                .sort((a,b) => b.createdAt - a.createdAt)
                .slice(0, deploymentCount);
        });
    
    _serviceStreamCache[cacheKey] = obs$;

    return obs$;
}

export const aggregatedEventStream$ =
    servicesStream$
    .map(services => {
        return services
            .reduce((acc, x) => acc.concat(x.events), [])
            .sort((a,b) => b.createdAt - a.createdAt);
    });