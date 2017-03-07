import AWS from 'aws-sdk';
import axios from 'axios';

let latestAWSAuthenticationRequestResult;

function getTemporaryCredentials() {
    return axios.post('/authenticate');
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