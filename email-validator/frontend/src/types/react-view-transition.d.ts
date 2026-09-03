/**
 * Type declarations for <ViewTransition> and addTransitionType.
 *
 * These APIs ship in react@canary (required outside Next.js), but
 * @types/react doesn't cover them yet — augment here until it does.
 * Prop semantics: https://react.dev/reference/react/ViewTransition
 */
import "react";

declare module "react" {
  export interface ViewTransitionClassPerType {
    readonly default: string;
    readonly [transitionType: string]: string;
  }

  export type ViewTransitionClass = string | ViewTransitionClassPerType;

  export interface ViewTransitionProps {
    children?: ReactNode;
    /** Fallback class for triggers not explicitly listed. "none" disables. */
    default?: ViewTransitionClass;
    /** Fires when the boundary first mounts inside a Transition. */
    enter?: ViewTransitionClass;
    /** Fires when the boundary unmounts inside a Transition. */
    exit?: ViewTransitionClass;
    /** Explicit view-transition-name; enables shared element pairs. */
    name?: string;
    /** Fires when a named pair forms (one unmounts, other mounts). */
    share?: ViewTransitionClass;
    /** Fires on DOM mutations inside without mount/unmount. */
    update?: ViewTransitionClass;
    onEnter?: (instance: unknown, types: string[]) => void;
    onExit?: (instance: unknown, types: string[]) => void;
    onShare?: (instance: unknown, types: string[]) => void;
    onUpdate?: (instance: unknown, types: string[]) => void;
  }

  export function ViewTransition(props: ViewTransitionProps): ReactNode;

  export function addTransitionType(type: string): void;
}
