import { Subject } from 'rxjs';
import { aggregatedServiceDeploymentStream$ } from '../dataStreams/serviceStreams';
import { SERVICE_REFRESH_INTERVAL } from '../config';
import moment from 'moment';


function isNewDeployment(deployment) {
    const deploymentCreatedAt = moment(deployment.createdAt);
    const interval = moment().subtract(SERVICE_REFRESH_INTERVAL + 5, 'seconds');
    return deploymentCreatedAt.isSameOrAfter(interval);
}

export class Event {
    constructor(sender, data) {
        this.sender = sender;
        this.data = data;
    }
}

export const fullScreenEvent$ = new Subject();
export const progressBarEvent$ = new Subject();

export const newDeploymentEvent$ =
    aggregatedServiceDeploymentStream$(5)
    .flatMap(deployments => deployments)
    .filter(isNewDeployment)
    .do(console.log.bind(console))
    .map(deployment => {
        return new Event(newDeploymentEvent$, {
            message: 'deployment started',
            deployment: deployment
        })
    });