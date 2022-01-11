/* eslint-disable quote-props */
import { Template } from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core';
import * as rum from '../lib';
import { AppMonitorTelemetory } from '../lib';

describe('app monitor', () => {
  test('default app monitor', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with cw log enabled', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      cwLogEnabled: true,
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'CwLogEnabled': true,
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with allow cookies', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        allowCookies: true,
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'AllowCookies': true,
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with enable X-Ray', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        enableXRay: true,
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'EnableXRay': true,
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with exclude pages', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        excludedPages: ['https://amazon.com/foo', 'https://amazon.com/bar'],
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'ExcludedPages': ['https://amazon.com/foo', 'https://amazon.com/bar'],
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with include pages', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        includedPages: ['https://amazon.com/foo', 'https://amazon.com/bar'],
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'IncludedPages': ['https://amazon.com/foo', 'https://amazon.com/bar'],
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with favorite pages', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        favoritePages: ['https://amazon.com/foo', 'https://amazon.com/bar'],
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'FavoritePages': ['https://amazon.com/foo', 'https://amazon.com/bar'],
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with session sample rate', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        sessionSampleRate: 1,
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
              'SessionSampleRate': 1,
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with telemetries', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        telemetries: [AppMonitorTelemetory.ERRORS, AppMonitorTelemetory.PERFORMANCE, AppMonitorTelemetory.HTTP],
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'GuestRoleArn': {
                'Fn::GetAtt': ['MyAppMonitorGuestRole572EC659', 'Arn'],
              },
              'IdentityPoolId': {
                'Ref': 'MyAppMonitorIdentityPool3A8D5F1C',
              },
              'Telemetries': ['errors', 'performance', 'http'],
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('app monitor with exist identity pool', () => {
    const stack = new cdk.Stack();

    new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
      appMonitorConfiguration: {
        identityPoolId: 'test-user-pool',
        guestRoleArn: 'arn:aws:iam::1111111:role/guest-role',
      },
    });

    Template.fromStack(stack).templateMatches({
      'Resources': {
        'MyAppMonitor37592055': {
          'Type': 'AWS::RUM::AppMonitor',
          'Properties': {
            'AppMonitorConfiguration': {
              'GuestRoleArn': 'arn:aws:iam::1111111:role/guest-role',
              'IdentityPoolId': 'test-user-pool',
            },
            'Name': 'my-app-monitor',
            'Domain': 'amazon.com',
          },
        },
      },
    });
  });

  test('get app monitor id', () => {
    const stack = new cdk.Stack();

    const appMonitor = new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
    });
    expect(stack.resolve(appMonitor.appMonitorId)).toEqual({ 'Fn::GetAtt': ['MyAppMonitorCustomGetAppMonitor15BA2BBF', 'AppMonitor.Id'] });
  });

  test('get app monitor ARN', () => {
    const stack = new cdk.Stack();

    const appMonitor = new rum.AppMonitor(stack, 'MyAppMonitor', {
      appMonitorName: 'my-app-monitor',
      domain: 'amazon.com',
    });
    expect(stack.resolve(appMonitor.appMonitorArn)).toEqual({
      'Fn::Join': [
        '',
        [
          'arn:', { 'Ref': 'AWS::Partition' },
          ':rum:', { 'Ref': 'AWS::Region' },
          ':', { 'Ref': 'AWS::AccountId' },
          ':appmonitor/my-app-monitor',
        ],
      ],
    });
  });
});