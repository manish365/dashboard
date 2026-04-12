import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}

