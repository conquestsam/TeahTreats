'use client';

import { create } from 'zustand';

interface UiShellState {
  adminSidebarCollapsed: boolean;
  cartDrawerOpen: boolean;
  mobileNavOpen: boolean;
  searchDrawerOpen: boolean;
  closeCartDrawer: () => void;
  closeMobileNav: () => void;
  closeSearchDrawer: () => void;
  openCartDrawer: () => void;
  openMobileNav: () => void;
  openSearchDrawer: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleAdminSidebar: () => void;
  toggleMobileNav: () => void;
}

export const useUiShellStore = create<UiShellState>((set) => ({
  adminSidebarCollapsed: false,
  cartDrawerOpen: false,
  mobileNavOpen: false,
  searchDrawerOpen: false,
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  closeSearchDrawer: () => set({ searchDrawerOpen: false }),
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  openMobileNav: () => set({ mobileNavOpen: true }),
  openSearchDrawer: () => set({ searchDrawerOpen: true }),
  setAdminSidebarCollapsed: (adminSidebarCollapsed) => set({ adminSidebarCollapsed }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleAdminSidebar: () => set((state) => ({ adminSidebarCollapsed: !state.adminSidebarCollapsed })),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen }))
}));
