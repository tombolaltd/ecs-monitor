#!/bin/bash

BUILD_NUMBER=$1
DEPLOY_ENVIRONMENT=$2

echo "build number ::" $BUILD_NUMBER
echo "target environment ::" $DEPLOY_ENVIRONMENT

echo ">> Executing AWS CloudFormation deploy..."
aws cloudformation deploy \
        --stack-name ecs-monitor \
        --template-file deploy/CloudFormation.yml \
        --capabilities "CAPABILITY_IAM" \
        --parameter-overrides \
            ECSMonitorImageTag=v"$BUILD_NUMBER" \
            AWSACCESSKEY="$AWS_ACCESS_KEY_ID" \
            AWSSECRETKEY"$AWS_SECRET_ACCESS_KEY" \
            $(while read -r line || [ -n "$line" ] ; do printf '%s ' "$line" ; done < deploy/"$DEPLOY_ENVIRONMENT"/cloudformation-parameters.txt)