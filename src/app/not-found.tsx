import Link from "next/link";
import { Shell, Label } from "@/components/press/primitives";

export default function NotFound() {
  return (
    <Shell as="div">
      <div className="pt-24 pb-32" style={{ maxWidth: "34rem" }}>
        <Label accent>ERROR 404</Label>
        <h1 className="display mt-3" style={{ fontSize: "var(--t-2xl)" }}>
          Not in the
          <br />
          catalogue
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <hr className="rule-thick mt-6" />
        <p className="mt-5" style={{ color: "var(--ink-muted)" }}>
          Whatever was filed here has been moved or never existed. The index is
          two keystrokes away — press <span className="mono">⌘K</span> — or start
          again from the front.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/" className="link-underline">
            Front page
          </Link>
          <Link href="/work" className="link-underline">
            The catalogue
          </Link>
        </div>
      </div>
    </Shell>
  );
}
