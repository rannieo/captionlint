import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { billingSummary, profileSummary } from "../../lib/settings-data";
import { featureFlags } from "@/lib/feature-flags";
import { SettingsSidebarNav } from "./settings-sidebar-nav";

const settingsDescription = featureFlags.showApiKeys
  ? "Manage account preferences, API keys, and workspace billing."
  : "Manage account preferences and workspace billing.";

export const metadata: Metadata = {
  title: "CaptionLint | Workspace Settings",
  description: settingsDescription,
};

export default function SettingsPage() {
  const [firstName, ...rest] = profileSummary.name.split(" ");
  const lastName = rest.join(" ") || "Owner";

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">Workspace Settings</span>}
        showShare={false}
        showExport={false}
      />

      <main className="min-h-screen bg-[#0B0F14] px-4 pb-16 pt-20 md:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Workspace Settings</h1>
            <p className="text-sm text-zinc-400">{settingsDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SettingsSidebarNav />

            <div className="space-y-12 pb-24 lg:col-span-2">
              <section id="profile" className="scroll-mt-24">
                <h2 className="mb-4 text-lg font-semibold text-zinc-100">Profile Context</h2>
                <Separator className="mb-6 bg-[#1F2937]" />
                <Card className="border border-[#1F2937] ring-0">
                  <CardContent className="p-6">
                    <div className="mb-8 flex items-center gap-6">
                      <div className="relative grid size-20 place-items-center rounded-full border border-[#1F2937] bg-zinc-800 text-xl font-semibold text-zinc-200">
                        {firstName?.[0] ?? "U"}{lastName?.[0] ?? "S"}
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full border-[#1F2937] bg-[#0B0F14] text-zinc-200 hover:text-[#22C55E]"
                        >
                          ✎
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-[#1F2937] bg-[#0B0F14]">Upload New</Button>
                        <Button variant="ghost" className="text-zinc-400 hover:text-[#ef4444]">Remove</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
                          <Input defaultValue={firstName} className="border-[#1F2937] bg-[#0B0F14]" />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
                          <Input defaultValue={lastName} className="border-[#1F2937] bg-[#0B0F14]" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                        <Input defaultValue="jane.doe@captionlint.io" disabled className="cursor-not-allowed border-[#1F2937] bg-[#1F2937] text-zinc-400" />
                      </div>
                      <div className="flex justify-end pt-3">
                        <Button className="bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277]">Save Changes</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {featureFlags.showApiKeys ? (
                <section id="api" className="scroll-mt-24">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-100">API Authentication</h2>
                  <Separator className="mb-6 bg-[#1F2937]" />
                  <Card className="border border-[#1F2937] ring-0">
                    <div className="flex items-center justify-between border-b border-[#1F2937] bg-[#1F2937] px-4 py-4 rounded-t-xl">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">Active Keys</p>
                        <p className="mt-0.5 text-xs text-zinc-400">Manage your API keys for external integrations.</p>
                      </div>
                      <Button variant="outline" className="border-[#1F2937] bg-[#0B0F14]">+ Generate Key</Button>
                    </div>
                    <div className="divide-y divide-[#1F2937]">
                      {[
                        { name: "Production Env", key: "cqa_live_x89...4k2p", created: "Created Oct 12, 2023" },
                        { name: "Staging Env", key: "cqa_test_m21...9v8n", created: "Created Nov 05, 2023" },
                      ].map((apiKey) => (
                        <div key={apiKey.key} className="flex items-center justify-between px-4 py-4 hover:bg-[#1F2937]">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">🔑</span>
                            <div>
                              <p className="text-sm font-medium text-zinc-100">{apiKey.name}</p>
                              <p className="mt-0.5 font-mono text-xs text-zinc-400">{apiKey.key}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400">{apiKey.created}</span>
                            <Button type="button" size="icon-sm" variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                              ⧉
                            </Button>
                            <Button type="button" size="icon-sm" variant="ghost" className="text-zinc-400 hover:text-[#ef4444]">
                              🗑
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              ) : null}

              <section id="usage" className="scroll-mt-24">
                <h2 className="mb-4 text-lg font-semibold text-zinc-100">Resource Usage &amp; Plan</h2>
                <Separator className="mb-6 bg-[#1F2937]" />
                <Card className="border border-[#1F2937] ring-0">
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-zinc-100">{billingSummary.plan} Plan</h3>
                        <p className="mt-1 text-sm text-zinc-400">Next invoice: {billingSummary.nextInvoiceDate}</p>
                      </div>
                      <Badge variant="outline" className="h-auto rounded border-[#1F2937] bg-[#1F2937] px-2 py-1 text-xs text-zinc-300">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-zinc-400">Caption Linting Hours</span>
                          <span className="font-mono text-zinc-100">45 / 100 hrs</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#1F2937]">
                          <div className="h-full w-[45%] bg-[#22C55E]" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-zinc-400">Storage</span>
                          <span className="font-mono text-zinc-100">12 / 50 GB</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#1F2937]">
                          <div className="h-full w-[24%] bg-[#22C55E]" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-2 border-t border-[#1F2937] pt-6">
                      <Button variant="outline" className="border-[#1F2937] bg-[#0B0F14]">Manage Billing</Button>
                      <Button className="bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277]">Upgrade Plan</Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="preferences" className="scroll-mt-24">
                <h2 className="mb-4 text-lg font-semibold text-zinc-100">Global Preferences</h2>
                <Separator className="mb-6 bg-[#1F2937]" />
                <Card className="border border-[#1F2937] ring-0">
                  {[
                    {
                      title: "Strict Linting Mode",
                      description: "Enforce maximum grammatical constraints and flag minor tonal inconsistencies across all projects by default.",
                      enabled: true,
                    },
                    {
                      title: "Beta Features Access",
                      description: "Opt-in to experimental UI changes and upcoming linting algorithms before public release.",
                      enabled: false,
                    },
                  ].map((pref, i, arr) => (
                    <div key={pref.title}>
                      <div className="flex items-center justify-between px-6 py-5">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-100">{pref.title}</h4>
                          <p className="mt-1 max-w-md text-xs text-zinc-400">{pref.description}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          role="switch"
                          aria-checked={pref.enabled}
                          className={`relative h-5 w-9 rounded-full px-0 transition ${
                            pref.enabled ? "bg-[#22C55E]" : "bg-[#1F2937]"
                          }`}
                        >
                          <span className={`absolute top-[2px] size-4 rounded-full bg-white transition ${pref.enabled ? "left-[18px]" : "left-[2px]"}`} />
                        </Button>
                      </div>
                      {i < arr.length - 1 && <Separator className="bg-[#1F2937]" />}
                    </div>
                  ))}
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
