"use client";

import { useUser } from "@/context/user";
import Signin from "@/features/signin";
import Link from "next/link";
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
      <Link href="/signup">
        Signup
      </Link>
    </div>
  );
}

export default SigninPage;
