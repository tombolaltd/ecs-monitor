import { Subject } from 'rxjs';


export class Event {
    constructor(sender, data) {
        this.sender = sender;
        this.data = data;
    }
}

export const fullScreenEvent$ = new Subject();
export const progressBarEvent$ = new Subject();