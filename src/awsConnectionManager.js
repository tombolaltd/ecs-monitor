import AWS from 'aws-sdk';
import axios from 'axios';
import { MOUNTING_PATH } from '../globalConfig';

let latestAWSAuthenticationRequestResult;

function getTemporaryCredentials() {
    return axios.post(MOUNTING_PATH + 'authenticate');
}

function storeLatest(result) {
    if (!result) {
        return;
    }

    latestAWSAuthenticationRequestResult = result.data;
    return result.data;
}

export default {
    AWS,
    getAuthenticationDetails: function getAuthenticationDetails() {
        return new Promise((res) => {
            if (latestAWSAuthenticationRequestResult) {
                return res(latestAWSAuthenticationRequestResult);
            }

            return getTemporaryCredentials().then(storeLatest).then(res);
        });
    }
};