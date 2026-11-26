import type { Construct } from 'constructs';
import type { IDatabaseCluster } from './cluster-ref';
import { Endpoint } from './endpoint';
import { CfnDBClusterEndpoint } from './rds.generated';
import type { CfnTag, IResource } from '../../core';
import { ArnFormat, Lazy, Names, Resource, Stack, Token } from '../../core';
import { UnscopedValidationError, ValidationError } from '../../core/lib/errors';
import { memoizedGetter } from '../../core/lib/helpers-internal';
import { addConstructMetadata } from '../../core/lib/metadata-resource';
import { lit } from '../../core/lib/private/literal-string';
import { propertyInjectable } from '../../core/lib/prop-injectable';
import type { aws_rds } from '../../interfaces';

/**
 * The type of DB instances a custom endpoint of an Aurora cluster can route connections to.
 *
 * @see https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Custom
 */
export enum CustomEndpointType {
  /**
   * The endpoint only routes connections to reader (replica) instances.
   */
  READER = 'READER',

  /**
   * The endpoint only routes connections to the writer (primary) instance.
   */
  WRITER = 'WRITER',

  /**
   * The endpoint routes connections to both the writer and the reader instances.
   */
  ANY = 'ANY',
}

/**
 * Rendered CloudFormation member lists of a custom endpoint.
 */
interface CustomEndpointMembersConfig {
  readonly staticMembers?: string[];
  readonly excludedMembers?: string[];
}

/**
 * The DB instances that are members of a custom endpoint of an Aurora cluster.
 *
 * A custom endpoint either has a static list of members (`include()`), or is made up of all
 * instances in the cluster except an excluded list (`exclude()`), or of all instances (`all()`).
 * In all cases, only instances matching the `CustomEndpointType` of the endpoint receive connections.
 */
export class CustomEndpointMembers {
  /**
   * All DB instances of the cluster are members of the endpoint.
   *
   * Instances added to the cluster later automatically become members.
   */
  public static all(): CustomEndpointMembers {
    return new CustomEndpointMembers();
  }

  /**
   * Only the given DB instances are members of the endpoint (a static member list).
   *
   * Instances added to the cluster later are not members unless this list is updated.
   *
   * @param instances the DB instances that are members of the endpoint, must not be empty
   */
  public static include(instances: aws_rds.IDBInstanceRef[]): CustomEndpointMembers {
    if (instances.length === 0) {
      throw new UnscopedValidationError(lit`CustomEndpointMembersEmpty`, '`CustomEndpointMembers.include()` requires at least one instance, got an empty list; use `CustomEndpointMembers.all()` to include all instances');
    }
    return new CustomEndpointMembers(instances, undefined);
  }

  /**
   * All DB instances of the cluster except the given ones are members of the endpoint.
   *
   * Instances added to the cluster later automatically become members.
   *
   * @param instances the DB instances that are not members of the endpoint, must not be empty
   */
  public static exclude(instances: aws_rds.IDBInstanceRef[]): CustomEndpointMembers {
    if (instances.length === 0) {
      throw new UnscopedValidationError(lit`CustomEndpointMembersEmpty`, '`CustomEndpointMembers.exclude()` requires at least one instance, got an empty list; use `CustomEndpointMembers.all()` to include all instances');
    }
    return new CustomEndpointMembers(undefined, instances);
  }

  private constructor(
    private readonly staticMembers?: aws_rds.IDBInstanceRef[],
    private readonly excludedMembers?: aws_rds.IDBInstanceRef[],
  ) {}

  /**
   * Render the member lists for the `AWS::RDS::DBClusterEndpoint` resource.
   *
   * @internal
   */
  public _render(): CustomEndpointMembersConfig {
    return {
      staticMembers: this.staticMembers?.map(instance => instance.dbInstanceRef.dbInstanceIdentifier),
      excludedMembers: this.excludedMembers?.map(instance => instance.dbInstanceRef.dbInstanceIdentifier),
    };
  }
}

/**
 * A custom endpoint of an Aurora DB cluster.
 */
export interface IClusterCustomEndpoint extends IResource, aws_rds.IDBClusterEndpointRef {
  /**
   * The identifier of the custom endpoint.
   *
   * @attribute
   */
  readonly endpointIdentifier: string;

  /**
   * The ARN of the custom endpoint.
   *
   * @attribute DBClusterEndpointArn
   */
  readonly endpointArn: string;

  /**
   * The connection endpoint (DNS address and port) of the custom endpoint.
   *
   * @attribute Endpoint
   */
  readonly endpoint: Endpoint;
}

/**
 * Options for a custom endpoint of an Aurora DB cluster.
 */
export interface ClusterCustomEndpointOptions {
  /**
   * The identifier of the custom endpoint.
   *
   * The identifier must be between 1 and 63 characters long, start with a letter, and only contain
   * lowercase letters, digits and hyphens. It is part of the DNS address of the endpoint and must be
   * unique within the AWS Region and account, across all custom endpoints of all clusters.
   *
   * @default - a CDK generated identifier
   */
  readonly endpointIdentifier?: string;

  /**
   * The type of DB instances the endpoint routes connections to.
   *
   * @default CustomEndpointType.ANY
   */
  readonly endpointType?: CustomEndpointType;

  /**
   * The DB instances that are members of the endpoint.
   *
   * @default CustomEndpointMembers.all()
   */
  readonly members?: CustomEndpointMembers;

