import { classed } from "~/lib/classed";

export const Row = classed.tr("transition-all duration-75", {
  variants: {
    even: {
      true: "bg-surface",
      false: "bg-surface-high"
    },
    last: {
      true: "rounded"
    }
  }
});
