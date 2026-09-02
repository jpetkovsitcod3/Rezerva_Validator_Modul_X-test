/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { MotionGlobalConfig } from "framer-motion";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Deterministic, instant motion in jsdom.
MotionGlobalConfig.skipAnimations = true;

// jsdom has no IntersectionObserver; framer-motion's whileInView feature
// constructs one on mount, so stub it globally for the test environment.
class IntersectionObserverStub {
  readonly root: Element | Document | null = null;
  readonly rootMargin = "0px";
  readonly thresholds: readonly number[] = [0];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}

afterEach(() => {
  cleanup();
});
