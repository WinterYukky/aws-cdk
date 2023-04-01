"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ec2 = require("aws-cdk-lib/aws-ec2");
const iam = require("aws-cdk-lib/aws-iam");
const kms = require("aws-cdk-lib/aws-kms");
const cdk = require("aws-cdk-lib");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
const app = new cdk.App();
const stack = new cdk.Stack(app, 'aws-cdk-rds-integ');
const vpc = new ec2.Vpc(stack, 'VPC', { maxAzs: 2 });
const params = new aws_rds_1.ParameterGroup(stack, 'Params', {
    engine: aws_rds_1.DatabaseClusterEngine.AURORA,
    description: 'A nice parameter group',
    parameters: {
        character_set_database: 'utf8mb4',
    },
});
const kmsKey = new kms.Key(stack, 'DbSecurity');
const cluster = new aws_rds_1.DatabaseCluster(stack, 'Database', {
    engine: aws_rds_1.DatabaseClusterEngine.AURORA,
    credentials: aws_rds_1.Credentials.fromUsername('admin', { password: cdk.SecretValue.unsafePlainText('7959866cacc02c2d243ecfe177464fe6') }),
    instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        vpc,
    },
    parameterGroup: params,
    storageEncryptionKey: kmsKey,
});
cluster.connections.allowDefaultPortFromAnyIpv4('Open to the world');
const role = new iam.Role(stack, 'ClusterIamAccess', {
    assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
});
const clusterIamAuthArn = stack.formatArn({
    service: 'rds-db',
    resource: `dbuser:${cluster.clusterResourceIdentifier}`,
    resourceName: 'db_user',
});
role.addToPolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['rds-db:connect'],
    resources: [clusterIamAuthArn],
}));
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcuY2x1c3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVnLmNsdXN0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxtQ0FBbUM7QUFDbkMsaURBQTBHO0FBRTFHLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUV0RCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXJELE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO0lBQ2pELE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxNQUFNO0lBQ3BDLFdBQVcsRUFBRSx3QkFBd0I7SUFDckMsVUFBVSxFQUFFO1FBQ1Ysc0JBQXNCLEVBQUUsU0FBUztLQUNsQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFaEQsTUFBTSxPQUFPLEdBQUcsSUFBSSx5QkFBZSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUU7SUFDckQsTUFBTSxFQUFFLCtCQUFxQixDQUFDLE1BQU07SUFDcEMsV0FBVyxFQUFFLHFCQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLENBQUM7SUFDakksYUFBYSxFQUFFO1FBQ2IsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ3ZGLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtRQUNqRCxHQUFHO0tBQ0o7SUFDRCxjQUFjLEVBQUUsTUFBTTtJQUN0QixvQkFBb0IsRUFBRSxNQUFNO0NBQzdCLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxXQUFXLENBQUMsMkJBQTJCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVyRSxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFO0lBQ25ELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQztDQUMvRCxDQUFDLENBQUM7QUFDSCxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7SUFDeEMsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFVBQVUsT0FBTyxDQUFDLHlCQUF5QixFQUFFO0lBQ3ZELFlBQVksRUFBRSxTQUFTO0NBQ3hCLENBQUMsQ0FBQztBQUNILElBQUksQ0FBQyxXQUFXLENBQ2QsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO0lBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7SUFDeEIsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7SUFDM0IsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUM7Q0FDL0IsQ0FBQyxDQUNILENBQUM7QUFFRixHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBrbXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ3JlZGVudGlhbHMsIERhdGFiYXNlQ2x1c3RlciwgRGF0YWJhc2VDbHVzdGVyRW5naW5lLCBQYXJhbWV0ZXJHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuY29uc3Qgc3RhY2sgPSBuZXcgY2RrLlN0YWNrKGFwcCwgJ2F3cy1jZGstcmRzLWludGVnJyk7XG5cbmNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHN0YWNrLCAnVlBDJywgeyBtYXhBenM6IDIgfSk7XG5cbmNvbnN0IHBhcmFtcyA9IG5ldyBQYXJhbWV0ZXJHcm91cChzdGFjaywgJ1BhcmFtcycsIHtcbiAgZW5naW5lOiBEYXRhYmFzZUNsdXN0ZXJFbmdpbmUuQVVST1JBLFxuICBkZXNjcmlwdGlvbjogJ0EgbmljZSBwYXJhbWV0ZXIgZ3JvdXAnLFxuICBwYXJhbWV0ZXJzOiB7XG4gICAgY2hhcmFjdGVyX3NldF9kYXRhYmFzZTogJ3V0ZjhtYjQnLFxuICB9LFxufSk7XG5cbmNvbnN0IGttc0tleSA9IG5ldyBrbXMuS2V5KHN0YWNrLCAnRGJTZWN1cml0eScpO1xuXG5jb25zdCBjbHVzdGVyID0gbmV3IERhdGFiYXNlQ2x1c3RlcihzdGFjaywgJ0RhdGFiYXNlJywge1xuICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5BVVJPUkEsXG4gIGNyZWRlbnRpYWxzOiBDcmVkZW50aWFscy5mcm9tVXNlcm5hbWUoJ2FkbWluJywgeyBwYXNzd29yZDogY2RrLlNlY3JldFZhbHVlLnVuc2FmZVBsYWluVGV4dCgnNzk1OTg2NmNhY2MwMmMyZDI0M2VjZmUxNzc0NjRmZTYnKSB9KSxcbiAgaW5zdGFuY2VQcm9wczoge1xuICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihlYzIuSW5zdGFuY2VDbGFzcy5CVVJTVEFCTEUzLCBlYzIuSW5zdGFuY2VTaXplLlNNQUxMKSxcbiAgICB2cGNTdWJuZXRzOiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIHZwYyxcbiAgfSxcbiAgcGFyYW1ldGVyR3JvdXA6IHBhcmFtcyxcbiAgc3RvcmFnZUVuY3J5cHRpb25LZXk6IGttc0tleSxcbn0pO1xuXG5jbHVzdGVyLmNvbm5lY3Rpb25zLmFsbG93RGVmYXVsdFBvcnRGcm9tQW55SXB2NCgnT3BlbiB0byB0aGUgd29ybGQnKTtcblxuY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZShzdGFjaywgJ0NsdXN0ZXJJYW1BY2Nlc3MnLCB7XG4gIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxufSk7XG5jb25zdCBjbHVzdGVySWFtQXV0aEFybiA9IHN0YWNrLmZvcm1hdEFybih7XG4gIHNlcnZpY2U6ICdyZHMtZGInLFxuICByZXNvdXJjZTogYGRidXNlcjoke2NsdXN0ZXIuY2x1c3RlclJlc291cmNlSWRlbnRpZmllcn1gLFxuICByZXNvdXJjZU5hbWU6ICdkYl91c2VyJyxcbn0pO1xucm9sZS5hZGRUb1BvbGljeShcbiAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICBhY3Rpb25zOiBbJ3Jkcy1kYjpjb25uZWN0J10sXG4gICAgcmVzb3VyY2VzOiBbY2x1c3RlcklhbUF1dGhBcm5dLFxuICB9KSxcbik7XG5cbmFwcC5zeW50aCgpO1xuIl19