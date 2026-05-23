import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  TempUnit,
  getStoredTempUnit,
  setStoredTempUnit,
} from "../utils/weatherUtils";

interface TempUnitContextValue {
  unit: TempUnit;
  setUnit: (unit: TempUnit) => void;
  toggleUnit: () => void;
}

const TempUnitContext = createContext<TempUnitContextValue | null>(null);

export const TempUnitProvider = ({ children }: { children: ReactNode }) => {
  const [unit, setUnitState] = useState<TempUnit>(getStoredTempUnit);

  const setUnit = useCallback((next: TempUnit) => {
    setUnitState(next);
    setStoredTempUnit(next);
  }, []);

  const toggleUnit = useCallback(() => {
    setUnitState((prev) => {
      const next: TempUnit = prev === "C" ? "F" : "C";
      setStoredTempUnit(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ unit, setUnit, toggleUnit }),
    [unit, setUnit, toggleUnit],
  );

  return (
    <TempUnitContext.Provider value={value}>{children}</TempUnitContext.Provider>
  );
};

export const useTempUnit = () => {
  const ctx = useContext(TempUnitContext);
  if (!ctx) {
    throw new Error("useTempUnit must be used within TempUnitProvider");
  }
  return ctx;
};
