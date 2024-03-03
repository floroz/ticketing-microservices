"use client";

import { useUser } from "@/context/user";
import Signin from "@/features/signin";
import { redirect } from "next/navigation";

const SigninPage = () => {
  const { user } = useUser();

  if (user) {
    redirect("/welcome");
  }

  return (
    <div>
      <h1>Signin</h1>
      <Signin />
    </div>
  );
}

export default SigninPage;
