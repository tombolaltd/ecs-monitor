import AWS from 'aws-sdk';
import awsConnectionManager from './awsConnectionManager';


const AWS_REGION = 'eu-west-1';

const devCredentials = process.env.NODE_ENV === 'development'
    ? require('../devCredentials.json')
    : void 0;

// always equals 'development' when 'npm start'
// always equals 'production' when 'npm run build'
// cannot be manually overriden - https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables
function getAwsConfig() {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'production') {
            return awsConnectionManager.getAuthenticationDetails().then((auth) => {
                return resolve(new AWS.Config({
                    region: AWS_REGION,
                    credentials: {
                        accessKeyId: auth.Credentials.AccessKeyId,
                        secretAccessKey: auth.Credentials.SecretAccessKey,
                        sessionToken: auth.Credentials.SessionToken
                    }
                }));
            }).catch(reject);
        }

        if (!devCredentials.DEVELOPMENT_AWS_ACCESS_KEY || !devCredentials.DEVELOPMENT_AWS_SECRET_KEY) {
            throw Error(
                `You must specify development AWS keys in the devCredentials.json file.
                Define 2 keys: DEVELOPMENT_AWS_ACCESS_KEY & DEVELOPMENT_AWS_SECRET_KEY`);
        }

        return resolve(new AWS.Config({
            region: AWS_REGION,
            credentials: {
                accessKeyId: devCredentials.DEVELOPMENT_AWS_ACCESS_KEY,
                secretAccessKey: devCredentials.DEVELOPMENT_AWS_SECRET_KEY
            }
        }));
    });
}

export default {
    CLUSTER_ARN_REFRESH_INTERVAL: 10, // minutes
    CLUSTER_REFRESH_INTERVAL: 10, // seconds
    SERVICE_ARN_REFRESH_INTERVAL: 60, // seconds
    SERVICE_REFRESH_INTERVAL: 10, // seconds
    AGGREGATED_SERVICE_EVENT_COUNT: 10,
    TASK_CHURN_DETECTION_BUFFER_COUNT: 3,
    TASK_CHURN_DETECTION_TIME_THRESHOLD: 10, // minutes
    DEFAULT_STATS_REFRESH_INTERVAL: 10, // seconds
    getAwsConfig
};