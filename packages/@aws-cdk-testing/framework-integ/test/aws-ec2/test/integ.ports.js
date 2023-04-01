"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const integ_tests_alpha_1 = require("@aws-cdk/integ-tests-alpha");
const ec2 = require("aws-cdk-lib/aws-ec2");
const app = new cdk.App();
class TestStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const vpc = new ec2.Vpc(this, 'VPC');
        const sg = new ec2.SecurityGroup(this, 'SecGroup', {
            vpc,
        });
        sg.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.allIcmpV6(), 'allow ICMP6');
    }
}
new TestStack(app, 'TestStack');
new integ_tests_alpha_1.IntegTest(app, 'Ports', {
    testCases: [
        new TestStack(app, 'PortsTestStack', {}),
    ],
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcucG9ydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZy5wb3J0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUNuQyxrRUFBdUQ7QUFDdkQsMkNBQTJDO0FBRTNDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE1BQU0sU0FBVSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQy9CLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXJDLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2pELEdBQUc7U0FDSixDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsY0FBYyxDQUNmLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQ3BCLGFBQWEsQ0FDZCxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBRUQsSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRWhDLElBQUksNkJBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0lBQzFCLFNBQVMsRUFBRTtRQUNULElBQUksU0FBUyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7S0FDekM7Q0FDRixDQUFDLENBQUM7QUFFSCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgSW50ZWdUZXN0IH0gZnJvbSAnQGF3cy1jZGsvaW50ZWctdGVzdHMtYWxwaGEnO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jbGFzcyBUZXN0U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgJ1ZQQycpO1xuXG4gICAgY29uc3Qgc2cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ1NlY0dyb3VwJywge1xuICAgICAgdnBjLFxuICAgIH0pO1xuICAgIHNnLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NigpLFxuICAgICAgZWMyLlBvcnQuYWxsSWNtcFY2KCksXG4gICAgICAnYWxsb3cgSUNNUDYnLFxuICAgICk7XG4gIH1cbn1cblxubmV3IFRlc3RTdGFjayhhcHAsICdUZXN0U3RhY2snKTtcblxubmV3IEludGVnVGVzdChhcHAsICdQb3J0cycsIHtcbiAgdGVzdENhc2VzOiBbXG4gICAgbmV3IFRlc3RTdGFjayhhcHAsICdQb3J0c1Rlc3RTdGFjaycsIHt9KSxcbiAgXSxcbn0pO1xuXG5hcHAuc3ludGgoKTtcbiJdfQ==