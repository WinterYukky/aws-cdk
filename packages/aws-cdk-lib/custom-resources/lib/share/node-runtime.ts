import { Construct } from 'constructs';
import * as lambda from '../../../aws-lambda';
import { Stack } from '../../../core';
import { FactName } from '../../../region-info';

/**
 * The lambda runtime used by default for aws-cdk vended custom resources. Can change
 * based on region.
 */
export function builtInCustomResourceNodeRuntime(scope: Construct): lambda.Runtime {
  // Runtime regional fact should always return a known runtime string that lambda.Runtime
  // can index off, but for type safety we also default it here.
  const runtimeName = Stack.of(scope).regionalFact(FactName.DEFAULT_CR_NODE_VERSION, 'nodejs16.x');
  return runtimeName
    ? new lambda.Runtime(runtimeName, lambda.RuntimeFamily.NODEJS, { supportsInlineCode: true })
    : lambda.Runtime.NODEJS_16_X;
}
