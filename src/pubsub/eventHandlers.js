import NProgress from 'nprogress';
import { nameFromAwsArn } from '../utils/stringFormatting';
import { progressBarEvent$, newDeploymentEvent$ } from './eventStreams';

const handlers = [];

function progressBarHandler(evt) {
    if (evt.data === 'start') {
        NProgress.start();
    } else if (evt.data === 'done') {
        NProgress.done();
    }
}

function deploymentHandler(evt) {
    if (evt.data.message.indexOf('started') !== -1) {
        const taskDefinitionName = nameFromAwsArn(evt.data.deployment.taskDefinition);
        window.Materialize.toast(`DEPLOYMENT OF ${taskDefinitionName} STARTED`, 10000);
    }
}




// subscribe and capture the observer for unsubscription
export function attachAllPageEventHandlers() {
    handlers.push(progressBarEvent$.subscribe(progressBarHandler));
    handlers.push(newDeploymentEvent$.subscribe(deploymentHandler));
}

export function detachAllPageEventHandlers() {
    for( var i=0; i < handlers.length; i++ ) {
        handlers[i].unsubscribe();
    }
}
