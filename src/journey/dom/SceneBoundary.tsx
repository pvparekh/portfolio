import { Component, type ReactNode } from 'react';
import { demoteForSession } from '../../spatial/core/capability';

/** A WebGL failure removes the 3D environment; the DOM journey keeps working. */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) {
    console.warn('[journey] 3D environment disabled after an error.', error);
    demoteForSession();
  }
  render() { return this.state.failed ? null : this.props.children; }
}
