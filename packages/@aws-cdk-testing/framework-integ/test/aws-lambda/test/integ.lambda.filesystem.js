"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ec2 = require("aws-cdk-lib/aws-ec2");
const efs = require("aws-cdk-lib/aws-efs");
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const app = new cdk.App();
const stack = new cdk.Stack(app, 'aws-cdk-lambda-1');
const vpc = new ec2.Vpc(stack, 'Vpc', {
    maxAzs: 3,
    natGateways: 1,
});
const fileSystem = new efs.FileSystem(stack, 'Efs', {
    vpc,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
});
// create an access point and expose the root of the filesystem
const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
    createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '750',
    },
    path: '/export/lambda',
    posixUser: {
        gid: '1001',
        uid: '1001',
    },
});
const lambdaCode = new lambda.InlineCode(`
import json
import os
import string
import random
import datetime

MSG_FILE_PATH = '/mnt/msg/content'

def randomString(stringLength=10):
  letters = string.ascii_lowercase
  return ''.join(random.choice(letters) for i in range(stringLength))

def lambda_handler(event, context):
  with open(MSG_FILE_PATH, 'a') as f:
      f.write(f"{datetime.datetime.utcnow():%Y-%m-%d-%H:%M:%S} " + randomString(5) + ' ')

  file = open(MSG_FILE_PATH, "r")
  file_content = file.read()
  file.close()

  return {
    'statusCode': 200,
    'body': str(file_content)
  }
`);
// this function will mount the access point to '/mnt/msg' and write content onto /mnt/msg/content
const lambda1 = new lambda.Function(stack, 'MyLambda', {
    code: lambdaCode,
    handler: 'index.lambda_handler',
    runtime: lambda.Runtime.PYTHON_3_7,
    vpc,
    filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/msg'),
});
let importedFileSystem = efs.FileSystem.fromFileSystemAttributes(stack, 'fileSystemImported', {
    fileSystemId: fileSystem.fileSystemId,
    securityGroup: ec2.SecurityGroup.fromSecurityGroupId(stack, 'securityGroup', fileSystem.connections.securityGroups[0].securityGroupId),
});
let importedAccessPoint = efs.AccessPoint.fromAccessPointAttributes(stack, 'AccessPointImported', {
    accessPointId: accessPoint.accessPointId,
    fileSystem: importedFileSystem,
});
// this function will mount the access point to '/mnt/msg' and write content onto /mnt/msg/content
const lambda2 = new lambda.Function(stack, 'MyLambda2', {
    code: lambdaCode,
    handler: 'index.lambda_handler',
    runtime: lambda.Runtime.PYTHON_3_7,
    vpc,
    filesystem: lambda.FileSystem.fromEfsAccessPoint(importedAccessPoint, '/mnt/msg'),
});
// lambda2 doesn't have dependencies on MountTargets because the fileSystem is imported.
// Ideally, lambda2 would be deployed in another stack but integ doesn't support it.
// We are adding a dependency on the first lambda to simulate this situation.
lambda2.node.addDependency(lambda1);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcubGFtYmRhLmZpbGVzeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZy5sYW1iZGEuZmlsZXN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsbUNBQW1DO0FBQ25DLGlEQUFpRDtBQUVqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFHckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7SUFDcEMsTUFBTSxFQUFFLENBQUM7SUFDVCxXQUFXLEVBQUUsQ0FBQztDQUNmLENBQUMsQ0FBQztBQUVILE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ2xELEdBQUc7SUFDSCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO0NBQ3pDLENBQUMsQ0FBQztBQUVILCtEQUErRDtBQUMvRCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRTtJQUMzRCxTQUFTLEVBQUU7UUFDVCxRQUFRLEVBQUUsTUFBTTtRQUNoQixRQUFRLEVBQUUsTUFBTTtRQUNoQixXQUFXLEVBQUUsS0FBSztLQUNuQjtJQUNELElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsU0FBUyxFQUFFO1FBQ1QsR0FBRyxFQUFFLE1BQU07UUFDWCxHQUFHLEVBQUUsTUFBTTtLQUNaO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUJ4QyxDQUFDLENBQUM7QUFFSCxrR0FBa0c7QUFDbEcsTUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUU7SUFDckQsSUFBSSxFQUFFLFVBQVU7SUFDaEIsT0FBTyxFQUFFLHNCQUFzQjtJQUMvQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO0lBQ2xDLEdBQUc7SUFDSCxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO0NBQzFFLENBQUMsQ0FBQztBQUVILElBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLEVBQUU7SUFDNUYsWUFBWSxFQUFFLFVBQVUsQ0FBQyxZQUFZO0lBQ3JDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUNsRCxLQUFLLEVBQ0wsZUFBZSxFQUNmLFVBQVUsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FDekQ7Q0FDRixDQUFDLENBQUM7QUFFSCxJQUFJLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLHFCQUFxQixFQUFFO0lBQ2hHLGFBQWEsRUFBRSxXQUFXLENBQUMsYUFBYTtJQUN4QyxVQUFVLEVBQUUsa0JBQWtCO0NBQy9CLENBQUMsQ0FBQztBQUVILGtHQUFrRztBQUNsRyxNQUFNLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRTtJQUN0RCxJQUFJLEVBQUUsVUFBVTtJQUNoQixPQUFPLEVBQUUsc0JBQXNCO0lBQy9CLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7SUFDbEMsR0FBRztJQUNILFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUM5QyxtQkFBbUIsRUFDbkIsVUFBVSxDQUNYO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsd0ZBQXdGO0FBQ3hGLG9GQUFvRjtBQUNwRiw2RUFBNkU7QUFDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFcEMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWZzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lZnMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuY29uc3Qgc3RhY2sgPSBuZXcgY2RrLlN0YWNrKGFwcCwgJ2F3cy1jZGstbGFtYmRhLTEnKTtcblxuXG5jb25zdCB2cGMgPSBuZXcgZWMyLlZwYyhzdGFjaywgJ1ZwYycsIHtcbiAgbWF4QXpzOiAzLFxuICBuYXRHYXRld2F5czogMSxcbn0pO1xuXG5jb25zdCBmaWxlU3lzdGVtID0gbmV3IGVmcy5GaWxlU3lzdGVtKHN0YWNrLCAnRWZzJywge1xuICB2cGMsXG4gIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG59KTtcblxuLy8gY3JlYXRlIGFuIGFjY2VzcyBwb2ludCBhbmQgZXhwb3NlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtXG5jb25zdCBhY2Nlc3NQb2ludCA9IGZpbGVTeXN0ZW0uYWRkQWNjZXNzUG9pbnQoJ0FjY2Vzc1BvaW50Jywge1xuICBjcmVhdGVBY2w6IHtcbiAgICBvd25lckdpZDogJzEwMDEnLFxuICAgIG93bmVyVWlkOiAnMTAwMScsXG4gICAgcGVybWlzc2lvbnM6ICc3NTAnLFxuICB9LFxuICBwYXRoOiAnL2V4cG9ydC9sYW1iZGEnLFxuICBwb3NpeFVzZXI6IHtcbiAgICBnaWQ6ICcxMDAxJyxcbiAgICB1aWQ6ICcxMDAxJyxcbiAgfSxcbn0pO1xuXG5jb25zdCBsYW1iZGFDb2RlID0gbmV3IGxhbWJkYS5JbmxpbmVDb2RlKGBcbmltcG9ydCBqc29uXG5pbXBvcnQgb3NcbmltcG9ydCBzdHJpbmdcbmltcG9ydCByYW5kb21cbmltcG9ydCBkYXRldGltZVxuXG5NU0dfRklMRV9QQVRIID0gJy9tbnQvbXNnL2NvbnRlbnQnXG5cbmRlZiByYW5kb21TdHJpbmcoc3RyaW5nTGVuZ3RoPTEwKTpcbiAgbGV0dGVycyA9IHN0cmluZy5hc2NpaV9sb3dlcmNhc2VcbiAgcmV0dXJuICcnLmpvaW4ocmFuZG9tLmNob2ljZShsZXR0ZXJzKSBmb3IgaSBpbiByYW5nZShzdHJpbmdMZW5ndGgpKVxuXG5kZWYgbGFtYmRhX2hhbmRsZXIoZXZlbnQsIGNvbnRleHQpOlxuICB3aXRoIG9wZW4oTVNHX0ZJTEVfUEFUSCwgJ2EnKSBhcyBmOlxuICAgICAgZi53cml0ZShmXCJ7ZGF0ZXRpbWUuZGF0ZXRpbWUudXRjbm93KCk6JVktJW0tJWQtJUg6JU06JVN9IFwiICsgcmFuZG9tU3RyaW5nKDUpICsgJyAnKVxuXG4gIGZpbGUgPSBvcGVuKE1TR19GSUxFX1BBVEgsIFwiclwiKVxuICBmaWxlX2NvbnRlbnQgPSBmaWxlLnJlYWQoKVxuICBmaWxlLmNsb3NlKClcblxuICByZXR1cm4ge1xuICAgICdzdGF0dXNDb2RlJzogMjAwLFxuICAgICdib2R5Jzogc3RyKGZpbGVfY29udGVudClcbiAgfVxuYCk7XG5cbi8vIHRoaXMgZnVuY3Rpb24gd2lsbCBtb3VudCB0aGUgYWNjZXNzIHBvaW50IHRvICcvbW50L21zZycgYW5kIHdyaXRlIGNvbnRlbnQgb250byAvbW50L21zZy9jb250ZW50XG5jb25zdCBsYW1iZGExID0gbmV3IGxhbWJkYS5GdW5jdGlvbihzdGFjaywgJ015TGFtYmRhJywge1xuICBjb2RlOiBsYW1iZGFDb2RlLFxuICBoYW5kbGVyOiAnaW5kZXgubGFtYmRhX2hhbmRsZXInLFxuICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM183LFxuICB2cGMsXG4gIGZpbGVzeXN0ZW06IGxhbWJkYS5GaWxlU3lzdGVtLmZyb21FZnNBY2Nlc3NQb2ludChhY2Nlc3NQb2ludCwgJy9tbnQvbXNnJyksXG59KTtcblxubGV0IGltcG9ydGVkRmlsZVN5c3RlbSA9IGVmcy5GaWxlU3lzdGVtLmZyb21GaWxlU3lzdGVtQXR0cmlidXRlcyhzdGFjaywgJ2ZpbGVTeXN0ZW1JbXBvcnRlZCcsIHtcbiAgZmlsZVN5c3RlbUlkOiBmaWxlU3lzdGVtLmZpbGVTeXN0ZW1JZCxcbiAgc2VjdXJpdHlHcm91cDogZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICBzdGFjayxcbiAgICAnc2VjdXJpdHlHcm91cCcsXG4gICAgZmlsZVN5c3RlbS5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwc1swXS5zZWN1cml0eUdyb3VwSWQsXG4gICksXG59KTtcblxubGV0IGltcG9ydGVkQWNjZXNzUG9pbnQgPSBlZnMuQWNjZXNzUG9pbnQuZnJvbUFjY2Vzc1BvaW50QXR0cmlidXRlcyhzdGFjaywgJ0FjY2Vzc1BvaW50SW1wb3J0ZWQnLCB7XG4gIGFjY2Vzc1BvaW50SWQ6IGFjY2Vzc1BvaW50LmFjY2Vzc1BvaW50SWQsXG4gIGZpbGVTeXN0ZW06IGltcG9ydGVkRmlsZVN5c3RlbSxcbn0pO1xuXG4vLyB0aGlzIGZ1bmN0aW9uIHdpbGwgbW91bnQgdGhlIGFjY2VzcyBwb2ludCB0byAnL21udC9tc2cnIGFuZCB3cml0ZSBjb250ZW50IG9udG8gL21udC9tc2cvY29udGVudFxuY29uc3QgbGFtYmRhMiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24oc3RhY2ssICdNeUxhbWJkYTInLCB7XG4gIGNvZGU6IGxhbWJkYUNvZGUsXG4gIGhhbmRsZXI6ICdpbmRleC5sYW1iZGFfaGFuZGxlcicsXG4gIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzcsXG4gIHZwYyxcbiAgZmlsZXN5c3RlbTogbGFtYmRhLkZpbGVTeXN0ZW0uZnJvbUVmc0FjY2Vzc1BvaW50KFxuICAgIGltcG9ydGVkQWNjZXNzUG9pbnQsXG4gICAgJy9tbnQvbXNnJyxcbiAgKSxcbn0pO1xuXG4vLyBsYW1iZGEyIGRvZXNuJ3QgaGF2ZSBkZXBlbmRlbmNpZXMgb24gTW91bnRUYXJnZXRzIGJlY2F1c2UgdGhlIGZpbGVTeXN0ZW0gaXMgaW1wb3J0ZWQuXG4vLyBJZGVhbGx5LCBsYW1iZGEyIHdvdWxkIGJlIGRlcGxveWVkIGluIGFub3RoZXIgc3RhY2sgYnV0IGludGVnIGRvZXNuJ3Qgc3VwcG9ydCBpdC5cbi8vIFdlIGFyZSBhZGRpbmcgYSBkZXBlbmRlbmN5IG9uIHRoZSBmaXJzdCBsYW1iZGEgdG8gc2ltdWxhdGUgdGhpcyBzaXR1YXRpb24uXG5sYW1iZGEyLm5vZGUuYWRkRGVwZW5kZW5jeShsYW1iZGExKTtcblxuYXBwLnN5bnRoKCk7XG4iXX0=