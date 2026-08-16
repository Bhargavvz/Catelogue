import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Bhargav Adepu — Systems & ML Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card, set like the masthead: paper, ink, one rule, one red mark.
 * The font ships in the repo so generation never depends on a network fetch.
 */
export default async function OpengraphImage() {
  const serif = await readFile(
    join(process.cwd(), "src/assets/InstrumentSerif-Regular.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f6f2e9",
          color: "#16140f",
          padding: "64px 72px",
          fontFamily: "Instrument Serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: "0.22em",
            color: "#8d8474",
          }}
        >
          <span>VOL. I · NO. 1</span>
          <span>WARANGAL, TELANGANA</span>
          <span>MMXXVI</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 4, backgroundColor: "#16140f" }} />
          <div style={{ display: "flex", height: 1, backgroundColor: "#16140f", marginTop: 4 }} />
          <div
            style={{
              display: "flex",
              fontSize: 116,
              lineHeight: 1,
              marginTop: 40,
              letterSpacing: "-0.025em",
            }}
          >
            Adepu Vaatsava
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              lineHeight: 1,
              letterSpacing: "-0.025em",
            }}
          >
            Sri Bhargav
            <span style={{ color: "#b23a1e" }}>.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "#5a5347",
          }}
        >
          <span>Systems &amp; ML Engineer · GSoC 2025 at VideoLAN</span>
          <span style={{ color: "#b23a1e" }}>bhargav.adepu.co.in</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }],
    },
  );
}
