import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  fidelitySourceTitle,
  getFidelityPrimarySources,
  getMajorArcanaCardByNumber,
  tarotCards,
} from "../lib/tarot";
import { fidelitySystem } from "../lib/tarot/fidelitySystem";

type InterpretRow = { text?: string | null; source?: string | null; confidence?: string | null };

function trim(s: unknown): string {
  if (s == null) return "";
  return String(s).trim();
}

function majorNumberFromGdKey(key: string): number | undefined {
  const i = key.indexOf("_");
  if (i <= 0) return undefined;
  const n = Number(key.slice(0, i));
  return Number.isFinite(n) ? n : undefined;
}

function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-line pt-12 first:border-t-0 first:pt-0">
      {kicker ? (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-label text-ochre/90">{kicker}</p>
      ) : null}
      <h2 className="mb-8 font-display text-2xl font-medium tracking-tight text-bone sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function InterpretList({ rows }: { rows: InterpretRow[] }) {
  if (!rows.length) return null;
  return (
    <ul className="max-w-prose space-y-5 text-sm leading-relaxed">
      {rows.map((row, i) => {
        const text = trim(row.text);
        if (!text) return null;
        const src = trim(row.source);
        const conf = trim(row.confidence);
        return (
          <li key={i}>
            <p className="text-bone/95">{text}</p>
            <p className="mt-1.5 font-mono text-[10px] text-faint">
              {[fidelitySourceTitle(src) || src, conf].filter(Boolean).join(" · ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function MajorCardLinks({ nums }: { nums: number[] }) {
  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
      {nums.map((n) => {
        const c = getMajorArcanaCardByNumber(n);
        if (!c) {
          return (
            <span key={n} className="font-mono text-xs text-muted">
              {n}
            </span>
          );
        }
        return (
          <Link
            key={n}
            to={`/cards/${c.slug}`}
            className="font-mono text-xs text-bone/90 underline decoration-line underline-offset-4 transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
          >
            {c.name}
          </Link>
        );
      })}
    </span>
  );
}

const TOC = [
  { id: "sources", label: "Sources" },
  { id: "suits", label: "Suits" },
  { id: "numbers", label: "Numbers" },
  { id: "reversals", label: "Reversals" },
  { id: "fools-journey", label: "Fool's journey" },
  { id: "golden-dawn", label: "Golden Dawn" },
] as const;

export function FidelitySystemPage() {
  useEffect(() => {
    document.title = "Study · Tarot";
  }, []);

  const meta = fidelitySystem.meta ?? {};
  const description = trim(meta.description);
  const primarySources = getFidelityPrimarySources();

  const suitsRaw = fidelitySystem.suits;
  const suits =
    suitsRaw && typeof suitsRaw === "object"
      ? (suitsRaw as Record<string, Record<string, unknown>>)
      : {};

  const suitOrder = ["wands", "cups", "swords", "pentacles"] as const;
  const orderedSuitEntries = suitOrder
    .filter((k) => suits[k])
    .map((k) => [k, suits[k]] as const)
    .concat(
      Object.entries(suits).filter(([k]) => !suitOrder.includes(k as (typeof suitOrder)[number])),
    );

  const numbersRaw = fidelitySystem.numbers;
  const numbers =
    numbersRaw && typeof numbersRaw === "object"
      ? (numbersRaw as Record<string, Record<string, unknown>>)
      : {};

  const reversalModels = Array.isArray(fidelitySystem.reversal_models)
    ? (fidelitySystem.reversal_models as Record<string, unknown>[])
    : [];

  const journey = fidelitySystem.major_arcana_journey as Record<string, unknown> | undefined;
  const journeyModels = Array.isArray(journey?.models)
    ? (journey.models as Record<string, unknown>[])
    : [];

  const gd = fidelitySystem.golden_dawn_correspondences as Record<string, unknown> | undefined;
  const gdCards =
    gd?.cards && typeof gd.cards === "object" ? (gd.cards as Record<string, Record<string, unknown>>) : {};
  const gdConflicts = Array.isArray(gd?.source_conflicts) ? (gd.source_conflicts as Record<string, unknown>[]) : [];

  const footnote = trim(fidelitySystem.notes);

  return (
    <article className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <header className="mb-14 space-y-6 border-b border-line pb-12">
        <Link
          to="/"
          className="inline-flex font-mono text-sm text-muted transition duration-300 hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
        >
          ← Library
        </Link>
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-label text-muted">Fidelity dataset</p>
          <h1 className="font-display text-[clamp(2rem,6vw,3.25rem)] font-medium leading-tight tracking-tight">
            Study reference
          </h1>
          {description ? (
            <p className="max-w-prose text-sm leading-relaxed text-muted">{description}</p>
          ) : null}
          {trim(meta.version) ? (
            <p className="font-mono text-[10px] text-faint">Schema v{String(meta.version)} · {trim(meta.created)}</p>
          ) : null}
        </div>

        <nav aria-label="On this page" className="flex flex-wrap gap-x-4 gap-y-2 border border-line bg-panel/40 px-4 py-3">
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-[11px] text-muted transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-16">
        <Section id="sources" title="Primary sources" kicker="Bibliography">
          <ul className="max-w-prose space-y-4 text-sm leading-relaxed text-muted">
            {primarySources.map((src, i) => {
              const id = trim(src.id);
              const title = trim(src.title);
              const author = trim(src.author);
              const year = src.year != null ? String(src.year) : "";
              const typ = trim(src.type);
              return (
                <li key={id || i} className="border-b border-line/40 pb-4 last:border-0 last:pb-0">
                  <p className="font-mono text-xs text-bone/90">{title || id}</p>
                  <p className="mt-1">
                    {author}
                    {year ? ` · ${year}` : ""}
                    {typ ? (
                      <span className="font-mono text-[10px] text-faint"> · {typ}</span>
                    ) : null}
                  </p>
                  {id ? <p className="mt-1 font-mono text-[10px] text-faint">{id}</p> : null}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="suits" title="Suits" kicker="Element & domain">
          <div className="space-y-14">
            {orderedSuitEntries.map(([key, suit]) => {
              const element = trim(suit.element);
              const domain = trim(suit.domain);
              const season = trim(suit.season);
              const direction = trim(suit.direction);
              const kab = trim(suit.kabbalistic_world);
              const playing = trim(suit.playing_card_equivalent);
              const interpretations = Array.isArray(suit.interpretations) ? (suit.interpretations as InterpretRow[]) : [];
              const court = suit.court_card_element_sub;
              const conflict = suit.source_conflict;

              return (
                <div key={key}>
                  <h3 className="mb-4 font-display text-xl font-medium capitalize tracking-tight text-bone">{key}</h3>
                  <dl className="mb-6 grid gap-3 font-mono text-xs text-bone/85 sm:grid-cols-2">
                    {element ? (
                      <>
                        <dt className="text-faint">Element</dt>
                        <dd>{element}</dd>
                      </>
                    ) : null}
                    {domain ? (
                      <>
                        <dt className="text-faint">Domain</dt>
                        <dd className="font-body text-sm leading-relaxed text-muted">{domain}</dd>
                      </>
                    ) : null}
                    {season ? (
                      <>
                        <dt className="text-faint">Season</dt>
                        <dd>{season}</dd>
                      </>
                    ) : null}
                    {direction ? (
                      <>
                        <dt className="text-faint">Direction</dt>
                        <dd>{direction}</dd>
                      </>
                    ) : null}
                    {kab ? (
                      <>
                        <dt className="text-faint">Kabbalistic world</dt>
                        <dd>{kab}</dd>
                      </>
                    ) : null}
                    {playing ? (
                      <>
                        <dt className="text-faint">Playing card</dt>
                        <dd className="capitalize">{playing}</dd>
                      </>
                    ) : null}
                  </dl>

                  {court && typeof court === "object" ? (
                    <div className="mb-6">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-label text-muted">Court elementals</p>
                      <ul className="grid gap-1 font-mono text-[11px] text-muted sm:grid-cols-2">
                        {Object.entries(court as Record<string, unknown>).map(([rank, val]) => (
                          <li key={rank}>
                            <span className="capitalize text-bone/80">{rank}</span>
                            <span className="text-faint"> — </span>
                            <span>{trim(val).replaceAll("_", " ")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {conflict && typeof conflict === "object" ? (
                    <div className="mb-6 border border-line/60 bg-void/50 p-4 text-sm leading-relaxed text-muted">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-label text-ochre/80">Source conflict</p>
                      {Object.entries(conflict as Record<string, unknown>).map(([k, v]) => (
                        <p key={k} className="mt-2 first:mt-0">
                          <span className="font-mono text-[10px] text-faint">{k.replaceAll("_", " ")}: </span>
                          {trim(v)}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <InterpretList rows={interpretations} />
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="numbers" title="Pip numbers" kicker="Minors grammar">
          <ul className="space-y-10">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((digit) => {
              const block = numbers[digit];
              if (!block) return null;
              const name = trim(block.name);
              const meaning = trim(block.meaning);
              const seph = trim(block.kabbalistic_sephirah);
              const interpretations = Array.isArray(block.interpretations)
                ? (block.interpretations as InterpretRow[])
                : [];
              return (
                <li key={digit} className="border-b border-line/30 pb-10 last:border-0 last:pb-0">
                  <div className="mb-4 flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-2xl tabular-nums text-bone">{digit}</span>
                    {name ? <span className="font-display text-lg text-bone/90">{name}</span> : null}
                    {seph ? (
                      <span className="font-mono text-[10px] text-faint">Sephirah · {seph}</span>
                    ) : null}
                  </div>
                  {meaning ? <p className="mb-4 max-w-prose text-sm text-muted">{meaning}</p> : null}
                  <InterpretList rows={interpretations} />
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="reversals" title="Reversal models" kicker="How reversed cards are read">
          <ul className="max-w-prose space-y-8">
            {reversalModels.map((model, i) => {
              const typ = trim(model.type);
              const desc = trim(model.description);
              const example = trim(model.example);
              const conf = trim(model.confidence);
              const notes = trim(model.notes);
              const supported = Array.isArray(model.supported_by)
                ? (model.supported_by as unknown[]).map((x) => trim(x)).filter(Boolean)
                : [];
              return (
                <li key={`${typ}-${i}`} className="border-b border-line/30 pb-8 last:border-0 last:pb-0">
                  {typ ? (
                    <p className="mb-2 font-mono text-xs uppercase tracking-wide text-bone/90">{typ.replaceAll("_", " ")}</p>
                  ) : null}
                  {desc ? <p className="text-sm leading-relaxed text-muted">{desc}</p> : null}
                  {example ? (
                    <p className="mt-3 border-l-2 border-line pl-3 text-sm italic text-bone/80">{example}</p>
                  ) : null}
                  {supported.length > 0 ? (
                    <p className="mt-3 font-mono text-[10px] text-faint">
                      {supported.map((id) => fidelitySourceTitle(id) || id).join(" · ")}
                    </p>
                  ) : null}
                  {(conf || notes) && (
                    <p className="mt-2 font-mono text-[10px] text-faint">
                      {[conf, notes].filter(Boolean).join(" — ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="fools-journey" title={trim(journey?.name) || "The Fool's Journey"} kicker="Major arcana narratives">
          {trim(journey?.description) ? (
            <p className="mb-10 max-w-prose text-sm leading-relaxed text-muted">{String(journey?.description)}</p>
          ) : null}
          <div className="space-y-12">
            {journeyModels.map((model, i) => {
              const author = trim(model.author);
              const src = trim(model.source);
              const structure = trim(model.structure);
              const desc = trim(model.description);
              const notes = trim(model.notes);
              const conf = trim(model.confidence);
              const stages = Array.isArray(model.stages) ? (model.stages as Record<string, unknown>[]) : [];
              const vert = model.vertical_correspondences as Record<string, unknown> | undefined;
              const examples = Array.isArray(vert?.examples) ? (vert.examples as Record<string, unknown>[]) : [];

              return (
                <div key={`${author}-${i}`} className="border border-line/60 bg-panel/30 p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-baseline gap-2">
                    {author ? <h3 className="font-display text-lg font-medium text-bone">{author}</h3> : null}
                    {structure ? (
                      <span className="font-mono text-[10px] text-faint">{structure.replaceAll("_", " ")}</span>
                    ) : null}
                  </div>
                  {src ? (
                    <p className="mb-3 font-mono text-[10px] text-faint">{fidelitySourceTitle(src) || src}</p>
                  ) : null}
                  {desc ? <p className="text-sm leading-relaxed text-muted">{desc}</p> : null}
                  {notes ? <p className="mt-4 text-sm leading-relaxed text-muted">{notes}</p> : null}
                  {conf ? <p className="mt-2 font-mono text-[10px] text-faint">{conf}</p> : null}

                  {stages.length > 0 ? (
                    <ol className="mt-6 space-y-4 text-sm">
                      {stages.map((stage, j) => {
                        const label = trim(stage.label);
                        const cardNums = Array.isArray(stage.cards)
                          ? (stage.cards as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
                          : [];
                        return (
                          <li key={j} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                            <div className="min-w-0 shrink-0 sm:w-40">
                              <MajorCardLinks nums={cardNums} />
                            </div>
                            {label ? <p className="min-w-0 leading-relaxed text-muted">{label}</p> : null}
                          </li>
                        );
                      })}
                    </ol>
                  ) : null}

                  {examples.length > 0 ? (
                    <div className="mt-8 border-t border-line/40 pt-6">
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-label text-muted">
                        {trim(vert?.description) || "Vertical correspondences"}
                      </p>
                      <ul className="space-y-4 text-sm text-muted">
                        {examples.map((ex, k) => {
                          const col = ex.column;
                          const note = trim(ex.note);
                          const names = Array.isArray(ex.names) ? (ex.names as unknown[]).map((x) => trim(x)) : [];
                          const cards = Array.isArray(ex.cards)
                            ? (ex.cards as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
                            : [];
                          return (
                            <li key={k}>
                              <p className="font-mono text-xs text-bone/85">
                                Column {String(col)} · {names.join(" · ")}
                              </p>
                              <div className="mt-1">
                                <MajorCardLinks nums={cards} />
                              </div>
                              {note ? <p className="mt-2 leading-relaxed">{note}</p> : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="golden-dawn" title="Golden Dawn correspondences" kicker="Majors">
          {trim(gd?.description) ? (
            <p className="mb-8 max-w-prose text-sm leading-relaxed text-muted">{String(gd?.description)}</p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-label text-muted">
                  <th className="py-2 pr-4 font-normal">Card</th>
                  <th className="py-2 pr-4 font-normal">Letter</th>
                  <th className="py-2 pr-4 font-normal">Meaning</th>
                  <th className="py-2 pr-4 font-normal">Astrology</th>
                  <th className="py-2 font-normal">Path</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gdCards).map(([gdKey, row]) => {
                  const n = majorNumberFromGdKey(gdKey);
                  const card = n != null ? getMajorArcanaCardByNumber(n) : undefined;
                  const he = trim(row.hebrew_letter);
                  const hm = trim(row.hebrew_meaning);
                  const ast = trim(row.astrology);
                  const path = trim(row.tree_path);
                  return (
                    <tr key={gdKey} className="border-b border-line/40 text-muted">
                      <td className="py-3 pr-4 align-top">
                        {card ? (
                          <Link
                            to={`/cards/${card.slug}`}
                            className="text-bone/90 underline decoration-line underline-offset-4 transition hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong"
                          >
                            {card.name}
                          </Link>
                        ) : (
                          <span className="font-mono text-xs text-faint">{gdKey.replaceAll("_", " ")}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-top font-mono text-xs text-bone/85">{he}</td>
                      <td className="py-3 pr-4 align-top">{hm}</td>
                      <td className="py-3 pr-4 align-top">{ast}</td>
                      <td className="py-3 align-top text-xs leading-snug">{path}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {gdConflicts.length > 0 ? (
            <div className="mt-10 space-y-6">
              <h3 className="font-mono text-[10px] uppercase tracking-label text-muted">Source conflicts</h3>
              {gdConflicts.map((c, i) => (
                <div key={i} className="border border-line/60 bg-void/40 p-4 text-sm leading-relaxed text-muted">
                  {Object.entries(c).map(([k, v]) => (
                    <p key={k} className="mt-2 first:mt-0">
                      <span className="font-mono text-[10px] text-faint">{k.replaceAll("_", " ")}: </span>
                      {trim(v)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        {footnote ? (
          <footer className="border-t border-line pt-10">
            <p className="font-mono text-[10px] uppercase tracking-label text-muted">Notes</p>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-faint">{footnote}</p>
          </footer>
        ) : null}

        <p className="font-mono text-[10px] text-faint">
          {tarotCards.length} cards in library dataset — system layer is attribution-ready context for readings.
        </p>
      </div>
    </article>
  );
}
