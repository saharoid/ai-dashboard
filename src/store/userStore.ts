// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'Admin' | 'Viewer';

interface UserState {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userRole: 'Admin',
      setUserRole: (role) => set({ userRole: role }),
    }),
    {
      name: 'user-store',
    }
  )
);
