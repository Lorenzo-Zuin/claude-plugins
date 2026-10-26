---
name: scrittura-testi
description: Linee guida per scrivere o rivedere testi in italiano — documenti di analisi, documenti per il cliente, ADR, note, commit, messaggi dell'interfaccia, rendiconti, email. Usa questa skill ogni volta che il lavoro produce o modifica un testo destinato a una persona, anche se l'utente non la nomina, e prima di riscrivere un testo che l'utente ha criticato.
---

# Scrittura dei testi

Chi legge è una persona competente con poco tempo. Il testo dice che cosa è, che cosa succede e che cosa deve fare chi legge. Niente altro.

## Prima di scrivere

- **Chi legge.** Interno (sviluppo, chi conosce il prodotto) o esterno (cliente, fornitore, chi conosce solo ciò che vede). Il testo per l'esterno non contiene nomi di componenti interni, nomi di tabelle, funzioni, parametri, sigle di documenti interni, né funzioni che il lettore non ha ancora visto.
- **Che cosa deve decidere o fare** chi legge. Se non deve fare niente, il testo è probabilmente troppo lungo.
- **Che cosa è misurato e che cosa no.** I numeri si scrivono solo se misurati; il resto si dichiara non misurato. Niente stime di tempo o di durata se non richieste.

## Forma

- Frasi corte, una idea per frase, verbi normali. Niente tono commerciale, niente entusiasmo, niente punti esclamativi, niente emoji, niente linguaggio aulico.
- Impersonale: «non si può cambiare». Il prodotto non dà del tu.
- Mai la forma riflessiva con il sistema come soggetto sottinteso: «una segnalazione già inviata non si ritira», «il periodo non si ricalcola da solo», «si riallineano da soli». O si dice chi fa che cosa («nessuno ricalcola il periodo chiuso»), o la frase si toglie.
- Concreto: numeri e nomi veri al posto degli aggettivi. «Indietro di due giorni», non «leggermente indietro».
- Un'informazione sta in un posto solo. Altrove si rimanda.
- Tabelle per confrontare elementi paralleli; elenchi per passi o casi; prosa per un ragionamento di poche righe. Mai tabelle decorative.
- Virgolette basse «così» per citare testi dell'interfaccia; backtick solo per identificatori di codice, e mai nei testi per l'esterno.
- Niente storia: il documento contiene lo stato attuale, non «prima era così». Niente tracce di conversazione, niente «come discusso».

## Parole

- Mai parole inventate né termini inglesi italianizzati: il termine italiano corretto, oppure l'inglese così com'è. Mai forme ibride.
- Verbi e sostantivi da evitare perché gergali, metaforici o ambigui, con l'alternativa:
  - «dichiara», «porta» (di un file, di un dato) → «contiene», «riporta», «indica»
  - «costa» (di una modifica) → «richiede», «comporta»
  - «consegna» (di un file) → «file», «estrazione», «invio»
  - «entra», «entrano» (di righe o dati) → «è presente», «viene aggiunto», «viene importato»
  - «sistemare» → «correggere», «riparare»
  - «buco», «buchi» (di dati) → «righe mancanti», «mancanza», «intervallo mancante»
  - espressioni colloquiali come «con i numeri in mano», «a questo punto», «la palla è di» → si riscrivono in forma neutra («in base ai risultati», «in carico a»)
  - «serve», «basta» (nei testi per l'esterno) → «è necessario», «è sufficiente», «deve prevedere»
  - «in parallelo», «in ogni caso», «ovviamente», «semplicemente» → si tolgono
- Un termine tecnico resta identico per tutto il documento: un'entità, un nome.

## Rivedere un testo

- **Non aggiungere, riscrivere.** Una correzione chiesta dall'utente si risolve riscrivendo il paragrafo, non accodando un altro paragrafo o un sottopunto. Il testo deve restare della stessa lunghezza o accorciarsi.
- **Non togliere ciò che non è stato criticato.** Quando si riscrive un punto si cambia solo ciò che l'utente ha indicato e si conserva il resto parola per parola. Prima di riscrivere si rilegge la versione precedente.
- Una parola che l'utente ha rifiutato non si riusa altrove nel testo: si cerca e si sostituisce ovunque.
- Dopo la revisione si rilegge il documento intero una volta, per i riferimenti incrociati (numeri di punto, nomi di sezione) e per i termini.

## Documenti versionati

- Nuova versione = nuovo file con il suffisso di versione; il precedente si sposta nella cartella delle versioni vecchie. Non si sovrascrive una versione esistente.
- La versione nuova riparte dal testo della precedente e cambia solo ciò che è cambiato.

## Rendiconto di un lavoro

Prima ciò che non è fatto o non è verificato, poi ciò che tocca all'utente, poi in una riga ciò che è fatto. Un difetto proprio si nomina, non si smussa.
