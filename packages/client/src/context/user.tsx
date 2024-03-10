"use client";
import { User } from "@/model/user";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

export const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => { },
});

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch('/api/users/current-user')
        const { currentUser } = await res.json()
        console.log('initialUser: ', currentUser)
        setUser(currentUser ?? null)
      } catch (error) {

      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  const contextValue = useMemo(() => ({ user, setUser }), [user, setUser])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}