import React, { useEffect } from "react";
import type { PdfFormData, PdfDoctorData } from "@/lib/pdf";

export const PRESCRIPTION_TEMPLATE_ID = "rx-pdf-capture";

// Colors from the original pdf-lib layout
const C = {
  green: "rgb(5, 127, 11)",
  purple: "rgb(92, 56, 153)",
  text: "rgb(28, 28, 28)",
  line: "rgb(171, 171, 171)",
  sub: "rgb(94, 94, 94)",
} as const;

const FONT = "'Noto Sans Bengali', 'Noto Sans', system-ui, sans-serif";

function prettyTimes(t?: string): string {
  if (!t) return "";
  const parts = t.split("+");
  if (parts.every((p) => p === "0" || p === "")) return "Anytime";
  const labels = ["Morning", "Noon", "Night"];
  return parts
    .map((p, i) => (p === "1" ? labels[i] : ""))
    .filter(Boolean)
    .join(" + ");
}

function ordinalSuffix(d: number): string {
  if (d % 10 === 1 && d !== 11) return "st";
  if (d % 10 === 2 && d !== 12) return "nd";
  if (d % 10 === 3 && d !== 13) return "rd";
  return "th";
}

function formatFollowupDate(baseDate: string, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  return `${day}${ordinalSuffix(day)} ${month}, ${d.getFullYear()}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "8px", marginBottom: "5px", width: "fit-content" }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "11pt",
          fontFamily: FONT,
          color: C.text,
          paddingBottom: "5px",
        }}
      >
        {children}
      </div>
      <div style={{ height: "1px", backgroundColor: C.text }} />
    </div>
  );
}

function BulletLine({ text }: { text: string }) {
  return (
    <div
      style={{
        paddingLeft: "14px",
        marginBottom: "2px",
        fontSize: "11pt",
        fontFamily: FONT,
        color: C.text,
        lineHeight: 1.35,
      }}
    >
      • {text}
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span style={{ whiteSpace: "nowrap", fontSize: "11pt", fontFamily: FONT, color: C.text }}>
      <span style={{ fontWeight: "bold" }}>{label}</span>
      <span style={{ display: "inline-block", width: "8px" }} />
      <span>{value}</span>
    </span>
  );
}

export function PrescriptionTemplate({
  data,
  doctor,
  onMount,
}: {
  data: PdfFormData;
  doctor: PdfDoctorData;
  onMount?: () => void;
}) {
  // Signal the parent after first paint so html2canvas captures a fully rendered element
  useEffect(() => {
    onMount?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const degreesArr = (doctor?.degrees ?? []).filter(Boolean);
  const degLine1 = degreesArr.slice(0, 2).join(", ");
  const degLine2 = degreesArr.slice(2, 4).join(", ");

  const puidText =
    typeof data.puid === "number"
      ? `P-${String(data.puid).padStart(4, "0")}`
      : "—";

  const sexLabel = data.sex
    ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1)
    : "—";

  const followupDays =
    typeof data.followupDays === "number" && data.followupDays > 0
      ? data.followupDays
      : undefined;

  const rxList = (data.rx ?? []).filter(
    (r) =>
      (r.drug && r.drug.trim()) || r.durationDays || r.timesPerDay || r.timing,
  );

  return (
    <div
      id={PRESCRIPTION_TEMPLATE_ID}
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        padding: "40px",
        fontFamily: FONT,
        fontSize: "11pt",
        color: C.text,
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        {/* Left: doctor */}
        <div>
          <div
            style={{
              fontSize: "16pt",
              fontWeight: "bold",
              color: C.green,
              fontFamily: FONT,
              lineHeight: 1.2,
              marginBottom: "2px",
            }}
          >
            {doctor?.name ?? ""}
          </div>
          {degLine1 && (
            <div
              style={{ fontSize: "11pt", fontFamily: FONT, lineHeight: 1.35 }}
            >
              {degLine1}
            </div>
          )}
          {degLine2 && (
            <div
              style={{ fontSize: "11pt", fontFamily: FONT, lineHeight: 1.35 }}
            >
              {degLine2}
            </div>
          )}
          {doctor?.designation && (
            <div
              style={{
                fontSize: "11pt",
                color: C.purple,
                fontFamily: FONT,
                lineHeight: 1.35,
              }}
            >
              {doctor.designation}
            </div>
          )}
          {doctor?.bmdcNo && (
            <div
              style={{
                fontSize: "11pt",
                color: C.green,
                fontFamily: FONT,
                lineHeight: 1.35,
              }}
            >
              BMDC Reg. No: {doctor.bmdcNo}
            </div>
          )}
        </div>

        {/* Right: chamber */}
        <div style={{ textAlign: "right" }}>
          {doctor?.chamberName && (
            <div
              style={{ fontSize: "11pt", fontFamily: FONT, lineHeight: 1.35 }}
            >
              {doctor.chamberName}
            </div>
          )}
          {doctor?.chamberAddress && (
            <div
              style={{ fontSize: "11pt", fontFamily: FONT, lineHeight: 1.35 }}
            >
              {doctor.chamberAddress}
            </div>
          )}
          {doctor?.mobile && (
            <div
              style={{ fontSize: "11pt", fontFamily: FONT, lineHeight: 1.35 }}
            >
              Phone: {doctor.mobile}
            </div>
          )}
        </div>
      </div>

      {/* Header divider */}
      <div style={{ borderBottom: `1px solid ${C.line}` }} />

      {/* ── PATIENT INFO ────────────────────────────────────────────── */}
      <div style={{ paddingTop: "8px", paddingBottom: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            columnGap: "20px",
            rowGap: "8px",
            alignItems: "baseline",
          }}
        >
          <div><LabelValue label="Name:" value={data.name || "—"} /></div>
          <div><LabelValue label="Sex:" value={sexLabel} /></div>
          <div><LabelValue label="PUID:" value={puidText} /></div>
          <div><LabelValue label="Mobile:" value={data.mobile || "—"} /></div>

          <div />
          <div><LabelValue label="Age:" value={data.age ?? "—"} /></div>
          <div>
            <LabelValue
              label="Weight:"
              value={data.weight != null && data.weight !== "" ? String(data.weight) : "—"}
            />
          </div>
          <div>
            <LabelValue
              label="Date:"
              value={data.date ? new Date(data.date).toLocaleDateString() : "—"}
            />
          </div>
        </div>
      </div>

      {/* Patient info divider */}
      <div
        style={{
          borderBottom: `1px solid ${C.line}`,
          marginBottom: "24px",
        }}
      />

      {/* ── BODY: two columns ───────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
        {/* LEFT COLUMN */}
        <div
          style={{
            flex: "0 0 calc(52% - 12px)",
            paddingRight: "12px",
            minWidth: 0,
          }}
        >
          {/* Visit No */}
          <div style={{ marginBottom: "10px" }}>
            <span
              style={{ fontWeight: "bold", fontSize: "11pt", fontFamily: FONT }}
            >
              Visit No:
            </span>{" "}
            <span style={{ fontSize: "11pt", fontFamily: FONT }}>1</span>
          </div>

          {/* C/C */}
          <SectionTitle>C/C</SectionTitle>
          {(data.cc ?? []).filter(Boolean).map((s, i) => (
            <BulletLine key={i} text={s} />
          ))}

          {/* O/E */}
          <SectionTitle>O/E</SectionTitle>
          {[
            `BP: ${data.bp || "—"}`,
            `SPO2: ${data.sp02 || "—"}`,
            `Pulse: ${data.pulse || "—"}`,
          ].map((t, i) => (
            <div
              key={i}
              style={{
                paddingLeft: "14px",
                marginBottom: "2px",
                fontSize: "11pt",
                fontFamily: FONT,
                lineHeight: 1.35,
              }}
            >
              {t}
            </div>
          ))}

          {/* Reports */}
          <SectionTitle>Reports:</SectionTitle>
          {(data.investigations ?? []).filter(Boolean).map((s, i) => (
            <BulletLine key={i} text={s} />
          ))}

          {/* Plan */}
          <SectionTitle>Plan:</SectionTitle>
          {(data.advice ?? []).filter(Boolean).map((s, i) => (
            <BulletLine key={i} text={s} />
          ))}

          {/* D/x with triangle */}
          <div style={{ marginTop: "10px" }}>
            {(data.dx ?? []).filter(Boolean).map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                  marginBottom: "5px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderBottom: `8px solid ${C.text}`,
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                />
                <span
                  style={{
                    fontSize: "11pt",
                    fontFamily: FONT,
                    lineHeight: 1.35,
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>

          {/* Follow-up */}
          {followupDays && (
            <div style={{ marginTop: "22px" }}>
              <div
                style={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  fontFamily: FONT,
                  marginBottom: "4px",
                }}
              >
                Follow Up After {followupDays} day{followupDays > 1 ? "s" : ""}
              </div>
              {data.date && (
                <div
                  style={{
                    fontSize: "12pt",
                    fontWeight: "bold",
                    fontFamily: FONT,
                  }}
                >
                  {formatFollowupDate(data.date, followupDays)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: "0.7px",
            backgroundColor: C.line,
            flexShrink: 0,
          }}
        />

        {/* RIGHT COLUMN */}
        <div
          style={{
            flex: "1",
            paddingLeft: "12px",
            minWidth: 0,
          }}
        >
          {/* Rx header */}
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "14pt",
                fontFamily: FONT,
                paddingBottom: "5px",
              }}
            >
              Rx.
            </div>
            <div
              style={{
                height: "1px",
                backgroundColor: C.text,
                width: "30px",
              }}
            />
          </div>

          {rxList.map((r, i) => {
            const timingLabel =
              r.timing === "before"
                ? "Before meal"
                : r.timing === "after"
                  ? "After meal"
                  : r.timing === "both"
                    ? "Before/After meal"
                    : "Before or After meal";

            const timePart = prettyTimes(r.timesPerDay);
            const sub = [timePart, timingLabel]
              .filter(Boolean)
              .join("   ::   ");
            const dur =
              r.durationDays && r.durationDays > 0
                ? `- ${r.durationDays} day${r.durationDays > 1 ? "s" : ""}`
                : "";

            return (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "11pt",
                        fontFamily: FONT,
                        marginRight: "4px",
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span
                      style={{
                        fontSize: "11pt",
                        fontFamily: FONT,
                        wordBreak: "break-word",
                      }}
                    >
                      {r.drug ?? ""}
                    </span>
                  </div>
                  {dur && (
                    <div
                      style={{
                        fontSize: "11pt",
                        fontFamily: FONT,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {dur}
                    </div>
                  )}
                </div>
                {sub && (
                  <div
                    style={{
                      paddingLeft: "18px",
                      fontSize: "10pt",
                      fontFamily: FONT,
                      color: C.sub,
                      marginTop: "2px",
                      lineHeight: 1.3,
                    }}
                  >
                    {sub}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer line */}
      <div
        style={{
          borderBottom: `0.7px solid ${C.line}`,
          marginTop: "24px",
        }}
      />
    </div>
  );
}
