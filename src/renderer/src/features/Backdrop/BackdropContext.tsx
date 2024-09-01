import { MouseEventHandler, ReactNode, createContext } from "react";
import { classed } from "~/lib/classed";
import { useBackdrop } from "./useBackdrop";

export interface BackdropContext {
  addBackdrop: (
    backdropId: string | number,
    handleClick?: MouseEventHandler<HTMLButtonElement>
  ) => void;
  removeBackdrop: (backdropId: string | number) => void;
}

export const BackdropContext = createContext<BackdropContext>({
  addBackdrop: () => {},
  removeBackdrop: () => {}
});

export const Backdrop = classed.button(
  "fixed top-0 left-0 z-30 w-full h-full transition-all duration-200 ease-in-out cursor-pointer bg-surface-secondary",
  {
    variants: {
      open: {
        true: "opacity-50 pointer-events-auto",
        false: "opacity-0 pointer-events-none"
      }
    }
  }
);

export function BackdropProvider({ children }: { children: ReactNode }) {
  const { addBackdrop, removeBackdrop, shouldShowBackdrop, handleBackdropClick } = useBackdrop();

  return (
    <BackdropContext.Provider value={{ addBackdrop, removeBackdrop }}>
      {children}
      <Backdrop open={shouldShowBackdrop} onClick={handleBackdropClick} />
    </BackdropContext.Provider>
  );
}
