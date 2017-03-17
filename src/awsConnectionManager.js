import AWS from 'aws-sdk';
import axios from 'axios';
import moment from 'moment';
import { MOUNTING_PATH } from '../globalConfig';

const SESSIONSTORAGE_AUTH_KEY = 'auth';


function getTemporaryCredentials() {
    return axios.post(MOUNTING_PATH + 'authenticate');
}

function storeLatest(result) {
    if (!result) {
        return;
    }

    window.sessionStorage.setItem(SESSIONSTORAGE_AUTH_KEY, JSON.stringify(result.data));
    
    return result.data;
}

export default {
    AWS,
    getAuthenticationDetails: function getAuthenticationDetails() {
        return new Promise((res) => {
            const sessionAuthEntry = window.sessionStorage.getItem(SESSIONSTORAGE_AUTH_KEY);

            if (sessionAuthEntry) {
                const parsedAuthEntry = JSON.parse(sessionAuthEntry);
                const expiration = moment(parsedAuthEntry.Credentials.Expiration);
                const now = moment();

                // check expiry, if it's past, get fresh credentials.
                if (now.isSameOrAfter(expiration)) {
                    window.sessionStorage.removeItem(SESSIONSTORAGE_AUTH_KEY);
                } else {
                    return res(parsedAuthEntry);
                }
            }

            return getTemporaryCredentials().then(storeLatest).then(res);
        });
    }
};