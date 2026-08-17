import { Link, createFileRoute } from '@tanstack/react-router'
import { ARCHIVO_FONT_LINKS, BLUE, CYAN, DEEP, YELLOW, body, display } from '../lib/campaign'
import WbtLogo from '../components/WbtLogo'

export const Route = createFileRoute('/impressum')({
  head: () => ({
    meta: [
      { title: 'Impressum — Wohnungsbau-Tracker Berlin' },
      {
        name: 'description',
        content:
          'Anbieter, Verantwortliche und Kontakt für den Wohnungsbau-Tracker Berlin — Angaben nach § 5 DDG und § 18 Abs. 2 MStV.',
      },
    ],
    links: ARCHIVO_FONT_LINKS,
  }),
  component: ImpressumPage,
})

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 style={{ ...display, color: BLUE, fontSize: '1.6rem' }}>{titel}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function Absatz({ children }: { children: React.ReactNode }) {
  return <p className="max-w-2xl text-sm font-medium leading-relaxed text-black/70">{children}</p>
}

/** Anschrift oder Kontaktblock — abgesetzt vom Fließtext. */
function Adresse({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-l-4 py-1 pl-4 text-sm font-semibold leading-relaxed text-black/80"
      style={{ borderColor: CYAN }}
    >
      {children}
    </div>
  )
}


const linkStil = 'font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70'

