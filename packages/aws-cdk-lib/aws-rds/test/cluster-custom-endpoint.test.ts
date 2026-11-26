import { Match, Template } from '../../assertions';
import * as ec2 from '../../aws-ec2';
import * as cdk from '../../core';
import * as rds from '../lib';
import { acknowledgeTestValidationRules } from './util';

let stack: cdk.Stack;
let vpc: ec2.Vpc;
let cluster: rds.DatabaseCluster;

describe('cluster custom endpoint', () => {
  beforeEach(() => {
    stack = new cdk.Stack(undefined, 'Stack', { env: { account: '12345', region: 'us-test-1' } });
    acknowledgeTestValidationRules(stack);
    vpc = new ec2.Vpc(stack, 'VPC');
    cluster = new rds.DatabaseCluster(stack, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_16_4 }),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: [
        rds.ClusterInstance.serverlessV2('reader1'),
        rds.ClusterInstance.serverlessV2('reader2'),
      ],
      vpc,
    });
  });

  test('creates an ANY endpoint with all members and a generated identifier by default', () => {
    // WHEN
    const endpoint = new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      DBClusterIdentifier: { Ref: 'DatabaseB269D8BB' },
      DBClusterEndpointIdentifier: Match.stringLikeRegexp('^stack-endpoint-[0-9a-f]{8}$'),
      CustomEndpointType: 'ANY',
      StaticMembers: Match.absent(),
      ExcludedMembers: Match.absent(),
      Tags: Match.absent(),
    });
    expect(stack.resolve(endpoint.endpointIdentifier)).toMatch(/^stack-endpoint-[0-9a-f]{8}$/);
  });

  test('exposes the endpoint, identifier, ARN and reference', () => {
    // WHEN
    const endpoint = new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      endpointIdentifier: 'my-endpoint',
    });

    // THEN
    const logicalId = stack.getLogicalId(endpoint.node.defaultChild as cdk.CfnResource);
    expect(stack.resolve(endpoint.endpointIdentifier)).toEqual('my-endpoint');
    expect(stack.resolve(endpoint.endpointArn)).toEqual({ 'Fn::GetAtt': [logicalId, 'DBClusterEndpointArn'] });
    expect(stack.resolve(endpoint.dbClusterEndpointRef.dbClusterEndpointArn)).toEqual({ 'Fn::GetAtt': [logicalId, 'DBClusterEndpointArn'] });
    expect(stack.resolve(endpoint.endpoint.hostname)).toEqual({ 'Fn::GetAtt': [logicalId, 'Endpoint'] });
    expect(stack.resolve(endpoint.endpoint.port)).toEqual({ 'Fn::GetAtt': ['DatabaseB269D8BB', 'Endpoint.Port'] });
    expect(stack.resolve(endpoint.endpoint.socketAddress)).toEqual({
      'Fn::Join': ['', [
        { 'Fn::GetAtt': [logicalId, 'Endpoint'] },
        ':',
        { 'Fn::GetAtt': ['DatabaseB269D8BB', 'Endpoint.Port'] },
      ]],
    });
  });

  test('uses the explicit identifier for the physical name', () => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      endpointIdentifier: 'my-endpoint',
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      DBClusterEndpointIdentifier: 'my-endpoint',
    });
  });

  test.each([
    rds.CustomEndpointType.READER,
    rds.CustomEndpointType.WRITER,
    rds.CustomEndpointType.ANY,
  ])('renders the endpoint type %s', (endpointType) => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster, endpointType });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      CustomEndpointType: endpointType,
    });
  });

  test('renders included members as StaticMembers referencing the instances', () => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      endpointType: rds.CustomEndpointType.READER,
      members: rds.CustomEndpointMembers.include([cluster.readerInstances[0]]),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      CustomEndpointType: 'READER',
      StaticMembers: [{ Ref: 'Databasereader1F54479B8' }],
      ExcludedMembers: Match.absent(),
    });
    expect(stack.resolve(cluster.readerInstances[0].instanceIdentifier)).toEqual({ Ref: 'Databasereader1F54479B8' });
  });

  test('renders excluded members as ExcludedMembers referencing the instances', () => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      members: rds.CustomEndpointMembers.exclude([cluster.readerInstances[0], cluster.readerInstances[1]]),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      StaticMembers: Match.absent(),
      ExcludedMembers: [
        stack.resolve(cluster.readerInstances[0].instanceIdentifier),
        stack.resolve(cluster.readerInstances[1].instanceIdentifier),
      ],
    });
  });

  test('accepts a standalone DatabaseInstance and imported instances as members', () => {
    // GIVEN
    const imported = rds.DatabaseInstance.fromDatabaseInstanceAttributes(stack, 'Imported', {
      instanceIdentifier: 'imported-instance',
      instanceEndpointAddress: 'imported.example.com',
      port: 5432,
      securityGroups: [],
    });

    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      members: rds.CustomEndpointMembers.include([imported]),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      StaticMembers: ['imported-instance'],
    });
  });

  test('renders tags', () => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      tags: { Environment: 'test', Team: 'data' },
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      Tags: [
        { Key: 'Environment', Value: 'test' },
        { Key: 'Team', Value: 'data' },
      ],
    });
  });

  test('omits Tags when the tags map is empty', () => {
    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster, tags: {} });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      Tags: Match.absent(),
    });
  });

  test('can be added through DatabaseCluster.addCustomEndpoint()', () => {
    // WHEN
    const endpoint = cluster.addCustomEndpoint('Readers', {
      endpointType: rds.CustomEndpointType.READER,
      members: rds.CustomEndpointMembers.exclude([cluster.readerInstances[1]]),
    });

    // THEN
    expect(endpoint.node.scope).toBe(cluster);
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      DBClusterIdentifier: { Ref: 'DatabaseB269D8BB' },
      DBClusterEndpointIdentifier: Match.stringLikeRegexp('^stack-database-readers-[0-9a-f]{8}$'),
      CustomEndpointType: 'READER',
      ExcludedMembers: [stack.resolve(cluster.readerInstances[1].instanceIdentifier)],
    });
  });

  test('can be added through DatabaseCluster.addCustomEndpoint() without options', () => {
    // WHEN
    cluster.addCustomEndpoint('Any');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      CustomEndpointType: 'ANY',
      StaticMembers: Match.absent(),
      ExcludedMembers: Match.absent(),
    });
  });

  test('can be added to an imported cluster', () => {
    // GIVEN
    const imported = rds.DatabaseCluster.fromDatabaseClusterAttributes(stack, 'ImportedCluster', {
      clusterIdentifier: 'imported-cluster',
      clusterEndpointAddress: 'imported.cluster.example.com',
      port: 5432,
    });

    // WHEN
    const endpoint = new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster: imported,
      endpointIdentifier: 'imported-cluster-endpoint',
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      DBClusterIdentifier: 'imported-cluster',
      DBClusterEndpointIdentifier: 'imported-cluster-endpoint',
    });
    expect(endpoint.endpoint.port).toEqual(5432);
  });

  test('accepts a token as the identifier without validation', () => {
    // GIVEN
    const identifier = new cdk.CfnParameter(stack, 'Identifier', { type: 'String' });

    // WHEN
    new rds.ClusterCustomEndpoint(stack, 'Endpoint', {
      cluster,
      endpointIdentifier: identifier.valueAsString,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::RDS::DBClusterEndpoint', {
      DBClusterEndpointIdentifier: { Ref: 'Identifier' },
    });
  });

  test.each([
    ['', 'must be between 1 and 63 characters long, got 0 characters'],
    ['a'.repeat(64), 'must be between 1 and 63 characters long, got 64 characters'],
  ])('fails for identifier %j with an invalid length', (endpointIdentifier, message) => {
    expect(() => {
      new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster, endpointIdentifier });
    }).toThrow(message);
  });

  test.each([
    'MyEndpoint',
    '1endpoint',
    '-endpoint',
    'endpoint-',
    'my--endpoint',
    'my_endpoint',
    'my.endpoint',
  ])('fails for identifier %j that does not match the allowed pattern', (endpointIdentifier) => {
    expect(() => {
      new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster, endpointIdentifier });
    }).toThrow(/must start with a letter and only contain lowercase letters, digits and non-consecutive hyphens/);
  });

  test.each([
    'a',
    'my-endpoint',
    'endpoint1-2-3',
    'a'.repeat(63),
  ])('accepts valid identifier %j', (endpointIdentifier) => {
    expect(() => {
      new rds.ClusterCustomEndpoint(stack, 'Endpoint', { cluster, endpointIdentifier });
    }).not.toThrow();
  });

  test('fails when include() is given an empty list', () => {
    expect(() => {
      rds.CustomEndpointMembers.include([]);
    }).toThrow('`CustomEndpointMembers.include()` requires at least one instance');
  });

  test('fails when exclude() is given an empty list', () => {
    expect(() => {
      rds.CustomEndpointMembers.exclude([]);
    }).toThrow('`CustomEndpointMembers.exclude()` requires at least one instance');
  });

  test('can be imported from attributes', () => {
    // WHEN
    const endpoint = rds.ClusterCustomEndpoint.fromClusterCustomEndpointAttributes(stack, 'Imported', {
      endpointIdentifier: 'my-endpoint',
      endpointAddress: 'my-endpoint.cluster-custom-abcdefghijkl.us-test-1.rds.amazonaws.com',
      port: 5432,
    });

    // THEN
    expect(endpoint.endpointIdentifier).toEqual('my-endpoint');
    expect(endpoint.endpoint.socketAddress).toEqual('my-endpoint.cluster-custom-abcdefghijkl.us-test-1.rds.amazonaws.com:5432');
    const expectedArn = { 'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':rds:us-test-1:12345:cluster-endpoint:my-endpoint']] };
    expect(stack.resolve(endpoint.endpointArn)).toEqual(expectedArn);
    expect(stack.resolve(endpoint.dbClusterEndpointRef.dbClusterEndpointArn)).toEqual(expectedArn);
    Template.fromStack(stack).resourceCountIs('AWS::RDS::DBClusterEndpoint', 0);
  });
});
