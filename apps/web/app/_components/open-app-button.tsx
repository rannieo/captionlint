"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function OpenAppButton() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  function handleClick() {
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-[#22c55e] transition-colors hover:text-[#4be277] disabled:opacity-60"
    >
      Open App
    </button>
  );
}
