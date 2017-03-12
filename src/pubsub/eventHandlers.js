import NProgress from 'nprogress';
import { progressBarEvent$ } from './eventStreams';

const handlers = [];

function progressBarHandler(evt) {
    if (evt.data === 'start') {
        NProgress.start();
    } else if (evt.data === 'done') {
        NProgress.done();
    }
}

// subscribe and capture the observer for unsubscription
export function attachAllPageEventHandlers() {
    handlers.push(progressBarEvent$.subscribe(progressBarHandler));
}

export function detachAllPageEventHandlers() {
    for( var i=0; i < handlers.length; i++ ) {
        handlers[i].unsubscribe();
    }
}
