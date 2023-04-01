"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_ecs_1 = require("aws-cdk-lib/aws-ecs");
const aws_elasticloadbalancingv2_1 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const route53 = require("aws-cdk-lib/aws-route53");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const integ = require("@aws-cdk/integ-tests-alpha");
const aws_ecs_patterns_1 = require("aws-cdk-lib/aws-ecs-patterns");
const app = new aws_cdk_lib_1.App();
const stack = new aws_cdk_lib_1.Stack(app, 'aws-ecs-integ-alb-fg-https');
const vpc = new aws_ec2_1.Vpc(stack, 'Vpc', { maxAzs: 2 });
const cluster = new aws_ecs_1.Cluster(stack, 'Cluster', { vpc });
// Loadbalancer with HTTPS
new aws_ecs_patterns_1.ApplicationLoadBalancedFargateService(stack, 'myService', {
    cluster,
    memoryLimitMiB: 512,
    taskImageOptions: {
        image: aws_ecs_1.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
    },
    protocol: aws_elasticloadbalancingv2_1.ApplicationProtocol.HTTPS,
    enableECSManagedTags: true,
    enableExecuteCommand: true,
    domainName: 'test.example.com',
    domainZone: route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
        hostedZoneId: 'fakeId',
        zoneName: 'example.com.',
    }),
    redirectHTTP: true,
});
new integ.IntegTest(app, 'albFargateServiceTest', {
    testCases: [stack],
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcuYWxiLWZhcmdhdGUtc2VydmljZS1odHRwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVnLmFsYi1mYXJnYXRlLXNlcnZpY2UtaHR0cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBMEM7QUFDMUMsaURBQThEO0FBQzlELHVGQUE2RTtBQUM3RSxtREFBbUQ7QUFDbkQsNkNBQXlDO0FBQ3pDLG9EQUFvRDtBQUNwRCxtRUFBcUY7QUFFckYsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFdkQsMEJBQTBCO0FBQzFCLElBQUksd0RBQXFDLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRTtJQUM1RCxPQUFPO0lBQ1AsY0FBYyxFQUFFLEdBQUc7SUFDbkIsZ0JBQWdCLEVBQUU7UUFDaEIsS0FBSyxFQUFFLHdCQUFjLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDO0tBQy9EO0lBQ0QsUUFBUSxFQUFFLGdEQUFtQixDQUFDLEtBQUs7SUFDbkMsb0JBQW9CLEVBQUUsSUFBSTtJQUMxQixvQkFBb0IsRUFBRSxJQUFJO0lBQzFCLFVBQVUsRUFBRSxrQkFBa0I7SUFDOUIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRTtRQUMzRSxZQUFZLEVBQUUsUUFBUTtRQUN0QixRQUFRLEVBQUUsY0FBYztLQUN6QixDQUFDO0lBQ0YsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsRUFBRTtJQUNoRCxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUM7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVnBjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgeyBDbHVzdGVyLCBDb250YWluZXJJbWFnZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0IHsgQXBwbGljYXRpb25Qcm90b2NvbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGludGVnIGZyb20gJ0Bhd3MtY2RrL2ludGVnLXRlc3RzLWFscGhhJztcbmltcG9ydCB7IEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VkRmFyZ2F0ZVNlcnZpY2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzLXBhdHRlcm5zJztcblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuY29uc3Qgc3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnYXdzLWVjcy1pbnRlZy1hbGItZmctaHR0cHMnKTtcbmNvbnN0IHZwYyA9IG5ldyBWcGMoc3RhY2ssICdWcGMnLCB7IG1heEF6czogMiB9KTtcbmNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3RlcihzdGFjaywgJ0NsdXN0ZXInLCB7IHZwYyB9KTtcblxuLy8gTG9hZGJhbGFuY2VyIHdpdGggSFRUUFNcbm5ldyBBcHBsaWNhdGlvbkxvYWRCYWxhbmNlZEZhcmdhdGVTZXJ2aWNlKHN0YWNrLCAnbXlTZXJ2aWNlJywge1xuICBjbHVzdGVyLFxuICBtZW1vcnlMaW1pdE1pQjogNTEyLFxuICB0YXNrSW1hZ2VPcHRpb25zOiB7XG4gICAgaW1hZ2U6IENvbnRhaW5lckltYWdlLmZyb21SZWdpc3RyeSgnYW1hem9uL2FtYXpvbi1lY3Mtc2FtcGxlJyksXG4gIH0sXG4gIHByb3RvY29sOiBBcHBsaWNhdGlvblByb3RvY29sLkhUVFBTLFxuICBlbmFibGVFQ1NNYW5hZ2VkVGFnczogdHJ1ZSxcbiAgZW5hYmxlRXhlY3V0ZUNvbW1hbmQ6IHRydWUsXG4gIGRvbWFpbk5hbWU6ICd0ZXN0LmV4YW1wbGUuY29tJyxcbiAgZG9tYWluWm9uZTogcm91dGU1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyhzdGFjaywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgaG9zdGVkWm9uZUlkOiAnZmFrZUlkJyxcbiAgICB6b25lTmFtZTogJ2V4YW1wbGUuY29tLicsXG4gIH0pLFxuICByZWRpcmVjdEhUVFA6IHRydWUsXG59KTtcblxubmV3IGludGVnLkludGVnVGVzdChhcHAsICdhbGJGYXJnYXRlU2VydmljZVRlc3QnLCB7XG4gIHRlc3RDYXNlczogW3N0YWNrXSxcbn0pO1xuXG5hcHAuc3ludGgoKTtcbiJdfQ==