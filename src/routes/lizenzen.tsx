import { Link, createFileRoute } from '@tanstack/react-router'
import { ARCHIVO_FONT_LINKS, BLACK, BLUE, CYAN, DEEP, YELLOW, body, display } from '../lib/campaign'
import WbtLogo from '../components/WbtLogo'

export const Route = createFileRoute('/lizenzen')({
  head: () => ({
    meta: [
      { title: 'Lizenzen & Quellen — Wohnungsbau-Tracker Berlin' },
      {
        name: 'description',
        content:
          'Woher Daten, Schriften und Software dieses Trackers stammen und unter welchen Lizenzen sie hier verwendet werden.',
      },
    ],
    links: ARCHIVO_FONT_LINKS,
  }),
  component: LizenzenPage,
})

/** Ein Eintrag: was verwendet wird, von wem, unter welcher Lizenz. */
function Eintrag({
  titel,
  urheber,
  lizenz,
  lizenzUrl,
  children,
}: {
  titel: string
  urheber: string
  lizenz: string
  lizenzUrl?: string
  children?: React.ReactNode
}) {
  return (
    <div className="border-t-2 py-5" style={{ borderColor: '#E5E5E5' }}>
      <h3 className="text-base font-extrabold" style={{ color: BLACK }}>
        {titel}
      </h3>
      <p className="mt-1 text-sm font-semibold text-black/60">{urheber}</p>
      <p className="mt-1 text-sm font-semibold text-black/60">
        Lizenz:{' '}
        {lizenzUrl ? (
          <a
            href={lizenzUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
          >
            {lizenz} ↗
          </a>
        ) : (
          <span className="font-bold text-black">{lizenz}</span>
        )}
      </p>
      {children && <div className="mt-2 text-sm font-medium leading-relaxed text-black/70">{children}</div>}
    </div>
  )
}

function Abschnitt({ titel, intro, children }: { titel: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 style={{ ...display, color: BLUE, fontSize: '1.6rem' }}>{titel}</h2>
      {intro && <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-black/60">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function LizenzenPage() {
  return (
    <div style={body} className="min-h-screen bg-white">
      <header className="px-5 py-10 sm:px-8" style={{ backgroundColor: BLUE }}>
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="inline-block no-underline" title="Zur Startseite">
            <WbtLogo height={32} />
          </Link>
          <h1 className="mt-8" style={{ ...display, color: YELLOW, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.05 }}>
            Lizenzen & Quellen.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-white/70">
            Ein Tracker, der Transparenz einfordert, sollte auch über sich selbst Auskunft
            geben: Hier steht, woher Daten, Schriften und Software stammen und unter welchen
            Bedingungen sie hier verwendet werden.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <Abschnitt
          titel="Daten & Inhalte"
          intro="Der Tracker wertet ausschließlich öffentlich zugängliche Quellen aus. Jede Zahl auf einer Projektseite ist dort mit dem Dokument verlinkt, aus dem sie stammt."
        >
          <Eintrag
            titel="BVV-Drucksachen und Sitzungsprotokolle"
            urheber="Bezirksverordnetenversammlungen der zwölf Berliner Bezirke, veröffentlicht in den Ratsinformationssystemen (ALLRIS)"
            lizenz="Amtliche Werke, gemeinfrei nach § 5 UrhG"
          >
            Drucksachen, Anträge, Beschlüsse und Protokolle sind amtliche Werke und damit
            urheberrechtsfrei. Sie werden hier zitiert und verlinkt, nicht gespiegelt.
          </Eintrag>
          <Eintrag
            titel="Genehmigungen und Fertigstellungen"
            urheber="Amt für Statistik Berlin-Brandenburg, Statistische Berichte F II 1 und F II 2"
            lizenz="Datenlizenz Deutschland — Namensnennung 2.0"
            lizenzUrl="https://www.govdata.de/dl-de/by-2-0"
          >
            Wohnungen insgesamt, Land Berlin, je Berichtsjahr.
          </Eintrag>
          <Eintrag
            titel="Bezirksgrenzen für die Karte"
            urheber="Amtliche Bezirksgrenzen des Landes Berlin (Geoportal Berlin), in einer seit 2013 verbreiteten offenen Fassung"
            lizenz="Datenlizenz Deutschland — Namensnennung 2.0"
            lizenzUrl="https://www.govdata.de/dl-de/by-2-0"
          >
            Umringe der zwölf Bezirke, für die Darstellung vereinfacht. Sollte diese Fassung
            auf einer anderen Quelle beruhen als hier angegeben, korrigieren wir die Angabe —
            ein Hinweis genügt.
          </Eintrag>
          <Eintrag
            titel="Presseberichterstattung"
            urheber="Die jeweils genannten Verlage und Redaktionen"
            lizenz="Kein Nachdruck — nur Zitat und Verlinkung"
          >
            Aus Presseartikeln werden nur einzelne Fakten übernommen und mit Titel, Medium
            und Link belegt. Die Artikeltexte selbst werden weder gespeichert noch
            wiedergegeben.
          </Eintrag>
          <Eintrag
            titel="Projekttexte, Auswertungen und Grafiken dieser Seite"
            urheber="Junge Liberale Berlin"
            lizenz="Creative Commons Namensnennung 4.0 (CC BY 4.0)"
            lizenzUrl="https://creativecommons.org/licenses/by/4.0/deed.de"
          >
            Alles, was hier eigens geschrieben und gerechnet wurde, darf mit Quellenangabe
            weiterverwendet werden — gern auch von Presse und Wissenschaft. Nicht erfasst sind
            Logo und Wortmarke der Jungen Liberalen.
          </Eintrag>
        </Abschnitt>

        <Abschnitt
          titel="Schriften"
          intro="Beide Schriften werden von diesem Server ausgeliefert, nicht von Google Fonts. Es gehen also keine Daten der Besucherinnen und Besucher an Dritte."
        >
          <Eintrag
            titel="Archivo"
            urheber="Copyright 2020 The Archivo Project Authors (Omnibus-Type)"
            lizenz="SIL Open Font License 1.1"
            lizenzUrl="/fonts/OFL-Archivo.txt"
          >
            Vollständiger Lizenztext:{' '}
            <a
              href="/fonts/OFL-Archivo.txt"
              className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
            >
              OFL-Archivo.txt
            </a>
          </Eintrag>
          <Eintrag
            titel="Archivo Black"
            urheber="Copyright 2017 The Archivo Black Project Authors (Omnibus-Type)"
            lizenz="SIL Open Font License 1.1"
            lizenzUrl="/fonts/OFL-ArchivoBlack.txt"
          >
            Vollständiger Lizenztext:{' '}
            <a
              href="/fonts/OFL-ArchivoBlack.txt"
              className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
            >
              OFL-ArchivoBlack.txt
            </a>
          </Eintrag>
        </Abschnitt>

        <Abschnitt
          titel="Software"
          intro="Der Tracker ist quelloffen. Er läuft auf freier Software, deren Lizenzen jeweils die Nennung der Urheberrechtsvermerke verlangen."
        >
          <Eintrag
            titel="React, TanStack Router & Start, Vite, Tailwind CSS, Drizzle ORM, Leaflet, Lucide"
            urheber="Die jeweiligen Projektautoren"
            lizenz="MIT bzw. BSD-2-Clause"
          >
            Die vollständigen Lizenztexte und Urheberrechtsvermerke liegen im Quellcode-Repository
            in den jeweiligen Paketen.
          </Eintrag>
          <Eintrag
            titel="Quellcode des Wohnungsbau-Trackers"
            urheber="Junge Liberale Berlin"
            lizenz="MIT-Lizenz — Repository auf GitHub"
            lizenzUrl="https://github.com/derneuere/wohnungsbautracker"
          >
            Wer die Auswertung nachvollziehen oder Fehler finden will, kann in den Code sehen,
            ihn kopieren und für eigene Projekte weiterverwenden.
          </Eintrag>
        </Abschnitt>

        <Abschnitt
          titel="Gestaltung"
          intro="Die Bildsprache dieser Seite ist eine Hommage an deutsche Wahlkampagnen."
        >
          <Eintrag
            titel="Slogans und Plakatästhetik"
            urheber="Zitiert, nicht beansprucht"
            lizenz="Keine — bewusstes Zitat"
          >
            Die Sätze im Kampagnen-Stil spielen erkennbar mit bekannten Wahlkampfslogans. Sie
            sind als Zitat und Kommentar gemeint; Ansprüche auf die Originale werden damit nicht
            erhoben.
          </Eintrag>
        </Abschnitt>

        <div className="mt-16 p-6" style={{ backgroundColor: '#F5F5F5' }}>
          <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: BLUE }}>
            Etwas falsch zugeordnet?
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
            Wenn eine Quelle fehlt, eine Lizenz falsch benannt ist oder Inhalte hier zu Unrecht
            verwendet werden, melde es bitte über das{' '}
            <a
              href="https://julis.berlin/impressum/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
            >
              Impressum
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
          <a
            href="https://julis.berlin/impressum/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 no-underline transition-colors hover:text-white"
          >
            Impressum
          </a>
          <a
            href="https://julis.berlin/datenschutz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 no-underline transition-colors hover:text-white"
          >
            Datenschutz
          </a>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: CYAN }}>
            Lizenzen
          </span>
        </div>
      </footer>
    </div>
  )
}
