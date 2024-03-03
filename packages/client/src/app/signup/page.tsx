
"use client";

import { useUser } from "@/context/user";
import Signup from "@/features/signup";
import { redirect } from "next/navigation";

const SignupPage = () => {
  const { user } = useUser();

  if (user) {
    redirect("/welcome");
  }

  return (
    <div>
      <h1>Signup</h1>
      <Signup />
    </div>
  );
}

export default SignupPage;
