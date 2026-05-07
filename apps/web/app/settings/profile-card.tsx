"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function ProfileCard() {
  const { data: session } = authClient.useSession();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const sessionImage = session?.user?.image ?? "";

  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase() || "??";

  const [first, setFirst] = useState(parts[0] ?? "");
  const [last, setLast] = useState(parts.slice(1).join(" "));
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirst(parts[0] ?? "");
    setLast(parts.slice(1).join(" "));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    setAvatarPreview(sessionImage);
  }, [sessionImage]);

  function openFilePicker() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  function removeAvatar() {
    setAvatarPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveChanges() {
    setIsSaving(true);
    setSaveMsg(undefined);
    const fullName = [first.trim(), last.trim()].filter(Boolean).join(" ");
    const { error } = await authClient.updateUser({
      name: fullName || undefined,
      image: avatarPreview || undefined,
    });
    setIsSaving(false);
    setSaveMsg(error ? (error.message ?? "Failed to save.") : "Changes saved.");
  }

  return (
    <Card className="border border-[#1F2937] ring-0">
      <CardContent className="p-6">
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFileChange}
        />

        <div className="mb-8 flex items-center gap-6">
          <div className="relative grid size-20 place-items-center rounded-full border border-[#1F2937] bg-zinc-800 text-xl font-semibold text-zinc-200 overflow-hidden">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
            ) : (
              initials
            )}
            <button
              type="button"
              onClick={openFilePicker}
              className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border border-[#1F2937] bg-[#0B0F14] text-zinc-200 hover:text-[#22C55E] transition-colors"
              aria-label="Change avatar"
            >
              ✎
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-[#1F2937] bg-[#0B0F14]"
              onClick={openFilePicker}
            >
              Upload New
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-400 hover:text-[#ef4444]"
              onClick={removeAvatar}
            >
              Remove
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
              <Input
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className="border-[#1F2937] bg-[#0B0F14]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
              <Input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                className="border-[#1F2937] bg-[#0B0F14]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <Input
              value={email}
              disabled
              className="cursor-not-allowed border-[#1F2937] bg-[#1F2937] text-zinc-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            {saveMsg && (
              <span className={`text-xs ${saveMsg === "Changes saved." ? "text-[#22C55E]" : "text-[#ef4444]"}`}>
                {saveMsg}
              </span>
            )}
            <Button
              type="button"
              className="bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277] disabled:opacity-50"
              disabled={isSaving}
              onClick={saveChanges}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
