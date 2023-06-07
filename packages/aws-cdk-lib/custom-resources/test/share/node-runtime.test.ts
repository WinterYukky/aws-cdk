import * as lambda from '../../../aws-lambda';
import { App, Stack } from '../../../core';
import { builtInCustomResourceNodeRuntime } from '../../lib/share';

describe('builtInCustomResourceNodeRuntime', () => {
  test('returns node16 for commercial region', () => {
    const app = new App();
    const stack = new Stack(app, 'MyStack', { env: { region: 'us-east-1' } });

    const rt = builtInCustomResourceNodeRuntime(stack);
    expect(rt).toEqual(lambda.Runtime.NODEJS_16_X);
  });

  test('returns node14 for iso region', () => {
    const app = new App();
    const stack = new Stack(app, 'MyStack', { env: { region: 'us-iso-east-1' } });

    const rt = builtInCustomResourceNodeRuntime(stack);
    expect(rt).toEqual(lambda.Runtime.NODEJS_14_X);
  });
});