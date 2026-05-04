import type { CaptionCue, CaptionFormat, ParseResult, ParserWarning } from "@repo/shared-types";

const TIMING_SEPARATOR = /\s+-->\s+/;

export function detectCaptionFormat(filename: string, content: string): CaptionFormat | undefined {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "srt") return "SRT";
  if (extension === "vtt") return "VTT";
  if (content.trimStart().startsWith("WEBVTT")) return "VTT";
  return undefined;
}

export function parseCaptionFile(filename: string, content: string): ParseResult {
  const format = detectCaptionFormat(filename, content);
  if (!format) {
    return {
      format: "SRT",
      cues: [],
      warnings: [
        {
          code: "UNSUPPORTED_FORMAT",
          message: "CaptionLint supports .srt and .vtt files for MVP QA.",
        },
      ],
    };
  }

  return format === "VTT" ? parseVtt(content) : parseSrt(content);
}

export function parseSrt(content: string): ParseResult {
  return parseBlocks("SRT", normalizeLineEndings(content).split(/\n{2,}/));
}

export function parseVtt(content: string): ParseResult {
  const normalized = normalizeLineEndings(content)
    .replace(/^\uFEFF/, "")
    .split("\n")
    .filter((line, index) => index !== 0 || !line.trim().startsWith("WEBVTT"))
    .join("\n");

  const blocks = normalized
    .split(/\n{2,}/)
    .filter((block) => {
      const trimmed = block.trim();
      return trimmed.length > 0 && !trimmed.startsWith("NOTE") && !trimmed.startsWith("STYLE");
    });

  return parseBlocks("VTT", blocks);
}

export function serializeCaptionFile(format: CaptionFormat, cues: CaptionCue[]): string {
  if (format === "VTT") {
    return `WEBVTT\n\n${cues.map(formatVttCue).join("\n\n")}\n`;
  }

  return `${cues.map(formatSrtCue).join("\n\n")}\n`;
}

function parseBlocks(format: CaptionFormat, blocks: string[]): ParseResult {
  const warnings: ParserWarning[] = [];
  const cues: CaptionCue[] = [];

  blocks.forEach((block, blockIndex) => {
    const rawLines = block.split("\n").map((line) => line.trimEnd());
    const lines = rawLines.filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;

    const timingLineIndex = lines.findIndex((line) => TIMING_SEPARATOR.test(line));
    if (timingLineIndex === -1) {
      warnings.push({
        code: "MALFORMED_CUE",
        message: "Cue is missing a timing line.",
        cueIndex: blockIndex + 1,
        raw: block,
      });
      return;
    }

    const explicitIndexRaw = timingLineIndex > 0 ? Number.parseInt(lines[timingLineIndex - 1] ?? "", 10) : Number.NaN;
    const cueIndex = Number.isFinite(explicitIndexRaw) ? explicitIndexRaw : cues.length + 1;
    const timingLine = lines[timingLineIndex]!;
    const [startRaw, endWithSettings] = timingLine.split(TIMING_SEPARATOR);
    const endRaw = endWithSettings?.split(/\s+/)[0];
    const startMs = parseTimestamp(startRaw ?? "", format);
    const endMs = parseTimestamp(endRaw ?? "", format);

    if (startMs === undefined || endMs === undefined || endMs < startMs) {
      warnings.push({
        code: "MALFORMED_TIMESTAMP",
        message: "Cue has a malformed timestamp range.",
        cueIndex,
        raw: block,
      });
      return;
    }

    const cueLines = lines.slice(timingLineIndex + 1);
    if (cueLines.length === 0 || cueLines.join("").trim().length === 0) {
      warnings.push({
        code: "EMPTY_CUE",
        message: "Cue has no caption text.",
        cueIndex,
        raw: block,
      });
    }

    cues.push({
      index: cueIndex,
      startMs,
      endMs,
      text: cueLines.join("\n"),
      lines: cueLines,
      raw: block,
    });
  });

  return { format, cues, warnings };
}

function parseTimestamp(value: string, format: CaptionFormat): number | undefined {
  const normalized = value.trim().replace(",", ".");
  const parts = normalized.split(":");
  if (parts.length < 2 || parts.length > 3) return undefined;

  const [hoursRaw, minutesRaw, secondsRaw] = parts.length === 3 ? parts : ["0", parts[0], parts[1]];
  const secondsParts = (secondsRaw ?? "").split(".");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = Number.parseInt(minutesRaw ?? "", 10);
  const seconds = Number.parseInt(secondsParts[0] ?? "", 10);
  const millisRaw = secondsParts[1] ?? "0";
  const millis = Number.parseInt(millisRaw.padEnd(3, "0").slice(0, 3), 10);

  if ([hours, minutes, seconds, millis].some((part) => Number.isNaN(part))) return undefined;
  if (minutes > 59 || seconds > 59) return undefined;
  if (format === "SRT" && !value.includes(",")) return undefined;

  return hours * 3_600_000 + minutes * 60_000 + seconds * 1000 + millis;
}

function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function formatSrtCue(cue: CaptionCue): string {
  return `${cue.index}\n${formatTimestamp(cue.startMs, "SRT")} --> ${formatTimestamp(cue.endMs, "SRT")}\n${cue.lines.join("\n")}`;
}

function formatVttCue(cue: CaptionCue): string {
  return `${formatTimestamp(cue.startMs, "VTT")} --> ${formatTimestamp(cue.endMs, "VTT")}\n${cue.lines.join("\n")}`;
}

function formatTimestamp(ms: number, format: CaptionFormat): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  const separator = format === "SRT" ? "," : ".";
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${String(millis).padStart(3, "0")}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
