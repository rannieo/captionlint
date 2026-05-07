"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Props = {
  planId: string;
  cta: string;
  featured: boolean;
};

export function PricingCtaButton({ planId, cta, featured }: Props) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  function handleClick() {
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push(planId === "free" ? "/create-account" : "/sign-in");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "mb-6 h-9 w-full rounded-md text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-60",
        featured
          ? "bg-[#22c55e] text-[#003915] hover:bg-[#4be277]"
          : "border border-[#3d4a3d] bg-[#131314] text-zinc-100 hover:bg-[#201f20]",
      )}
    >
      {cta}
    </button>
  );
}
