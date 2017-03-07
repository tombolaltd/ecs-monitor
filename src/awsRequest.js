import config from './config';

function handleCreateResult(fn) {
    return function(awsConfig) {
        this.setConfig(awsConfig);
        return fn(awsConfig);
    }
}

const awsRequest = {
    awsConfig: void 0,
    setConfig: function(awsConfig) {
        this.awsConfig = awsConfig;
    },
    create: function(fn) {
        if (this.awsConfig) {
            return fn(this.awsConfig);
        }
        return config.getAwsConfig().then(handleCreateResult(fn).bind(awsRequest));
    }
};


export default awsRequest;