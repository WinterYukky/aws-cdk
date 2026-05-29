import type { IInputTransformation, IPipe, ITarget, TargetConfig } from '@aws-cdk/aws-pipes-alpha';
import * as cdk from 'aws-cdk-lib';
import type {
  IConnectable,
  ISecurityGroup,
  IVpc,
  SubnetSelection,
} from 'aws-cdk-lib/aws-ec2';
import {
  Connections,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import type {
  CapacityProviderStrategy,
  FargatePlatformVersion,
  ICluster,
  ITaskDefinition,
  PlacementConstraint,
  PlacementStrategy,
} from 'aws-cdk-lib/aws-ecs';
import {
  Compatibility,
  LaunchType,
  NetworkMode,
  PropagatedTagSource,
} from 'aws-cdk-lib/aws-ecs';
import type { IRole } from 'aws-cdk-lib/aws-iam';
import { Grant } from 'aws-cdk-lib/aws-iam';
import type { CfnPipe } from 'aws-cdk-lib/aws-pipes';

/**
 * Compute configuration for an ECS task target.
 *
 * The values are merged into the ECS task parameters by `EcsTaskTarget`.
 */
export interface EcsTaskTargetComputeConfig {
  /**
   * The launch type on which to run the task.
   *
   * @default - No launch type (a capacity provider strategy is used)
   */
  readonly launchType?: LaunchType;
  /**
   * The platform version on which to run the task.
   *
   * Only applies to the Fargate launch type.
   *
   * @default - ECS will set the Fargate platform version to 'LATEST'
   */
  readonly platformVersion?: FargatePlatformVersion;
  /**
   * The capacity provider strategy to use for the task.
   *
   * @default - No capacity provider strategy (the cluster's default strategy is used)
   */
  readonly capacityProviderStrategy?: CapacityProviderStrategy[];
}

/**
 * Options for Fargate launch type compute
 */
export interface FargateLaunchTypeComputeOptions {
  /**
   * The platform version on which to run your task
   *
   * Unless you have specific compatibility requirements, you don't need to specify this.
   *
   * @see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/platform_versions.html
   *
   * @default - ECS will set the Fargate platform version to 'LATEST'
   */
  readonly platformVersion?: FargatePlatformVersion;
}

/**
 * The compute on which to run an ECS task target.
 *
 * Use one of the static factory methods to select how the task is launched.
 * This encapsulates the mutually exclusive choice between a launch type and a
 * capacity provider strategy, together with launch-type specific options, so
 * that callers do not need to know which ECS task parameters are valid for each
 * launch type.
 */
export abstract class EcsTaskTargetCompute {
  /**
   * Use EC2 launch type
   */
  static ec2LaunchType(): EcsTaskTargetCompute {
    return new LaunchTypeCompute(LaunchType.EC2);
  }
  /**
   * Use Fargate launch type
   */
  static fargateLaunchType(options?: FargateLaunchTypeComputeOptions): EcsTaskTargetCompute {
    return new LaunchTypeCompute(LaunchType.FARGATE, options?.platformVersion);
  }
  /**
   * Use External launch type
   */
  static externalLaunchType(): EcsTaskTargetCompute {
    return new LaunchTypeCompute(LaunchType.EXTERNAL);
  }
  /**
   * Use the cluster's default capacity provider strategy
   */
  static defaultCapacityProviderStrategy(): EcsTaskTargetCompute {
    return new CapacityProviderStrategyCompute();
  }
  /**
   * Use a custom capacity provider strategy
   */
  static capacityProviderStrategy(capacityProviderStrategy: CapacityProviderStrategy[]): EcsTaskTargetCompute {
    return new CapacityProviderStrategyCompute(capacityProviderStrategy);
  }

  /**
   * Bind the compute configuration to the pipe.
   */
  public abstract bind(pipe: IPipe): EcsTaskTargetComputeConfig;
}

class LaunchTypeCompute extends EcsTaskTargetCompute {
  constructor(
    private readonly launchType: LaunchType,
    private readonly platformVersion?: FargatePlatformVersion,
  ) {
    super();
  }
  public bind(_pipe: IPipe): EcsTaskTargetComputeConfig {
    return {
      launchType: this.launchType,
      platformVersion: this.platformVersion,
    };
  }
}

class CapacityProviderStrategyCompute extends EcsTaskTargetCompute {
  constructor(private readonly capacityProviderStrategy?: CapacityProviderStrategy[]) {
    super();
  }
  public bind(_pipe: IPipe): EcsTaskTargetComputeConfig {
    return {
      capacityProviderStrategy: this.capacityProviderStrategy,
    };
  }
}
/**
 * An environment variable to be set in the container run as a task
 */
export interface EcsEnvironmentVariable {
  /**
   * The name of the key-value pair.
   * For environment variables, this is the name of the environment variable.
   */
  readonly name: string;
  /**
   * The value of the key-value pair.
   * For environment variables, this is the value of the environment variable.
   */
  readonly value: string;
}

/**
 * Container override settings
 */
export interface ContainerOverride {
  /**
   * Name of the container inside the task definition
   */
  readonly containerName: string;
  /**
   * Command to run inside the container
   *
   * @default - Default command
   */
  readonly command?: string[];
  /**
   * Variables to set in the container's environment
   * @default - No environment variables.
   */
  readonly environment?: EcsEnvironmentVariable[];
  /**
   * The number of cpu units reserved for the container
   *
   * @default - The default value from the task definition.
   */
  readonly cpu?: number;
  /**
   * The hard limit of memory to present to the container.
   *
   * @default - The default value from the task definition.
   */
  readonly memory?: cdk.Size;
  /**
   * The soft limit of memory to reserve for the container.
   *
   * @default - The default value from the task definition.
   */
  readonly memoryReservation?: cdk.Size;
}

/**
 * Properties for EcsTaskTarget
 */
export interface EcsTaskTargetProps {
  /**
   * Task Definition of the task that should be started
   */
  readonly taskDefinition: ITaskDefinition;
  /**
   * How many tasks should be started when this event is triggered
   *
   * @default 1
   */
  readonly taskCount?: number;
  /**
   * The compute configuration for the ECS task
   *
   * @default - The computing option for LaunchType is automatically set according to the compatibility of the TaskDefinition.
   * If both EC2 and Fargate are present, the cluster's default capacity strategy will be selected.
   */
  readonly compute?: EcsTaskTargetCompute;
  /**
   * Existing security groups to use for the task's ENIs
   *
   * (Only applicable in case the TaskDefinition is configured for AwsVpc networking)
   *
   * @default A new security group is created
   */
  readonly securityGroups?: ISecurityGroup[];
  /**
   * In what subnets to place the task's ENIs
   *
   * (Only applicable in case the TaskDefinition is configured for AwsVpc networking)
   *
   * @default Private subnets
   */
  readonly subnetSelection?: SubnetSelection;
  /**
   * Specifies whether the task's elastic network interface receives a public IP address.
   * You can specify `true` only when the launch type is FARGATE.
   *
   * @default false
   */
  readonly assignPublicIp?: boolean;
  /**
   * When this parameter is enabled, Amazon ECS automatically tags your tasks with two tags corresponding to the cluster and service names.
   * These tags allow you to identify tasks easily in your AWS Cost and Usage Report.
   *
   * @default - true
   */
  readonly enableECSManagedTags?: boolean;
  /**
   * When this parameter is enabled, your tasks will be enabled for Amazon ECS Exec
   * which allows you to directly interact with the containers using an interactive shell.
   *
   * @default - false
   */
  readonly enableExecuteCommand?: boolean;
  /**
   * Container setting overrides
   *
   * Key is the name of the container to override, value is the
   * values you want to override.
   *
   * @default - No overrides
   */
  readonly containerOverrides?: ContainerOverride[];
  /**
   * The input transformation to apply to the message before sending it to the target.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetparameters.html#cfn-pipes-pipe-pipetargetparameters-inputtemplate
   * @default - none
   */
  readonly inputTransformation?: IInputTransformation;
  /**
   * Specifies an Amazon ECS task group for the task.
   *
   * @default - No group
   */
  readonly group?: string;
  /**
   * The placement constraints to use for tasks in the service.
   *
   * @default - No constraints
   */
  readonly placementConstraints?: PlacementConstraint[];
  /**
   * The placement strategies to use for tasks in the service.
   *
   * @default - No strategies
   */
  readonly placementStrategies?: PlacementStrategy[];
  /**
   * Specifies whether to propagate the tags from the task definition to the task.
   *
   * Only `TASK_DEFINITION` is supported for EventBridge Pipes.
   *
   * @default - Tags are not propagated
   */
  readonly propagateTags?: PropagatedTagSource;
  /**
   * The reference ID to use for the task.
   *
   * @default - No reference ID
   */
  readonly referenceId?: string;
  /**
   * The cpu override for the task.
   *
   * @default - No override
   */
  readonly cpu?: string;
  /**
   * The memory override for the task.
   *
   * @default - No override
   */
  readonly memory?: string;
  /**
   * The ephemeral storage setting override for the task.
   *
   * Only supported for tasks hosted on Fargate using platform version 1.4.0 or later.
   *
   * @default - No override
   */
  readonly ephemeralStorage?: cdk.Size;
  /**
   * The task execution IAM role override for the task.
   *
   * @default - No override
   */
  readonly executionRole?: IRole;
  /**
   * The IAM role that containers in this task can assume.
   *
   * @default - No override
   */
  readonly taskRole?: IRole;
}

/**
 * An EventBridge Pipes target that sends messages to an ECS task
 */
export class EcsTaskTarget implements ITarget, IConnectable {
  readonly connections: Connections;
  private readonly cluster: ICluster;
  private readonly taskDefinition: ITaskDefinition;
  private readonly compute: EcsTaskTargetCompute;

  constructor(cluster: ICluster, private readonly props: EcsTaskTargetProps) {
    this.cluster = cluster;
    this.taskDefinition = props.taskDefinition;
    this.compute = props.compute ?? this.getDefaultCompute(props.taskDefinition);

    // Security groups (and the awsvpc network configuration) are only relevant
    // when the task definition uses the awsvpc network mode.
    const useAwsvpc = this.taskDefinition.networkMode === NetworkMode.AWS_VPC;
    this.connections = new Connections({
      securityGroups: useAwsvpc
        ? props.securityGroups ?? [
          (this.taskDefinition.node.tryFindChild('SecurityGroup') as ISecurityGroup)
            ?? this.createDefaultSecurityGroup(cluster.vpc),
        ]
        : [],
    });
  }
  get targetArn(): string {
    return this.cluster.clusterArn;
  }
  bind(pipe: IPipe): TargetConfig {
    const { launchType, platformVersion, capacityProviderStrategy } = this.compute.bind(pipe);

    if (this.props.assignPublicIp && launchType !== LaunchType.FARGATE) {
      throw new cdk.ValidationError(
        `assignPublicIp can only be set to true when the launch type is FARGATE, got ${launchType ?? 'a capacity provider strategy'}.`,
        pipe,
      );
    }
    if (this.props.propagateTags !== undefined && this.props.propagateTags !== PropagatedTagSource.TASK_DEFINITION) {
      throw new cdk.ValidationError(
        `propagateTags must be ${PropagatedTagSource.TASK_DEFINITION}, got ${this.props.propagateTags}.`,
        pipe,
      );
    }

    const useAwsvpc = this.taskDefinition.networkMode === NetworkMode.AWS_VPC;
    const ecsTaskParameters = {
      taskDefinitionArn: this.taskDefinition.taskDefinitionArn,
      taskCount: this.props.taskCount ?? 1,
      launchType,
      platformVersion,
      capacityProviderStrategy,
      networkConfiguration: useAwsvpc ? {
        awsvpcConfiguration: {
          assignPublicIp: this.props.assignPublicIp ? 'ENABLED' : 'DISABLED',
          subnets: this.cluster.vpc.selectSubnets(this.props.subnetSelection)
            .subnetIds,
          securityGroups: cdk.Lazy.list({
            produce: () =>
              this.connections.securityGroups.map((sg) => sg.securityGroupId),
          }),
        },
      } : undefined,
      enableEcsManagedTags: this.props.enableECSManagedTags ?? true,
      enableExecuteCommand: this.props.enableExecuteCommand,
      group: this.props.group,
      placementConstraints: this.props.placementConstraints?.flatMap((c) => c.toJson()),
      placementStrategy: this.props.placementStrategies?.flatMap((s) => s.toJson()),
      propagateTags: this.props.propagateTags,
      referenceId: this.props.referenceId,
      overrides: this.renderOverrides(),
    } satisfies CfnPipe.PipeTargetEcsTaskParametersProperty;

    return {
      targetParameters: {
        ecsTaskParameters,
        inputTemplate: this.props.inputTransformation?.bind(pipe).inputTemplate,
      },
    } satisfies TargetConfig;
  }

  private renderOverrides(): CfnPipe.PipeTargetEcsTaskParametersProperty['overrides'] {
    const overrides = {
      containerOverrides: this.props.containerOverrides?.map(
        ({ containerName, memory, memoryReservation, ...rest }) => ({
          name: containerName,
          memory: memory?.toMebibytes(),
          memoryReservation: memoryReservation?.toMebibytes(),
          ...rest,
        }),
      ),
      cpu: this.props.cpu,
      memory: this.props.memory,
      ephemeralStorage: this.props.ephemeralStorage
        ? { sizeInGiB: this.props.ephemeralStorage.toGibibytes() }
        : undefined,
      executionRoleArn: this.props.executionRole?.roleArn,
      taskRoleArn: this.props.taskRole?.roleArn,
    };
    return Object.values(overrides).some((value) => value !== undefined) ? overrides : undefined;
  }
  grantPush(grantee: IRole): void {
    Grant.addToPrincipal({
      grantee,
      actions: ['ecs:RunTask'],
      resourceArns: [this.taskDefinition.taskDefinitionArn],
      conditions: {
        ArnEquals: { 'ecs:cluster': this.cluster.clusterArn },
      },
    });

    const passRoleArns = [
      this.taskDefinition.taskRole.roleArn,
      this.taskDefinition.executionRole?.roleArn,
      this.props.taskRole?.roleArn,
      this.props.executionRole?.roleArn,
    ].filter((arn): arn is string => arn !== undefined);
    Grant.addToPrincipal({
      grantee,
      actions: ['iam:PassRole'],
      resourceArns: Array.from(new Set(passRoleArns)),
      conditions: {
        StringLike: {
          'iam:PassedToService': 'ecs-tasks.amazonaws.com',
        },
      },
    });

    // ECS applies managed tags and propagated tags during RunTask, which
    // requires ecs:TagResource on the tasks created in the target cluster.
    if ((this.props.enableECSManagedTags ?? true) || this.props.propagateTags !== undefined) {
      Grant.addToPrincipal({
        grantee,
        actions: ['ecs:TagResource'],
        resourceArns: [
          `arn:${this.cluster.stack.partition}:ecs:${this.cluster.env.region}:*:task/${this.cluster.clusterName}/*`,
        ],
      });
    }
  }

  private createDefaultSecurityGroup(vpc: IVpc) {
    return new SecurityGroup(this.taskDefinition, 'SecurityGroup', {
      vpc,
    });
  }

  private getDefaultCompute(taskDefinition: ITaskDefinition) {
    switch (taskDefinition.compatibility) {
      case Compatibility.EC2:
        return EcsTaskTargetCompute.ec2LaunchType();
      case Compatibility.FARGATE:
        return EcsTaskTargetCompute.fargateLaunchType();
      case Compatibility.EXTERNAL:
        return EcsTaskTargetCompute.externalLaunchType();
      default:
        return EcsTaskTargetCompute.defaultCapacityProviderStrategy();
    }
  }
}