function ImpressumPage() {
  return (
    <div style={body} className="min-h-screen bg-white">
      <header className="px-5 py-10 sm:px-8" style={{ backgroundColor: BLUE }}>
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="inline-block no-underline" title="Zur Startseite">
            <WbtLogo height={32} />
          </Link>
          <h1
            className="mt-8"
            style={{ ...display, color: YELLOW, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.05 }}
          >
            Impressum.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-white/70">
            Wer hinter dem Wohnungsbau-Tracker steht, wer für die Inhalte geradesteht und an
            wen du dich wendest, wenn hier etwas falsch ist.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <Abschnitt titel="Anbieter">
          <Absatz>Angaben nach § 5 Digitale-Dienste-Gesetz (DDG).</Absatz>
          <Adresse>
            Junge Liberale Berlin
            <br />
            c/o FDP Landesverband Berlin
            <br />
            Reinhardtstraße 14
            <br />
            10117 Berlin
          </Adresse>
          <Absatz>Vertreten durch Moritz Wimmer (Landesvorsitzender).</Absatz>
        </Abschnitt>

        <Abschnitt titel="Kontakt">
          <Adresse>
            Telefon: +49 (0)30 278959-0
            <br />
            E-Mail:{' '}
            <a href="mailto:kontakt@julis-berlin.de" className={linkStil}>
              kontakt@julis-berlin.de
            </a>
          </Adresse>
        </Abschnitt>

        <Abschnitt titel="Verantwortlich für den Inhalt">
          <Absatz>Nach § 18 Abs. 2 Medienstaatsvertrag (MStV):</Absatz>
          <Adresse>
            Moritz Wimmer
            <br />
            c/o FDP Landesverband Berlin
            <br />
            Reinhardtstraße 14
            <br />
            10117 Berlin
          </Adresse>
        </Abschnitt>

        <Abschnitt titel="Realisierung">
          <Absatz>
            Der Tracker wurde eigens für diese Seite entwickelt und ist quelloffen. Der komplette
            Quellcode — inklusive der Auswertungslogik hinter jeder Zahl — liegt unter der
            MIT-Lizenz im Repository{' '}
            <a
              href="https://github.com/derneuere/wohnungsbautracker"
              target="_blank"
              rel="noopener noreferrer"
              className={linkStil}
            >
              github.com/derneuere/wohnungsbautracker ↗
            </a>
            .
          </Absatz>
          <Absatz>
            Betrieben wird die Seite als eigene Anwendung in einem Container (Docker, verwaltet
            über Coolify) auf einem Server der Hetzner Online GmbH im Rechenzentrum
            Falkenstein (Sachsen). Ein
            Content-Management-System, eine Agentur oder ein Baukasten stecken nicht dahinter.
          </Absatz>
          <Absatz>
            Technische Rückfragen und Hinweise auf Sicherheitsprobleme bitte an{' '}
            <a href="mailto:kontakt@julis-berlin.de" className={linkStil}>
              kontakt@julis-berlin.de
            </a>
            .
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Bilder, Schriften und Datenquellen">
          <Absatz>
            Diese Seite verwendet keine Stockfotos. Alle Grafiken — Karte, Zeitleisten,
            Vorschaubilder — werden aus den eigenen Daten erzeugt. Woher die Daten stammen, welche
            Schriften und welche freie Software eingesetzt werden und unter welchen Lizenzen das
            jeweils geschieht, steht vollständig unter{' '}
            <Link to="/lizenzen" className={linkStil}>
              Lizenzen &amp; Quellen
            </Link>
            .
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Haftung für Inhalte">
          <Absatz>
            Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt und vor der
            Veröffentlichung gegengelesen. Für Richtigkeit, Vollständigkeit und Aktualität können
            wir trotzdem keine Gewähr übernehmen. Für eigene Inhalte sind wir nach § 7 Abs. 1 DDG
            und den allgemeinen Gesetzen verantwortlich.
          </Absatz>
          <Absatz>
            Der Tracker bewertet politische Vorgänge: Beschlüsse von
            Bezirksverordnetenversammlungen, Bebauungsplanverfahren, Aussagen von Fraktionen und
            Verwaltungen. Diese Einordnungen sind Meinungsäußerungen im Rahmen der politischen
            Auseinandersetzung. Die Tatsachen dahinter belegen wir mit Drucksachen, Protokollen und
            Berichterstattung und verlinken sie an Ort und Stelle. Wo eine Zuordnung strittig ist,
            sagen wir das im Text.
          </Absatz>
          <Absatz>
            Wenn eine Angabe falsch ist, korrigieren wir sie. Als Diensteanbieter sind wir nicht
            verpflichtet, fremde Informationen dauerhaft zu überwachen oder nach Umständen zu
            forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Eine Haftung ist erst ab
            Kenntnis einer konkreten Rechtsverletzung möglich; sobald wir davon erfahren, entfernen
            wir die betroffenen Inhalte umgehend.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Haftung für Links">
          <Absatz>
            Diese Seite verlinkt auf externe Angebote — vor allem auf die
            Ratsinformationssysteme der Bezirke, auf Veröffentlichungen der Senatsverwaltungen und
            auf Presseberichte. Auf deren Inhalte haben wir keinen Einfluss und übernehmen dafür
            keine Gewähr; verantwortlich ist stets der jeweilige Anbieter. Zum Zeitpunkt der
            Verlinkung waren keine Rechtsverstöße erkennbar. Eine dauerhafte inhaltliche Kontrolle
            ist ohne konkreten Anhaltspunkt nicht zumutbar. Werden uns Rechtsverletzungen bekannt,
            entfernen wir die entsprechenden Links.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Urheberrecht">
          <Absatz>
            Die von uns erstellten Texte, Auswertungen und Grafiken stehen unter der
            Creative-Commons-Lizenz CC BY 4.0 — sie dürfen mit Quellenangabe weiterverwendet
            werden, gern auch von Presse und Wissenschaft. Ausgenommen sind Logo und Wortmarke der
            Jungen Liberalen. Die Einzelheiten stehen unter{' '}
            <Link to="/lizenzen" className={linkStil}>
              Lizenzen &amp; Quellen
            </Link>
            .
          </Absatz>
          <Absatz>
            Inhalte, die nicht von uns stammen, sind als solche gekennzeichnet; die Urheberrechte
            Dritter werden beachtet. Solltest du dennoch auf eine Urheberrechtsverletzung stoßen,
            bitten wir um einen Hinweis — wir entfernen die betroffenen Inhalte umgehend.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Streitbeilegung">
          <Absatz>
            Streitigkeiten lösen wir am liebsten direkt und im Gespräch. Zur Teilnahme an einem
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir weder
            verpflichtet noch bereit.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Datenschutz">
          <Absatz>
            Welche Daten beim Besuch dieser Seite anfallen — und vor allem, welche nicht — steht
            in der{' '}
            <Link to="/datenschutz" className={linkStil}>
              Datenschutzerklärung
            </Link>
            .
          </Absatz>
        </Abschnitt>

        <div className="mt-16 p-6" style={{ backgroundColor: '#F5F5F5' }}>
          <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: BLUE }}>
            Fehler gefunden?
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
            Wenn eine Zahl nicht stimmt, ein Beschluss falsch wiedergegeben ist oder ein Projekt
            hier zu Unrecht steht: Schreib an{' '}
            <a href="mailto:kontakt@julis-berlin.de" className={linkStil}>
              kontakt@julis-berlin.de
            </a>{' '}
            oder eröffne ein{' '}
            <a
              href="https://github.com/derneuere/wohnungsbautracker/issues"
              target="_blank"
              rel="noopener noreferrer"
              className={linkStil}
            >
              Issue auf GitHub ↗
            </a>
            . Wir korrigieren das.
          </p>
        </div>
      </main>

      <footer className="px-5 py-12 text-center sm:px-8" style={{ backgroundColor: DEEP }}>
        <Link
          to="/"
          className="inline-block rounded-full px-8 py-3 text-sm font-extrabold uppercase tracking-[0.15em] no-underline transition-transform hover:scale-105"
          style={{ backgroundColor: YELLOW, color: BLUE }}
        >
          Zur Projektwand
        </Link>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-6">
          <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: CYAN }}>
            Impressum
          </span>
          <Link
            to="/datenschutz"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 no-underline transition-colors hover:text-white"
          >
            Datenschutz
          </Link>
          <Link
            to="/lizenzen"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 no-underline transition-colors hover:text-white"
          >
            Lizenzen &amp; Quellen
          </Link>
        </div>
      </footer>
    </div>
  )
}
