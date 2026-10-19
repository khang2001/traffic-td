import { StateMachine, type State } from '../src/engine/state-machine/state-machine';

function state(name: string, hooks: Partial<State> = {}): State {
  return { name, stateMachine: undefined as unknown as StateMachine, ...hooks };
}

describe('StateMachine (ported from portfolio-game, with fixes)', () => {
  it('passes args to onEnter un-nested', () => {
    const sm = new StateMachine('t');
    const seen: unknown[][] = [];
    sm.addState(state('A'));
    sm.addState(state('B', { onEnter: (args) => seen.push(args) }));
    sm.setState('A');
    sm.setState('B', 'UP', 7);
    expect(seen).toEqual([['UP', 7]]);
  });

  it('queues a change requested during onEnter instead of applying it immediately (fix #1)', () => {
    const sm = new StateMachine('t');
    const order: string[] = [];
    sm.addState(state('A', { onEnter: () => { order.push('enter A'); sm.setState('B', 'x'); } }));
    sm.addState(state('B', { onEnter: (args) => order.push(`enter B ${JSON.stringify(args)}`) }));
    sm.setState('A');
    expect(sm.currentStateName).toBe('A'); // not switched mid-transition
    sm.update(1 / 60);
    expect(sm.currentStateName).toBe('B');
    expect(order).toEqual(['enter A', 'enter B ["x"]']); // queued args spread, not [["x"]] (fix #2)
  });

  it('calls onExit, ignores same-state and unknown-state changes', () => {
    const sm = new StateMachine('t');
    const exits: string[] = [];
    sm.addState(state('A', { onExit: () => exits.push('A') }));
    sm.addState(state('B'));
    sm.setState('A');
    sm.setState('A');
    sm.setState('NOPE');
    expect(sm.currentStateName).toBe('A');
    sm.setState('B');
    expect(exits).toEqual(['A']);
  });

  it('runs onUpdate with dt', () => {
    const sm = new StateMachine('t');
    let total = 0;
    sm.addState(state('A', { onUpdate: (dt) => (total += dt) }));
    sm.setState('A');
    sm.update(0.5);
    sm.update(0.25);
    expect(total).toBeCloseTo(0.75);
  });
});