  /**
   * Tags to apply to the custom endpoint.
   *
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/**
 * Properties for a custom endpoint of an Aurora DB cluster.
 */
export interface ClusterCustomEndpointProps extends ClusterCustomEndpointOptions {
  /**
   * The Aurora DB cluster to create the custom endpoint for.
   *
   * [disable-awslint:prefer-ref-interface] the port of the cluster endpoint is required
   * to expose the `endpoint` of the custom endpoint.
   */
  readonly cluster: IDatabaseCluster;
}

/**
 * Attributes of an existing custom endpoint of an Aurora DB cluster.
 */
export interface ClusterCustomEndpointAttributes {
  /**
   * The identifier of the custom endpoint.
   */
  readonly endpointIdentifier: string;

  /**
   * The DNS address of the custom endpoint.
   */
  readonly endpointAddress: string;

  /**
   * The port the custom endpoint listens on.
   */
  readonly port: number;
}

/**
 * Pattern an identifier of a custom endpoint must match, see
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbclusterendpoint.html
 */
const ENDPOINT_IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const ENDPOINT_IDENTIFIER_MAX_LENGTH = 63;

abstract class ClusterCustomEndpointBase extends Resource implements IClusterCustomEndpoint {
  public abstract readonly endpointIdentifier: string;
  public abstract readonly endpointArn: string;
  public abstract readonly endpoint: Endpoint;

  /**
   * A reference to this custom endpoint
   */
  public get dbClusterEndpointRef(): aws_rds.DBClusterEndpointReference {
    return {
      dbClusterEndpointArn: this.endpointArn,
    };
  }
}

/**
 * A custom endpoint of an Aurora DB cluster.
 *
 * A custom endpoint routes connections to a chosen subset of the DB instances of a cluster,
 * in addition to the cluster (writer) and reader endpoints that every Aurora cluster has.
 *
 * @see https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Custom
 * @resource AWS::RDS::DBClusterEndpoint
 */
@propertyInjectable
export class ClusterCustomEndpoint extends ClusterCustomEndpointBase {
  /**
   * Uniquely identifies this class.
   */
  public static readonly PROPERTY_INJECTION_ID: string = 'aws-cdk-lib.aws-rds.ClusterCustomEndpoint';

  /**
   * Import an existing custom endpoint of an Aurora DB cluster.
   */
  public static fromClusterCustomEndpointAttributes(scope: Construct, id: string, attrs: ClusterCustomEndpointAttributes): IClusterCustomEndpoint {
    class Import extends ClusterCustomEndpointBase {
      public readonly endpointIdentifier = attrs.endpointIdentifier;
      public readonly endpoint = new Endpoint(attrs.endpointAddress, attrs.port);

      @memoizedGetter
      public get endpointArn(): string {
        return Stack.of(this).formatArn({
          service: 'rds',
          resource: 'cluster-endpoint',
          arnFormat: ArnFormat.COLON_RESOURCE_NAME,
          resourceName: this.endpointIdentifier,
        });
      }
    }
    return new Import(scope, id);
  }

  public readonly endpointIdentifier: string;
  public readonly endpointArn: string;
  public readonly endpoint: Endpoint;

  constructor(scope: Construct, id: string, props: ClusterCustomEndpointProps) {
    super(scope, id, {
      physicalName: props.endpointIdentifier ?? Lazy.string({
        produce: () => Names.uniqueResourceName(this, { maxLength: ENDPOINT_IDENTIFIER_MAX_LENGTH, separator: '-' }).toLowerCase(),
      }),
    });
    // Enhanced CDK Analytics Telemetry
    addConstructMetadata(this, props);

    if (props.endpointIdentifier !== undefined && !Token.isUnresolved(props.endpointIdentifier)) {
      validateEndpointIdentifier(this, props.endpointIdentifier);
    }

    const members = (props.members ?? CustomEndpointMembers.all())._render();

    const resource = new CfnDBClusterEndpoint(this, 'Resource', {
      dbClusterIdentifier: props.cluster.clusterIdentifier,
      dbClusterEndpointIdentifier: this.physicalName,
      customEndpointType: props.endpointType ?? CustomEndpointType.ANY,
      staticMembers: members.staticMembers,
      excludedMembers: members.excludedMembers,
      tags: renderTags(props.tags),
    });

    this.endpointIdentifier = this.physicalName;
    this.endpointArn = this.getResourceArnAttribute(resource.attrDbClusterEndpointArn, {
      service: 'rds',
      resource: 'cluster-endpoint',
      arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      resourceName: this.physicalName,
    });
    this.endpoint = new Endpoint(resource.attrEndpoint, props.cluster.clusterEndpoint.port);
  }
}

function validateEndpointIdentifier(scope: Construct, endpointIdentifier: string): void {
  if (endpointIdentifier.length < 1 || endpointIdentifier.length > ENDPOINT_IDENTIFIER_MAX_LENGTH) {
    throw new ValidationError(lit`InvalidCustomEndpointIdentifierLength`, `\`endpointIdentifier\` must be between 1 and ${ENDPOINT_IDENTIFIER_MAX_LENGTH} characters long, got ${endpointIdentifier.length} characters: ${JSON.stringify(endpointIdentifier)}`, scope);
  }
  if (!ENDPOINT_IDENTIFIER_PATTERN.test(endpointIdentifier)) {
    throw new ValidationError(lit`InvalidCustomEndpointIdentifier`, `\`endpointIdentifier\` must start with a letter and only contain lowercase letters, digits and non-consecutive hyphens, and must not end with a hyphen, got ${JSON.stringify(endpointIdentifier)}`, scope);
  }
}

function renderTags(tags?: { [key: string]: string }): CfnTag[] | undefined {
  if (tags === undefined) {
    return undefined;
  }
  const entries = Object.entries(tags);
  return entries.length === 0 ? undefined : entries.map(([key, value]) => ({ key, value }));
}
