import NProgress from 'nprogress';
import { nameFromAwsArn } from '../utils/stringFormatting';
import { progressBarEvent$, newDeploymentEvent$, settingsEvent$ } from './eventStreams';

const handlers = [];

function settingsModalHandler(evt) {
    console.log(evt);
    if (evt.data === 'open') {
        // open settings modal
        const modal = window.$('#primary-settings-modal');
        console.log(modal);
        window.$('#primary-settings-modal').modal();
    } else {
        // close
        window.$('#primary-settings-modal').modal();
    }
}

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
    handlers.push(settingsEvent$.subscribe(settingsModalHandler));
}

export function detachAllPageEventHandlers() {
    for( var i=0; i < handlers.length; i++ ) {
        handlers[i].unsubscribe();
    }
}
