import { Link, createFileRoute } from '@tanstack/react-router'
import { ARCHIVO_FONT_LINKS, BLUE, CYAN, DEEP, YELLOW, body, display } from '../lib/campaign'
import WbtLogo from '../components/WbtLogo'

export const Route = createFileRoute('/datenschutz')({
  head: () => ({
    meta: [
      { title: 'Datenschutz — Wohnungsbau-Tracker Berlin' },
      {
        name: 'description',
        content:
          'Welche Daten beim Besuch des Wohnungsbau-Trackers anfallen — und welche nicht. Keine Cookies für Besucher, keine externen Dienste, nur eine selbst betriebene Besucherstatistik.',
      },
    ],
    links: ARCHIVO_FONT_LINKS,
  }),
  component: DatenschutzPage,
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


function Liste({ punkte }: { punkte: React.ReactNode[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1 pl-5 text-sm font-medium leading-relaxed text-black/70">
      {punkte.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  )
}

const linkStil = 'font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70'

function DatenschutzPage() {
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
            Datenschutz.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-white/70">
            Diese Erklärung beschreibt nur, was diese Website tatsächlich tut. Das ist erfreulich
            wenig: keine Cookies für Besucherinnen und Besucher, keine Dienste von Dritten — und
            eine Besucherstatistik, die wir selbst betreiben, ohne einzelne Personen
            wiederzuerkennen.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <Abschnitt titel="Das Wichtigste zuerst">
          <Absatz>
            Du kannst diese Seite lesen, ohne dich anzumelden, ohne etwas einzugeben und ohne einer
            Datenverarbeitung zuzustimmen. Deshalb gibt es hier auch kein Cookie-Banner: Es gibt
            nichts, worin du einwilligen müsstest.
          </Absatz>
          <Absatz>Was diese Website nicht tut:</Absatz>
          <Liste
            punkte={[
              'Keine fremden Analyse- oder Tracking-Dienste (kein Google Analytics, kein Matomo-Cloud, kein Plausible). Die Besucherstatistik betreiben wir selbst — cookiefrei und ohne Wiedererkennung einzelner Personen, Einzelheiten im Abschnitt „Besucherstatistik“.',
              'Keine Werbung, kein Profiling, keine Weitergabe von Daten zu Werbezwecken.',
              'Keine Skripte, Schriften, Karten oder Bilder von fremden Servern — alles wird von unseren eigenen Servern ausgeliefert, auch die Statistik unter stats.wohnungsbautracker.de.',
              'Keine Social-Media-Plugins, keine „Gefällt mir“-Buttons, keine eingebetteten Videos.',
              'Kein Newsletter, kein Shop, kein Spenden- oder Mitgliedsformular, kein Kontaktformular, kein reCAPTCHA.',
              'Keine Cookies und kein Local Storage für normale Besuche.',
            ]}
          />
          <Absatz>
            Der Server erzwingt das zusätzlich technisch: Eine Content-Security-Policy erlaubt dem
            Browser ausschließlich Verbindungen zu dieser Seite selbst und zu unserer eigenen
            Statistik-Adresse stats.wohnungsbautracker.de.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Verantwortlicher">
          <Absatz>Verantwortlich im Sinne von Art. 4 Nr. 7 DSGVO ist:</Absatz>
          <Adresse>
            Junge Liberale Berlin
            <br />
            c/o FDP Landesverband Berlin
            <br />
            Reinhardtstraße 14
            <br />
            10117 Berlin
            <br />
            vertreten durch Moritz Wimmer (Landesvorsitzender)
            <br />
            Telefon: +49 (0)30 278959-0
            <br />
            E-Mail:{' '}
            <a href="mailto:kontakt@julis-berlin.de" className={linkStil}>
              kontakt@julis-berlin.de
            </a>
          </Adresse>
          <Absatz>Als Datenschutzbeauftragter ist benannt:</Absatz>
          <Adresse>
            Philippe Hintzen
            <br />
            Reinhardtstraße 14
            <br />
            10117 Berlin
            <br />
            Telefon: +49 (0)30 68078550
            <br />
            E-Mail:{' '}
            <a href="mailto:philippe.hintzen@julis.de" className={linkStil}>
              philippe.hintzen@julis.de
            </a>
          </Adresse>
        </Abschnitt>

        <Abschnitt titel="Aufruf der Website: Server-Protokolle">
          <Absatz>
            Wenn du eine Seite aufrufst, muss dein Gerät technisch mit unserem Server sprechen.
            Dabei fallen — wie bei jedem Webserver — Verbindungsdaten an:
          </Absatz>
          <Liste
            punkte={[
              'IP-Adresse deines Geräts oder deines Anschlusses',
              'Datum und Uhrzeit des Abrufs',
              'die aufgerufene Adresse (URL)',
              'HTTP-Statuscode und übertragene Datenmenge',
              'die zuvor besuchte Seite (Referrer), sofern dein Browser sie sendet',
              'Browser- und Betriebssystemkennung (User-Agent)',
            ]}
          />
          <Absatz>
            Diese Daten brauchen wir, um die Seite überhaupt ausliefern zu können, um Störungen zu
            finden und um Angriffe zu erkennen. Rechtsgrundlage ist unser berechtigtes Interesse am
            sicheren und fehlerfreien Betrieb (Art. 6 Abs. 1 lit. f DSGVO).
          </Absatz>
          <Absatz>
            Die Protokolle werden nach sieben Tagen gelöscht. Sie werden nicht mit anderen Daten
            zusammengeführt und nicht dazu genutzt, das Verhalten einzelner Personen auszuwerten.
            Eine Ausnahme gilt nur, wenn ein konkreter Vorfall — etwa ein Angriff — die Aufbewahrung
            bis zu dessen Klärung erfordert.
          </Absatz>
          <Absatz>
            Über diese Protokolle hinaus fällt beim Aufruf nur die im nächsten Abschnitt
            beschriebene Besucherstatistik an. In der Datenbank des Trackers stehen ausschließlich
            Bauprojekte, Beschlüsse und Statistiken — keine Besucherdaten.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Besucherstatistik (GoatCounter)">
          <Absatz>
            Wir möchten wissen, wie viele Menschen den Tracker lesen, welche Projekte sie
            interessieren und über welche Wege sie hierher finden. Dafür betreiben wir auf unserem
            eigenen Server unter stats.wohnungsbautracker.de eine Instanz der quelloffenen
            Statistik-Software{' '}
            <a
              href="https://www.goatcounter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={linkStil}
            >
              GoatCounter ↗
            </a>
            . Es ist kein fremder Dienst beteiligt; die Daten verlassen unsere Infrastruktur nicht.
          </Absatz>
          <Absatz>Bei jedem Seitenaufruf wird dafür festgehalten:</Absatz>
          <Liste
            punkte={[
              'die aufgerufene Seite (Pfad)',
              'die zuvor besuchte Seite (Referrer), sofern dein Browser sie sendet',
              'Browser- und Betriebssystemkennung (User-Agent)',
              'die Bildschirmgröße',
              'das Herkunftsland, abgeleitet aus der IP-Adresse',
              'Datum und Uhrzeit',
            ]}
          />
          <Absatz>
            Außerdem zählen wir, wie oft Besucherinnen und Besucher den Belegen tatsächlich folgen
            — also auf einer Projektseite eine Drucksache, einen Beleg oder eine Quelle anklicken.
            Gezählt wird dabei nur die Kategorie des Links (Drucksache, Beleg oder Quelle), nicht
            die Zieladresse, nicht die Projektseite und nicht, wer geklickt hat.
          </Absatz>
          <Absatz>
            Was dabei nicht passiert: GoatCounter setzt kein Cookie und legt nichts im Speicher
            deines Browsers ab. Die IP-Adresse selbst wird nicht gespeichert — sie dient nur
            flüchtig dazu, das Herkunftsland zu bestimmen und Aufrufe derselben Person innerhalb
            weniger Stunden über einen nicht umkehrbaren, regelmäßig verworfenen Hash als einen
            Besuch zu zählen. Eine Wiedererkennung über Tage hinweg oder über andere Websites ist
            damit ausgeschlossen; es entstehen keine Besucherprofile, nur Summen. Die Statistik des
            internen Redaktionsbereichs unter /admin wird gar nicht erst erhoben.
          </Absatz>
          <Absatz>
            Rechtsgrundlage ist unser berechtigtes Interesse daran zu verstehen, wie dieses
            politische Informationsangebot genutzt wird (Art. 6 Abs. 1 lit. f DSGVO). Da auf deinem
            Gerät nichts gespeichert und nichts Gespeichertes ausgelesen wird, ist keine
            Einwilligung nach § 25 TDDDG erforderlich — deshalb gibt es weiterhin kein
            Cookie-Banner. Der Verarbeitung kannst du jederzeit widersprechen (Art. 21 DSGVO), am
            einfachsten formlos per E-Mail; außerdem verhindern gängige Werbe- und Trackingblocker
            die Zählung wirksam, ohne dass die Seite dadurch schlechter funktioniert.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Hosting">
          <Absatz>
            Die Website läuft auf gemieteter Infrastruktur der Hetzner Online GmbH,
            Industriestr. 25, 91710 Gunzenhausen, im Rechenzentrum Falkenstein (Deutschland). Der
            Anbieter verarbeitet die oben
            genannten Verbindungsdaten in unserem Auftrag; dafür besteht ein Vertrag zur
            Auftragsverarbeitung nach Art. 28 DSGVO. Weitere Dienstleister sind nicht eingebunden.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Schriften, Karte und Vorschaubilder">
          <Absatz>
            Die Schriften der Archivo-Familie liegen als Dateien auf unserem eigenen Server unter
            /fonts/ — es gibt keine Verbindung zu Google Fonts. Die Berlin-Karte ist eine selbst
            gezeichnete SVG-Grafik aus amtlichen Bezirksgrenzen; es werden keine Kartenkacheln von
            einem Kartendienst nachgeladen. Auch die Vorschaubilder fürs Teilen erzeugt unser Server
            selbst. Deine IP-Adresse geht dadurch an keinen Dritten. Die Einzelheiten zu Quellen und
            Lizenzen stehen unter{' '}
            <Link to="/lizenzen" className={linkStil}>
              Lizenzen &amp; Quellen
            </Link>
            .
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Links zu anderen Websites">
          <Absatz>
            Wir verlinken auf Drucksachen in den Ratsinformationssystemen der Bezirke, auf
            Veröffentlichungen der Verwaltung, auf Presseberichte und auf unser Repository bei
            GitHub. Solche Links werden erst dann zu einer Datenübertragung, wenn du sie anklickst —
            von da an gilt die Datenschutzerklärung des jeweiligen Anbieters, auf dessen
            Verarbeitung wir keinen Einfluss haben. Beim Wechsel geben wir aus Datenschutzgründen
            nur die Herkunftsdomain weiter, nicht die genaue Seite, von der du kommst.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Cookies">
          <Absatz>
            Für den normalen Besuch dieser Website wird kein Cookie gesetzt und nichts im Speicher
            deines Browsers abgelegt.
          </Absatz>
          <Absatz>
            Ein einziges Cookie existiert: Wer sich im internen Redaktionsbereich unter /admin
            anmeldet, erhält ein technisch notwendiges Sitzungs-Cookie mit dem Namen{' '}
            <span className="font-bold text-black">wbt_admin</span>. Es enthält nur die
            verschlüsselte Information, dass eine Anmeldung stattgefunden hat, gilt nur bis zum
            Schließen des Browsers und ist für den Zugriff durch Skripte gesperrt. Das betrifft
            ausschließlich die Redaktion, nicht die Öffentlichkeit. Rechtsgrundlage ist § 25 Abs. 2
            Nr. 2 TDDDG in Verbindung mit Art. 6 Abs. 1 lit. f DSGVO.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Schutz des Redaktionslogins">
          <Absatz>
            Um das Erraten von Passwörtern zu verhindern, merkt sich der Server fehlgeschlagene
            Anmeldeversuche unter /admin für 15 Minuten zusammen mit der IP-Adresse, von der sie
            kamen. Diese Angaben stehen nur im Arbeitsspeicher, werden nicht in die Datenbank
            geschrieben, nach Ablauf der 15 Minuten gelöscht und gehen bei jedem Neustart verloren.
            Wer die Seite nur liest, löst das nie aus. Rechtsgrundlage ist unser berechtigtes
            Interesse an der Sicherheit des Systems (Art. 6 Abs. 1 lit. f DSGVO).
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Kontakt per E-Mail">
          <Absatz>
            Wenn du uns schreibst, verarbeiten wir deine Angaben — E-Mail-Adresse, Name, Inhalt der
            Nachricht — allein, um dein Anliegen zu beantworten. Rechtsgrundlage ist unser
            berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO),
            bei vertraglichen oder vorvertraglichen Anliegen Art. 6 Abs. 1 lit. b DSGVO. Wir löschen
            die Korrespondenz, sobald sie erledigt ist und keine gesetzliche Aufbewahrungspflicht
            entgegensteht.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Weitergabe von Daten">
          <Absatz>
            Wir geben personenbezogene Daten nicht an Dritte weiter — mit Ausnahme des oben
            genannten Hosting-Anbieters, der als Auftragsverarbeiter an unsere Weisungen gebunden
            ist, und der Fälle, in denen wir gesetzlich dazu verpflichtet sind oder die Weitergabe
            zur Geltendmachung oder Verteidigung von Rechtsansprüchen erforderlich ist. Eine
            Übermittlung in Länder außerhalb der EU findet durch uns nicht statt.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Datensicherheit">
          <Absatz>
            Die Seite wird ausschließlich verschlüsselt übertragen (HTTPS/TLS). Das erkennst du am
            Schloss-Symbol in der Adressleiste deines Browsers. Darüber hinaus schützen wir die
            Daten durch technische und organisatorische Maßnahmen nach dem Stand der Technik gegen
            Verlust, Veränderung und unbefugten Zugriff.
          </Absatz>
        </Abschnitt>

        <Abschnitt titel="Deine Rechte">
          <Absatz>Dir stehen gegenüber uns die folgenden Rechte zu:</Absatz>
          <Liste
            punkte={[
              'Auskunft über die zu dir gespeicherten Daten (Art. 15 DSGVO)',
              'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
              'Löschung (Art. 17 DSGVO)',
              'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
              'Datenübertragbarkeit (Art. 20 DSGVO)',
              'Widerspruch gegen Verarbeitungen, die wir auf ein berechtigtes Interesse stützen (Art. 21 DSGVO)',
            ]}
          />
          <Absatz>
            Eine einmal erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft
            widerrufen (Art. 7 Abs. 3 DSGVO). Für alle diese Anliegen genügt eine formlose Nachricht
            an{' '}
            <a href="mailto:kontakt@julis-berlin.de" className={linkStil}>
              kontakt@julis-berlin.de
            </a>
            .
          </Absatz>
          <Absatz>
            Unabhängig davon kannst du dich nach Art. 77 DSGVO bei einer Aufsichtsbehörde
            beschweren. Für uns zuständig ist:
          </Absatz>
          <Adresse>
            Berliner Beauftragte für Datenschutz und Informationsfreiheit
            <br />
            Alt-Moabit 59–61
            <br />
            10555 Berlin
            <br />
            <a
              href="https://www.datenschutz-berlin.de"
              target="_blank"
              rel="noopener noreferrer"
              className={linkStil}
            >
              www.datenschutz-berlin.de ↗
            </a>
          </Adresse>
        </Abschnitt>

        <div className="mt-16 p-6" style={{ backgroundColor: '#F5F5F5' }}>
          <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: BLUE }}>
            Stand
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
            August 2026. Ändert sich etwas an der Technik dieser Seite, ändern wir auch diesen Text.
            Die Angaben zum Anbieter stehen im{' '}
            <Link to="/impressum" className={linkStil}>
              Impressum
            </Link>
            .
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
          <Link
            to="/impressum"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 no-underline transition-colors hover:text-white"
          >
            Impressum
          </Link>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: CYAN }}>
            Datenschutz
          </span>
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
