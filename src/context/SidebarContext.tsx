import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const SIDEBAR_EXPANDED_WIDTH = 220;
export const SIDEBAR_LEFT_OFFSET = 5;

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  drawerWidth: number;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const drawerWidth = open ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const value = useMemo(
    () => ({ open, setOpen, drawerWidth }),
    [open, drawerWidth],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
