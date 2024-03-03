"use client";

import { useUser } from "@/context/user";
import { redirect } from "next/navigation";
import { useState } from "react";

const Signout = () => {
  const [error, setError] = useState<string | null>(null);

  const { user, setUser } = useUser();

  if (!user) {
    redirect("/signin");
  }

  const onLogout = async () => {
    try {
      const response = await fetch("/api/users/signout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        redirect("/signin");
      }
    } catch (error) {
      setError("Something went wrong");
      console.error(error);
    }
  };
  return (
    <div>
      <h1>Do you want to logout?</h1>
      <button onClick={onLogout}>Yes</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Signout;
