"use client";

import { useUser } from "@/context/user";
import { redirect } from "next/navigation";


const Welcome = () => {
  const { user } = useUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div>
      <h1>Welcome {user?.email}</h1>
    </div>
  );
}

export default Welcome;
