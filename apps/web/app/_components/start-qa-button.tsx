"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function StartQaButton() {
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
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#22C55E] px-6 text-base font-medium text-[#003915] transition-colors hover:bg-[#4BE277] disabled:opacity-60"
    >
      Start QA Workflow <span>→</span>
    </button>
  );
}
