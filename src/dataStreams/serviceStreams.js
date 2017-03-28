import AWS from 'aws-sdk';
import { Observable, ReplaySubject } from 'rxjs';
import config from '../config';
import awsRequest from '../awsRequest';
import { streamRetryFn } from './common';
import { clusterArnStream$ } from './clusterStreams';

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
// THIS HAS A 10 SERVICES PER CLUSTER LIMITATION (this is a limitation on the aws request)
// Improvement: split the cluster.serviceArns into groups of 10 maximum and make a describe services request for each.
export const servicesStream$ = 
    Observable.timer(0, config.SERVICE_REFRESH_INTERVAL * 1000) // timer in seconds
    .combineLatest(serviceArnStream$)
    .flatMap(([_, clusters]) => {
        // foreach cluster object - { clusterArn:string, serviceArns:string[] }
        // run a describe services request for each cluster
        const requestPromises = clusters.map(cluster => getDescribedServices(cluster.serviceArns, cluster.clusterArn));
        return Observable.zip(...requestPromises);
    })
    .map(x => x.reduce((acc, y) => acc.concat(y.services), []))
    .retryWhen(streamRetryFn(3000))
    .multicast(() => new ReplaySubject(1))
    .refCount();

// Emits service updates for a particular cluster
// THIS HAS A 10 SERVICES PER CLUSTER LIMITATION (this is a limitation on the aws request)
// Improvement: split the cluster.serviceArns into groups of 10 maximum and make a describe services request for each.
// Note: Case sensitive clusterName
export function serviceStreamForCluster$(clusterName) {
    return Observable.timer(0, config.SERVICE_REFRESH_INTERVAL * 1000) // timer in seconds
            .combineLatest(serviceArnStream$)
            .map(([_, serviceArnsGroupedByCluster]) =>
                serviceArnsGroupedByCluster.find(x => x.clusterArn.indexOf(clusterName) !== -1))
            .flatMap(({serviceArns}) => getDescribedServices(serviceArns, clusterName))
            .retryWhen(streamRetryFn(3000))
            .map(x => x.services)
            .share();
}

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