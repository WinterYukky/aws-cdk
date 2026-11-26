import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { INTEG_TEST_LATEST_AURORA_POSTGRES } from './db-versions';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IntegTestBaseStack } from './integ-test-base-stack';

const app = new cdk.App();
const stack = new IntegTestBaseStack(app, 'aws-cdk-rds-cluster-custom-endpoint');

const vpc = new ec2.Vpc(stack, 'Vpc', {
  maxAzs: 2,
  natGateways: 0,
  subnetConfiguration: [{ name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
});

const cluster = new rds.DatabaseCluster(stack, 'Cluster', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({ version: INTEG_TEST_LATEST_AURORA_POSTGRES }),
  vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  serverlessV2MinCapacity: 0,
  serverlessV2MaxCapacity: 1,
  writer: rds.ClusterInstance.serverlessV2('writer'),
  readers: [
    rds.ClusterInstance.serverlessV2('reader1'),
    rds.ClusterInstance.serverlessV2('reader2'),
  ],
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

// Static member list: only reader1
const readerEndpoint = cluster.addCustomEndpoint('Reader', {
  endpointIdentifier: 'integ-custom-endpoint-reader',
  endpointType: rds.CustomEndpointType.READER,
  members: rds.CustomEndpointMembers.include([cluster.readerInstances[0]]),
});

// Excluded member list: everything except reader1
const anyEndpoint = cluster.addCustomEndpoint('Any', {
  endpointIdentifier: 'integ-custom-endpoint-any',
  members: rds.CustomEndpointMembers.exclude([cluster.readerInstances[0]]),
});

// All members, generated identifier, created standalone
const allEndpoint = new rds.ClusterCustomEndpoint(stack, 'All', {
  cluster,
  endpointType: rds.CustomEndpointType.ANY,
});

new cdk.CfnOutput(stack, 'ReaderEndpoint', { value: readerEndpoint.endpoint.socketAddress });
new cdk.CfnOutput(stack, 'AnyEndpoint', { value: anyEndpoint.endpoint.socketAddress });
new cdk.CfnOutput(stack, 'AllEndpoint', { value: allEndpoint.endpoint.socketAddress });
new cdk.CfnOutput(stack, 'AllEndpointArn', { value: allEndpoint.endpointArn });

const integ = new IntegTest(app, 'cluster-custom-endpoint-integ', {
  testCases: [stack],
});

integ.assertions.awsApiCall('RDS', 'describeDBClusterEndpoints', {
  DBClusterIdentifier: cluster.clusterIdentifier,
  DBClusterEndpointIdentifier: readerEndpoint.endpointIdentifier,
}).expect(ExpectedResult.objectLike({
  DBClusterEndpoints: [{
    DBClusterEndpointIdentifier: 'integ-custom-endpoint-reader',
    EndpointType: 'CUSTOM',
    CustomEndpointType: 'READER',
    Status: 'available',
    StaticMembers: [cluster.readerInstances[0].instanceIdentifier],
    ExcludedMembers: [],
    Endpoint: readerEndpoint.endpoint.hostname,
    DBClusterEndpointArn: readerEndpoint.endpointArn,
  }],
}));

integ.assertions.awsApiCall('RDS', 'describeDBClusterEndpoints', {
  DBClusterIdentifier: cluster.clusterIdentifier,
  DBClusterEndpointIdentifier: anyEndpoint.endpointIdentifier,
}).expect(ExpectedResult.objectLike({
  DBClusterEndpoints: [{
    DBClusterEndpointIdentifier: 'integ-custom-endpoint-any',
    EndpointType: 'CUSTOM',
    CustomEndpointType: 'ANY',
    Status: 'available',
    StaticMembers: [],
    ExcludedMembers: [cluster.readerInstances[0].instanceIdentifier],
  }],
}));

integ.assertions.awsApiCall('RDS', 'describeDBClusterEndpoints', {
  DBClusterIdentifier: cluster.clusterIdentifier,
  DBClusterEndpointIdentifier: allEndpoint.endpointIdentifier,
}).expect(ExpectedResult.objectLike({
  DBClusterEndpoints: [{
    EndpointType: 'CUSTOM',
    CustomEndpointType: 'ANY',
    Status: 'available',
    StaticMembers: [],
    ExcludedMembers: [],
  }],
}));
