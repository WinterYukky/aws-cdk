"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const integ_tests_alpha_1 = require("@aws-cdk/integ-tests-alpha");
const ssm = require("aws-cdk-lib/aws-ssm");
const paramName = 'integ-list-param';
const paramValue = ['value1', 'value2'];
class TestCaseBase extends cdk.Stack {
    constructor(scope, id) {
        super(scope, id);
        this.listParam = new ssm.StringListParameter(this, 'ListParam', {
            parameterName: paramName,
            stringListValue: paramValue,
        });
    }
}
const app = new cdk.App({
    treeMetadata: false,
});
app.node.setContext('@aws-cdk/core:newStyleStackSynthesis', true);
const base = new TestCaseBase(app, 'base');
const testCase = new cdk.Stack(app, 'list-param');
// creates the dependency between stacks
new cdk.CfnOutput(testCase, 'Output', {
    value: cdk.Fn.join(',', base.listParam.stringListValue),
});
/**
 * get the value from the `base` stack and then write it to a new parameter
 * We will then assert that the value that is written is the correct value
 * This validates that the `fromXXX` and `valueForXXX` imports the value correctly
 */
const fromAttrs = ssm.StringListParameter.fromListParameterAttributes(testCase, 'FromAttrs', {
    parameterName: paramName,
    elementType: ssm.ParameterValueType.STRING,
});
const ssmAttrsValue = new ssm.CfnParameter(testCase, 'attrs-test', {
    type: 'StringList',
    value: cdk.Fn.join(',', fromAttrs.stringListValue),
});
const value = ssm.StringListParameter.valueForTypedListParameter(testCase, paramName, ssm.ParameterValueType.STRING);
const ssmValue = new ssm.CfnParameter(testCase, 'value-test', {
    type: 'StringList',
    value: cdk.Fn.join(',', value),
});
const versionValue = ssm.StringListParameter.valueForTypedListParameter(testCase, paramName, ssm.ParameterValueType.STRING, 1);
const ssmVersionValue = new ssm.CfnParameter(testCase, 'version-value-test', {
    type: 'StringList',
    value: cdk.Fn.join(',', versionValue),
});
const integ = new integ_tests_alpha_1.IntegTest(app, 'ssm-string-param', {
    testCases: [
        testCase,
    ],
});
// list the parameters
const actualAttrs = integ.assertions.awsApiCall('SSM', 'getParameters', {
    Names: [ssmVersionValue.ref, ssmValue.ref, ssmAttrsValue.ref],
});
actualAttrs.expect(integ_tests_alpha_1.ExpectedResult.objectLike({
    Parameters: integ_tests_alpha_1.Match.arrayWith([
        integ_tests_alpha_1.Match.objectLike({
            Value: paramValue.join(','),
        }),
        integ_tests_alpha_1.Match.objectLike({
            Value: paramValue.join(','),
        }),
        integ_tests_alpha_1.Match.objectLike({
            Value: paramValue.join(','),
        }),
    ]),
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcubGlzdC1wYXJhbWV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZy5saXN0LXBhcmFtZXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUNuQyxrRUFBOEU7QUFFOUUsMkNBQTJDO0FBQzNDLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQ3JDLE1BQU0sVUFBVSxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBRXhDLE1BQU0sWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBRWxDLFlBQVksS0FBZ0IsRUFBRSxFQUFVO1FBQ3RDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzlELGFBQWEsRUFBRSxTQUFTO1lBQ3hCLGVBQWUsRUFBRSxVQUFVO1NBQzVCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQUdELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUN0QixZQUFZLEVBQUUsS0FBSztDQUNwQixDQUFDLENBQUM7QUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDM0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUVsRCx3Q0FBd0M7QUFDeEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7SUFDcEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztDQUN4RCxDQUFDLENBQUM7QUFHSDs7OztHQUlHO0FBRUgsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7SUFDM0YsYUFBYSxFQUFFLFNBQVM7SUFDeEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNO0NBQzNDLENBQUMsQ0FBQztBQUNILE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFO0lBQ2pFLElBQUksRUFBRSxZQUFZO0lBQ2xCLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztDQUNuRCxDQUFDLENBQUM7QUFFSCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckgsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUU7SUFDNUQsSUFBSSxFQUFFLFlBQVk7SUFDbEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7Q0FDL0IsQ0FBQyxDQUFDO0FBRUgsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvSCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFFO0lBQzNFLElBQUksRUFBRSxZQUFZO0lBQ2xCLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDO0NBQ3RDLENBQUMsQ0FBQztBQUdILE1BQU0sS0FBSyxHQUFHLElBQUksNkJBQVMsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUU7SUFDbkQsU0FBUyxFQUFFO1FBQ1QsUUFBUTtLQUNUO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsc0JBQXNCO0FBQ3RCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUU7SUFDdEUsS0FBSyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUM7Q0FDOUQsQ0FBQyxDQUFDO0FBRUgsV0FBVyxDQUFDLE1BQU0sQ0FBQyxrQ0FBYyxDQUFDLFVBQVUsQ0FBQztJQUMzQyxVQUFVLEVBQUUseUJBQUssQ0FBQyxTQUFTLENBQUM7UUFDMUIseUJBQUssQ0FBQyxVQUFVLENBQUM7WUFDZixLQUFLLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDNUIsQ0FBQztRQUNGLHlCQUFLLENBQUMsVUFBVSxDQUFDO1lBQ2YsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQzVCLENBQUM7UUFDRix5QkFBSyxDQUFDLFVBQVUsQ0FBQztZQUNmLEtBQUssRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUM1QixDQUFDO0tBQ0gsQ0FBQztDQUNILENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEludGVnVGVzdCwgRXhwZWN0ZWRSZXN1bHQsIE1hdGNoIH0gZnJvbSAnQGF3cy1jZGsvaW50ZWctdGVzdHMtYWxwaGEnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzc20gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XG5jb25zdCBwYXJhbU5hbWUgPSAnaW50ZWctbGlzdC1wYXJhbSc7XG5jb25zdCBwYXJhbVZhbHVlID0gWyd2YWx1ZTEnLCAndmFsdWUyJ107XG5cbmNsYXNzIFRlc3RDYXNlQmFzZSBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBsaXN0UGFyYW06IHNzbS5JU3RyaW5nTGlzdFBhcmFtZXRlcjtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICB0aGlzLmxpc3RQYXJhbSA9IG5ldyBzc20uU3RyaW5nTGlzdFBhcmFtZXRlcih0aGlzLCAnTGlzdFBhcmFtJywge1xuICAgICAgcGFyYW1ldGVyTmFtZTogcGFyYW1OYW1lLFxuICAgICAgc3RyaW5nTGlzdFZhbHVlOiBwYXJhbVZhbHVlLFxuICAgIH0pO1xuICB9XG59XG5cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoe1xuICB0cmVlTWV0YWRhdGE6IGZhbHNlLFxufSk7XG5hcHAubm9kZS5zZXRDb250ZXh0KCdAYXdzLWNkay9jb3JlOm5ld1N0eWxlU3RhY2tTeW50aGVzaXMnLCB0cnVlKTtcbmNvbnN0IGJhc2UgPSBuZXcgVGVzdENhc2VCYXNlKGFwcCwgJ2Jhc2UnKTtcbmNvbnN0IHRlc3RDYXNlID0gbmV3IGNkay5TdGFjayhhcHAsICdsaXN0LXBhcmFtJyk7XG5cbi8vIGNyZWF0ZXMgdGhlIGRlcGVuZGVuY3kgYmV0d2VlbiBzdGFja3Ncbm5ldyBjZGsuQ2ZuT3V0cHV0KHRlc3RDYXNlLCAnT3V0cHV0Jywge1xuICB2YWx1ZTogY2RrLkZuLmpvaW4oJywnLCBiYXNlLmxpc3RQYXJhbS5zdHJpbmdMaXN0VmFsdWUpLFxufSk7XG5cblxuLyoqXG4gKiBnZXQgdGhlIHZhbHVlIGZyb20gdGhlIGBiYXNlYCBzdGFjayBhbmQgdGhlbiB3cml0ZSBpdCB0byBhIG5ldyBwYXJhbWV0ZXJcbiAqIFdlIHdpbGwgdGhlbiBhc3NlcnQgdGhhdCB0aGUgdmFsdWUgdGhhdCBpcyB3cml0dGVuIGlzIHRoZSBjb3JyZWN0IHZhbHVlXG4gKiBUaGlzIHZhbGlkYXRlcyB0aGF0IHRoZSBgZnJvbVhYWGAgYW5kIGB2YWx1ZUZvclhYWGAgaW1wb3J0cyB0aGUgdmFsdWUgY29ycmVjdGx5XG4gKi9cblxuY29uc3QgZnJvbUF0dHJzID0gc3NtLlN0cmluZ0xpc3RQYXJhbWV0ZXIuZnJvbUxpc3RQYXJhbWV0ZXJBdHRyaWJ1dGVzKHRlc3RDYXNlLCAnRnJvbUF0dHJzJywge1xuICBwYXJhbWV0ZXJOYW1lOiBwYXJhbU5hbWUsXG4gIGVsZW1lbnRUeXBlOiBzc20uUGFyYW1ldGVyVmFsdWVUeXBlLlNUUklORyxcbn0pO1xuY29uc3Qgc3NtQXR0cnNWYWx1ZSA9IG5ldyBzc20uQ2ZuUGFyYW1ldGVyKHRlc3RDYXNlLCAnYXR0cnMtdGVzdCcsIHtcbiAgdHlwZTogJ1N0cmluZ0xpc3QnLFxuICB2YWx1ZTogY2RrLkZuLmpvaW4oJywnLCBmcm9tQXR0cnMuc3RyaW5nTGlzdFZhbHVlKSxcbn0pO1xuXG5jb25zdCB2YWx1ZSA9IHNzbS5TdHJpbmdMaXN0UGFyYW1ldGVyLnZhbHVlRm9yVHlwZWRMaXN0UGFyYW1ldGVyKHRlc3RDYXNlLCBwYXJhbU5hbWUsIHNzbS5QYXJhbWV0ZXJWYWx1ZVR5cGUuU1RSSU5HKTtcbmNvbnN0IHNzbVZhbHVlID0gbmV3IHNzbS5DZm5QYXJhbWV0ZXIodGVzdENhc2UsICd2YWx1ZS10ZXN0Jywge1xuICB0eXBlOiAnU3RyaW5nTGlzdCcsXG4gIHZhbHVlOiBjZGsuRm4uam9pbignLCcsIHZhbHVlKSxcbn0pO1xuXG5jb25zdCB2ZXJzaW9uVmFsdWUgPSBzc20uU3RyaW5nTGlzdFBhcmFtZXRlci52YWx1ZUZvclR5cGVkTGlzdFBhcmFtZXRlcih0ZXN0Q2FzZSwgcGFyYW1OYW1lLCBzc20uUGFyYW1ldGVyVmFsdWVUeXBlLlNUUklORywgMSk7XG5jb25zdCBzc21WZXJzaW9uVmFsdWUgPSBuZXcgc3NtLkNmblBhcmFtZXRlcih0ZXN0Q2FzZSwgJ3ZlcnNpb24tdmFsdWUtdGVzdCcsIHtcbiAgdHlwZTogJ1N0cmluZ0xpc3QnLFxuICB2YWx1ZTogY2RrLkZuLmpvaW4oJywnLCB2ZXJzaW9uVmFsdWUpLFxufSk7XG5cblxuY29uc3QgaW50ZWcgPSBuZXcgSW50ZWdUZXN0KGFwcCwgJ3NzbS1zdHJpbmctcGFyYW0nLCB7XG4gIHRlc3RDYXNlczogW1xuICAgIHRlc3RDYXNlLFxuICBdLFxufSk7XG5cbi8vIGxpc3QgdGhlIHBhcmFtZXRlcnNcbmNvbnN0IGFjdHVhbEF0dHJzID0gaW50ZWcuYXNzZXJ0aW9ucy5hd3NBcGlDYWxsKCdTU00nLCAnZ2V0UGFyYW1ldGVycycsIHtcbiAgTmFtZXM6IFtzc21WZXJzaW9uVmFsdWUucmVmLCBzc21WYWx1ZS5yZWYsIHNzbUF0dHJzVmFsdWUucmVmXSxcbn0pO1xuXG5hY3R1YWxBdHRycy5leHBlY3QoRXhwZWN0ZWRSZXN1bHQub2JqZWN0TGlrZSh7XG4gIFBhcmFtZXRlcnM6IE1hdGNoLmFycmF5V2l0aChbXG4gICAgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICBWYWx1ZTogcGFyYW1WYWx1ZS5qb2luKCcsJyksXG4gICAgfSksXG4gICAgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICBWYWx1ZTogcGFyYW1WYWx1ZS5qb2luKCcsJyksXG4gICAgfSksXG4gICAgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICBWYWx1ZTogcGFyYW1WYWx1ZS5qb2luKCcsJyksXG4gICAgfSksXG4gIF0pLFxufSkpO1xuIl19