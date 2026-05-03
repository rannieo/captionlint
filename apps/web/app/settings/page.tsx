import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billingSummary, profileSummary } from "../../lib/settings-data";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Workspace Settings",
  description: "Manage account preferences, API keys, and workspace billing.",
};

export default function SettingsPage() {
  const [firstName, ...rest] = profileSummary.name.split(" ");
  const lastName = rest.join(" ") || "Owner";

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <span className="border-b-2 border-[#22C55E] pb-[14px] pt-[16px] font-mono text-sm font-semibold text-zinc-100">
            video_final.srt
          </span>
        }
        rightSlot={
          <Button size="sm" variant="ghost" className="h-7 text-[#22C55E] hover:bg-[#1F2937]">
            Share
          </Button>
        }
        exportLabel="Export"
      />

      <main className="min-h-screen overflow-y-auto bg-[#131314] px-6 pb-16 pt-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Workspace Settings</h1>
            <p className="text-sm text-zinc-400">Manage your account preferences, API keys, and workspace billing.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="sticky top-20 hidden h-fit space-y-2 lg:block">
              <a href="#profile" className="block rounded border-l-2 border-[#22C55E] bg-[#201f20] px-3 py-2 text-sm font-medium text-white">
                Profile Context
              </a>
              {featureFlags.showApiKeys ? (
                <a href="#api" className="block rounded px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-[#2a2a2b] hover:text-white">
                  API Authentication
                </a>
              ) : null}
              <a href="#usage" className="block rounded px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-[#2a2a2b] hover:text-white">
                Resource Usage &amp; Plan
              </a>
              <a href="#preferences" className="block rounded px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-[#2a2a2b] hover:text-white">
                Global Preferences
              </a>
            </div>

            <div className="space-y-12 pb-24 lg:col-span-2">
              <section id="profile" className="scroll-mt-24">
                <div className="mb-6 border-b border-[#353436] pb-4">
                  <h2 className="text-lg font-semibold text-zinc-100">Profile Context</h2>
                </div>
                <div className="rounded-xl border border-[#353436] bg-[#1c1b1c] p-6">
                  <div className="mb-8 flex items-center gap-6">
                    <div className="relative grid size-20 place-items-center rounded-full border border-[#353436] bg-zinc-800 text-xl font-semibold text-zinc-200">
                      {firstName?.[0] ?? "U"}
                      {lastName?.[0] ?? "S"}
                      <button className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border border-[#353436] bg-[#131314] text-zinc-200 transition-colors hover:text-[#22C55E]">
                        ✎
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-[#353436] bg-[#131314]">
                        Upload New
                      </Button>
                      <Button variant="ghost" className="text-zinc-400 hover:text-[#ef4444]">
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
                        <Input defaultValue={firstName} className="border-[#353436] bg-[#0A0A0B]" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
                        <Input defaultValue={lastName} className="border-[#353436] bg-[#0A0A0B]" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                      <Input defaultValue="jane.doe@captionlint.io" disabled className="cursor-not-allowed border-[#353436] bg-[#201f20] text-zinc-400" />
                    </div>
                    <div className="flex justify-end pt-3">
                      <Button className="bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277]">Save Changes</Button>
                    </div>
                  </div>
                </div>
              </section>

              {featureFlags.showApiKeys ? (
                <section id="api" className="scroll-mt-24">
                  <div className="mb-6 border-b border-[#353436] pb-4">
                    <h2 className="text-lg font-semibold text-zinc-100">API Authentication</h2>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[#353436] bg-[#1c1b1c]">
                    <div className="flex items-center justify-between border-b border-[#353436] bg-[#201f20] p-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">Active Keys</p>
                        <p className="mt-0.5 text-xs text-zinc-400">Manage your API keys for external integrations.</p>
                      </div>
                      <Button variant="outline" className="border-[#353436] bg-[#131314]">
                        + Generate Key
                      </Button>
                    </div>
                    <div className="divide-y divide-[#353436]">
                      {[
                        { name: "Production Env", key: "cqa_live_x89...4k2p", created: "Created Oct 12, 2023" },
                        { name: "Staging Env", key: "cqa_test_m21...9v8n", created: "Created Nov 05, 2023" },
                      ].map((apiKey) => (
                        <div key={apiKey.key} className="flex items-center justify-between p-4 hover:bg-[#2a2a2b]">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">🔑</span>
                            <div>
                              <p className="text-sm font-medium text-zinc-100">{apiKey.name}</p>
                              <p className="mt-0.5 font-mono text-xs text-zinc-400">{apiKey.key}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400">{apiKey.created}</span>
                            <button className="text-zinc-400 hover:text-zinc-100">⧉</button>
                            <button className="text-zinc-400 hover:text-[#ef4444]">🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <section id="usage" className="scroll-mt-24">
                <div className="mb-6 border-b border-[#353436] pb-4">
                  <h2 className="text-lg font-semibold text-zinc-100">Resource Usage &amp; Plan</h2>
                </div>
                <div className="rounded-xl border border-[#353436] bg-[#1c1b1c] p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-100">{billingSummary.plan} Plan</h3>
                      <p className="mt-1 text-sm text-zinc-400">Next invoice: {billingSummary.nextInvoiceDate}</p>
                    </div>
                    <span className="rounded border border-[#1E293B] bg-[#18181B] px-2 py-1 text-xs text-zinc-300">Active</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-400">Caption Linting Hours</span>
                        <span className="font-mono text-zinc-100">45 / 100 hrs</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full border border-[#353436] bg-[#201f20]">
                        <div className="h-full w-[45%] bg-[#22C55E]" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-400">Storage</span>
                        <span className="font-mono text-zinc-100">12 / 50 GB</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full border border-[#353436] bg-[#201f20]">
                        <div className="h-full w-[24%] bg-[#22C55E]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-2 border-t border-[#353436] pt-6">
                    <Button variant="outline" className="border-[#353436] bg-[#131314]">Manage Billing</Button>
                    <Button className="bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277]">Upgrade Plan</Button>
                  </div>
                </div>
              </section>

              <section id="preferences" className="scroll-mt-24">
                <div className="mb-6 border-b border-[#353436] pb-4">
                  <h2 className="text-lg font-semibold text-zinc-100">Global Preferences</h2>
                </div>
                <div className="divide-y divide-[#353436] overflow-hidden rounded-xl border border-[#353436] bg-[#1c1b1c]">
                  {[
                    {
                      title: "Strict Linting Mode",
                      description:
                        "Enforce maximum grammatical constraints and flag minor tonal inconsistencies across all projects by default.",
                      enabled: true,
                    },
                    {
                      title: "Beta Features Access",
                      description:
                        "Opt-in to experimental UI changes and upcoming linting algorithms before public release.",
                      enabled: false,
                    },
                  ].map((pref) => (
                    <div key={pref.title} className="flex items-center justify-between p-6">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-100">{pref.title}</h4>
                        <p className="mt-1 max-w-md text-xs text-zinc-400">{pref.description}</p>
                      </div>
                      <button className={`relative h-5 w-9 rounded-full transition ${pref.enabled ? "bg-[#22C55E]" : "bg-[#353436]"}`}>
                        <span
                          className={`absolute top-[2px] size-4 rounded-full bg-white transition ${pref.enabled ? "left-[18px]" : "left-[2px]"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
