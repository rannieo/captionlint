"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type HistoryEditClientProps = {
  file: string;
  defaultPreset: string;
};

const availablePresets = ["Default", "TikTok", "Instagram", "YouTube Shorts"] as const;

export function HistoryEditClient({ file, defaultPreset }: HistoryEditClientProps) {
  const initialPreset = availablePresets.includes(defaultPreset as (typeof availablePresets)[number])
    ? defaultPreset
    : "Default";
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);

  const rerunHref = useMemo(() => {
    return `/upload?source=${encodeURIComponent(file)}&preset=${encodeURIComponent(selectedPreset)}`;
  }, [file, selectedPreset]);

  return (
    <Card className="border-[#1F2937] bg-[#111827]">
      <CardHeader>
        <CardTitle className="text-base">Edit Re-fix Preset</CardTitle>
        <CardDescription className="text-zinc-400">
          Choose a different preset and start a new lint run from this previous file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Target Preset</label>
          <Select value={selectedPreset} onValueChange={(value) => setSelectedPreset(value ?? "Default")}>
            <SelectTrigger className="border-[#1F2937] bg-[#0B0F14]">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {availablePresets.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button render={<Link href={rerunHref} />} nativeButton={false}>
            Apply Re-fix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
