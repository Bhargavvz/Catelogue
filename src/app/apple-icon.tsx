import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon. Same mark as icon.svg, rendered from the font itself so the
 * letterform matches the masthead exactly rather than approximating it.
 */
export default async function AppleIcon() {
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#b23a1e",
          color: "#f6f2e9",
          fontFamily: "Instrument Serif",
          fontSize: 148,
          // Optical centring — the serif B sits slightly high on its baseline.
          paddingBottom: 14,
        }}
      >
        B
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }],
    },
  );
}
