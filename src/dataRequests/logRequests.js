import AWS from 'aws-sdk';
import awsRequest from '../awsRequest';

function describeLogStreamsRequest(prefix, nextToken) {
    return function(awsConfig) {
        const logs = new AWS.CloudWatchLogs(awsConfig);
        // http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html
        return logs.describeLogStreams({
            logGroupName: 'ecs', // todo: pass this in...
            descending: true,
            nextToken: nextToken,
            logStreamNamePrefix: prefix
            // "descending": boolean,
            // "limit": number,
            // "logGroupName": "string",
            // "logStreamNamePrefix": "string",
            // "nextToken": "string",
            // "orderBy": "string"
        }).promise();
    };
}

function getLogEventsByName(logStreamName, nextToken) {
    return function(awsConfig) {
        const logs = new AWS.CloudWatchLogs(awsConfig);
        return logs.getLogEvents({
            logGroupName: 'ecs',
            logStreamName: logStreamName,
            startFromHead: true,
            nextToken: nextToken
            // "endTime": number,
            // "limit": number,
            // "logGroupName": "string",
            // "logStreamName": "string",
            // "nextToken": "string",
            // "startFromHead": boolean,
            // "startTime": number
        }).promise();
    }
}

export function getLogs(prefix) {
    const reqFn = describeLogStreamsRequest(prefix);
    return awsRequest.create(reqFn);
}

export function getLogEvents(logStreamName) {
    const reqFn = getLogEventsByName(logStreamName);
    return awsRequest.create(reqFn);
}