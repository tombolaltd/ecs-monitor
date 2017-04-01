import AWS from 'aws-sdk';
import awsRequest from '../awsRequest';
import { currentLogGroup } from '../utils/localStorage';

function describeLogStreamsRequest(prefix, nextToken) {
    const orderBy = prefix ? 'LogStreamName' : 'LastEventTime' ;

    // http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html
    return function(awsConfig) {
        const cwLogs = new AWS.CloudWatchLogs(awsConfig);    
        return cwLogs.describeLogStreams({
            logGroupName: currentLogGroup(),
            nextToken: nextToken,
            logStreamNamePrefix: prefix,
            orderBy: orderBy,
            descending: true
        }).promise();
    };
}

function getLogEventsByName(logStreamName, nextToken) {
    // http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_GetLogEvents.html
    return function(awsConfig) {
        const cwLogs = new AWS.CloudWatchLogs(awsConfig);
        return cwLogs.getLogEvents({
            logGroupName: currentLogGroup(),
            logStreamName: logStreamName,
            startFromHead: true,
            nextToken: nextToken
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