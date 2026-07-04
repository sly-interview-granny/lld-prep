import { chainOfResponsibilityBody } from './chain-of-responsibility';
import { commandBody } from './command';
import { interpreterBody } from './interpreter';
import { iteratorBody } from './iterator';
import { mediatorBody } from './mediator';
import { mementoBody } from './memento';
import { nullObjectBody } from './null-object';
import { observerBody } from './observer';
import { stateBody } from './state';
import { strategyBody } from './strategy';
import { templateBody } from './template';
import { visitorBody } from './visitor';

export const behaviouralBodies: Record<string, string> = {
  state: stateBody,
  strategy: strategyBody,
  observer: observerBody,
  'chain-of-responsibility': chainOfResponsibilityBody,
  template: templateBody,
  iterator: iteratorBody,
  interpreter: interpreterBody,
  command: commandBody,
  visitor: visitorBody,
  mediator: mediatorBody,
  memento: mementoBody,
  'null-object': nullObjectBody,
};

export const behaviouralSlugs = Object.keys(behaviouralBodies);
