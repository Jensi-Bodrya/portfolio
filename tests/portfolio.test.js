/**
 * Unit tests for the portfolio site.
 * Run: npm test
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, "..", "index.html");
const html = readFileSync(HTML_PATH, "utf8");

let dom, document;

before(() => {
  dom = new JSDOM(html);
  document = dom.window.document;
});

describe("Document structure", () => {
  test("declares HTML5 doctype", () => {
    assert.match(html.trim().slice(0, 20), /^<!DOCTYPE html>/i);
  });

  test("sets lang attribute on <html>", () => {
    assert.equal(document.documentElement.getAttribute("lang"), "en");
  });

  test("has a title", () => {
    assert.ok(document.title.length > 0, "title must not be empty");
    assert.match(document.title, /Jensi Bodrya/);
  });

  test("has a responsive viewport meta tag", () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    assert.ok(viewport, "viewport meta missing");
    assert.match(viewport.getAttribute("content"), /width=device-width/);
  });

  test("declares utf-8 charset", () => {
    const charset = document.querySelector('meta[charset]');
    assert.ok(charset);
    assert.equal(charset.getAttribute("charset").toLowerCase(), "utf-8");
  });
});

describe("Sections", () => {
  const requiredSections = [
    "hero",
    "about",
    "experience",
    "projects",
    "skills",
    "education",
    "extras",
    "contact",
  ];

  for (const id of requiredSections) {
    test(`contains #${id} section`, () => {
      assert.ok(document.getElementById(id), `#${id} not found`);
    });
  }
});

describe("Navigation", () => {
  test("every internal nav link resolves to a real section", () => {
    const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    assert.ok(links.length > 0, "no internal nav links found");
    for (const a of links) {
      const href = a.getAttribute("href");
      if (href === "#") continue;
      const target = href.slice(1);
      assert.ok(
        document.getElementById(target),
        `nav link ${href} has no matching element`
      );
    }
  });

  test("has a mobile nav toggle for responsive layout", () => {
    assert.ok(document.getElementById("navToggle"));
    assert.ok(document.getElementById("navLinks"));
  });

  test("nav toggle exposes accessible expanded state", () => {
    const toggle = document.getElementById("navToggle");
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(toggle.getAttribute("aria-controls"), "navLinks");
  });

  test("nav offers a resume call-to-action", () => {
    const resume = document.querySelector(".nav-resume");
    assert.ok(resume, "resume CTA missing");
    assert.equal(resume.id, "resumeBtn");
  });

  test("nav item spacing rules are defined", () => {
    // Guard against the congestion regression: links must have real padding
    // and the row must be laid out with a flex gap.
    assert.match(html, /\.nav-links\s*\{[^}]*gap:\s*\d+px/s, "nav link gap missing");
    assert.match(html, /\.nav-links a\s*\{[^}]*padding:\s*11px 18px/s, "nav link padding changed");
    assert.match(html, /nav \.container\s*\{[^}]*gap:\s*28px/s, "nav container gap missing");
  });
});

describe("Polish & animation", () => {
  test("scroll progress element exists and is decorative", () => {
    const bar = document.getElementById("scrollProgress");
    assert.ok(bar, "scroll progress bar missing");
    assert.equal(bar.getAttribute("aria-hidden"), "true");
  });

  test("reveal variants are declared", () => {
    for (const variant of ["left", "right", "scale", "blur"]) {
      assert.match(
        html,
        new RegExp(`\\.reveal\\[data-anim="${variant}"\\]`),
        `missing data-anim="${variant}" style`
      );
    }
  });

  test("staggered reveal delays are configured", () => {
    assert.match(html, /--delay:\s*0\.\d+s/, "no stagger delays defined");
    assert.match(html, /\.timeline \.timeline-item:nth-child\(2\)\s*\{\s*--delay/, "timeline stagger missing");
  });

  test("reduced-motion users get a static page", () => {
    assert.match(html, /@media \(prefers-reduced-motion: reduce\)/, "no reduced-motion block");
    assert.match(
      html,
      /prefers-reduced-motion[\s\S]{0,400}\.hero h1 \.accent \{ animation: none; \}/,
      "shimmer animation not disabled for reduced motion"
    );
  });

  test("anchors account for the fixed nav height", () => {
    assert.match(html, /section\[id\] \{ scroll-margin-top: 76px; \}/, "desktop scroll-margin missing");
    assert.match(html, /section\[id\] \{ scroll-margin-top: 66px; \}/, "mobile scroll-margin missing");
  });

  test("external links animated via CSS only, no inline handlers", () => {
    assert.doesNotMatch(html, /\son(click|load|error|mouseover|focus|submit)\s*=/i);
  });
});

describe("Links", () => {
  test("all http(s) links use https", () => {
    const links = [...document.querySelectorAll('a[href^="http"]')];
    assert.ok(links.length > 0);
    for (const a of links) {
      const href = a.getAttribute("href");
      assert.ok(
        href.startsWith("https://"),
        `insecure link found: ${href}`
      );
    }
  });

  test("external links open in a new tab with rel safety", () => {
    const external = [...document.querySelectorAll('a[target="_blank"]')];
    assert.ok(external.length > 0, "expected external links");
    for (const a of external) {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("http")) continue;
      assert.ok(
        a.getAttribute("rel"),
        `target=_blank link missing rel: ${href}`
      );
    }
  });

  test("no placeholder '#' project links remain", () => {
    const projectLinks = [...document.querySelectorAll(".project-link")];
    for (const a of projectLinks) {
      const href = a.getAttribute("href");
      assert.notEqual(href, "#", `project link is still a placeholder`);
      assert.match(href, /^https:\/\//);
    }
  });

  test("mailto link points at the real address", () => {
    const mail = document.querySelector('a[href^="mailto:"]');
    assert.ok(mail, "no mailto link");
    assert.equal(
      mail.getAttribute("href"),
      "mailto:jensibodrya@gmail.com"
    );
  });
});

describe("Projects", () => {
  test("renders exactly two project cards", () => {
    const cards = document.querySelectorAll(".project-card");
    assert.equal(cards.length, 2);
  });

  test("each project card has a title, description, stack, and link", () => {
    for (const card of document.querySelectorAll(".project-card")) {
      assert.ok(card.querySelector("h3"), "missing title");
      assert.ok(card.querySelector("p"), "missing description");
      assert.ok(card.querySelectorAll(".tech-tag").length > 0, "missing tech tags");
      assert.ok(card.querySelector(".project-link"), "missing link");
    }
  });

  test("project GitHub links point at the real repos", () => {
    const hrefs = [...document.querySelectorAll(".project-link")].map((a) =>
      a.getAttribute("href")
    );
    assert.ok(
      hrefs.some((h) => h.includes("JENSIBODRYA/Team3")),
      "Currency Exchanger repo link missing"
    );
    assert.ok(
      hrefs.some((h) => h.includes("JENSIBODRYA/Instagram_Clone")),
      "Connect Us repo link missing"
    );
  });

  test("filter buttons cover every project category present in the DOM", () => {
    const filters = [...document.querySelectorAll(".project-filter")].map((b) =>
      b.dataset.filter
    );
    const categories = new Set(
      [...document.querySelectorAll(".project-card")].map(
        (c) => c.dataset.category
      )
    );
    assert.ok(filters.includes("all"), "missing 'all' filter");
    for (const cat of categories) {
      assert.ok(filters.includes(cat), `no filter for category '${cat}'`);
    }
  });
});

describe("Stats counters", () => {
  test("every counter has a numeric data-target", () => {
    const nums = [...document.querySelectorAll(".hero-stat .num")];
    assert.ok(nums.length > 0, "no counters found");
    for (const n of nums) {
      const target = Number(n.dataset.target);
      assert.ok(
        Number.isFinite(target),
        `data-target is not numeric: ${n.dataset.target}`
      );
    }
  });

  test("counters match the resume figures", () => {
    const targets = [...document.querySelectorAll(".hero-stat .num")].map((n) =>
      Number(n.dataset.target)
    );
    assert.deepEqual(targets, [2, 9.06, 3]);
  });
});

describe("Accessibility", () => {
  test("every image has an alt attribute", () => {
    for (const img of document.querySelectorAll("img")) {
      assert.ok(img.hasAttribute("alt"), `img without alt: ${img.src}`);
    }
  });

  test("interactive buttons have accessible labels", () => {
    for (const btn of document.querySelectorAll("button")) {
      const hasText = btn.textContent.trim().length > 0;
      const hasLabel = btn.hasAttribute("aria-label");
      assert.ok(hasText || hasLabel, "button with no text or aria-label");
    }
  });

  test("headings are not skipped from h1 to h3", () => {
    const levels = [...document.querySelectorAll("h1, h2, h3, h4")]
      .map((h) => Number(h.tagName[1]));
    assert.equal(levels[0], 1, "first heading should be h1");
    for (let i = 1; i < levels.length; i++) {
      assert.ok(
        levels[i] - levels[i - 1] <= 1,
        `heading level jumped from h${levels[i - 1]} to h${levels[i]}`
      );
    }
  });
});

describe("Performance guards", () => {
  test("page weight stays under the 200KB budget", () => {
    const bytes = Buffer.byteLength(html, "utf8");
    assert.ok(bytes < 200_000, `index.html is ${bytes} bytes`);
  });

  test("no inline event-handler attributes are used", () => {
    assert.doesNotMatch(
      html,
      /\son(click|load|error|mouseover|focus)\s*=/i,
      "inline event handlers found — use addEventListener"
    );
  });
});
