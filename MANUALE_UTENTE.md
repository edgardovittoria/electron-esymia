# Manuale Utente di Electron Esymia

Benvenuto in **Electron Esymia**, un'applicazione desktop avanzata per la modellazione CAD 3D. Questa guida ti aiuterà a familiarizzare con l'interfaccia e a sfruttare al meglio gli strumenti disponibili per creare e gestire i tuoi progetti 3D.

## 1. Panoramica dell'Interfaccia

L'interfaccia di Electron Esymia è progettata per essere intuitiva e potente. Ecco le aree principali:

*   **Canvas 3D (Area Centrale)**: È lo spazio tridimensionale dove visualizzi e interagisci con il tuo modello.
*   **Barra degli Strumenti (Toolbar)**: Situata generalmente in alto o a sinistra, contiene le icone per aggiungere forme, applicare trasformazioni e utilizzare strumenti specifici.
*   **Albero della Storia (History Tree)**: Un pannello (solitamente a sinistra) che mostra la cronologia delle operazioni effettuate. Puoi cliccare sui nodi per annullare/ripristinare azioni o vedere lo stato del progetto in un momento passato.
*   **Pannello Proprietà (Dettagli Oggetto)**: Situato a destra, mostra le informazioni dell'oggetto selezionato (posizione, rotazione, scala, materiale) e permette di modificarle.

## 2. Navigazione nella Scena

Per muoverti all'interno del Canvas 3D:

*   **Ruota (Orbit)**: Tieni premuto il tasto sinistro del mouse e trascina per ruotare la vista attorno al centro.
*   **Sposta (Pan)**: Tieni premuto il tasto destro del mouse (o Shift + tasto sinistro) e trascina per spostare la vista lateralmente.
*   **Zoom**: Usa la rotellina del mouse per avvicinarti o allontanarti.
*   **Centra Selezione (Center Selection)**: Centra la vista sull'oggetto attualmente selezionato, utile per esaminare i dettagli.
*   **Resetta Vista (Reset Focus)**: Riporta la telecamera a una visuale predefinita che inquadra l'intera scena o deseleziona il focus attuale.
*   **Adatta Griglia (Adapt Grids)**: Ridimensiona e adatta la griglia di riferimento in base alla scala e alla posizione degli oggetti nella scena.

> **Esempio**: Se hai perso di vista il tuo modello perché hai zoomato troppo lontano, clicca su **Resetta Vista** per riportare tutto al centro dello schermo. Se stai lavorando su un dettaglio molto piccolo, selezionalo e usa **Centra Selezione** per ruotargli attorno agevolmente.

## 3. Creazione e Gestione Oggetti

### Aggiungere Forme
Dalla Barra degli Strumenti, clicca sulle icone corrispondenti per aggiungere forme primitive alla scena:
*   **Cubo**
*   **Sfera**
*   **Cilindro**
*   **Cono**
*   **Toro**

> **Esempio**: Clicca sull'icona del **Cubo**. Un cubo apparirà al centro della scena (0,0,0). Puoi subito iniziare a modificarlo o spostarlo.

### Selezione
Esistono due modalità di selezione, attivabili dalla Barra degli Strumenti:
*   **Selezione Singola (Single Selection) (DEFAULT)**: Clicca su un oggetto per selezionarlo. Cliccando su un altro oggetto, la selezione precedente viene annullata.
*   **Selezione Multipla (Multiple Selection)**: Permette di selezionare più oggetti cliccandoli uno dopo l'altro, senza perdere la selezione precedente. Utile per operazioni di gruppo.

Puoi anche selezionare gli oggetti cliccando sul loro nome nella lista presente nel Pannello Proprietà.

### Trasformazioni
Una volta selezionato un oggetto, puoi modificarne la posizione, rotazione e scala:
1.  Usa il **Gizmo** (le frecce colorate) che appare sull'oggetto per trasformarlo interattivamente.
2.  Oppure, inserisci valori precisi nel **Pannello Proprietà** sotto la sezione "Transformation Params".

### Duplicazione
*   **Clona**: Crea una copia esatta dell'oggetto selezionato. La copia verrà creata nella stessa posizione dell'originale (o con un leggero offset) e apparirà nell'albero della storia.

> **Esempio**: Hai configurato un cilindro con le dimensioni perfette. Invece di crearne uno nuovo e reimpostare tutto, selezionalo e clicca **Clona**. Ora hai due cilindri identici pronti all'uso.

## 4. Operazioni Avanzate

### Raggruppamento (Group/Ungroup)
Per organizzare meglio il tuo modello:
*   **Raggruppa**: Seleziona più oggetti e usa il comando di raggruppamento. Questo creerà un unico contenitore per gli oggetti selezionati, permettendoti di muoverli insieme.
*   **Separa (Ungroup)**: Seleziona un gruppo e usa il comando di separazione per riportare gli oggetti al livello superiore, mantenendo la loro posizione.

> **Esempio**: Hai creato un tavolo composto da 4 gambe (cilindri) e un piano (cubo). Seleziona tutti e 5 gli oggetti e clicca **Raggruppa**. Ora puoi spostare l'intero tavolo cliccando su un qualsiasi punto di esso, senza dover riselezionare i singoli pezzi.

### Operazioni Booleane
Puoi combinare forme per creare geometrie complesse:
*   **Unione**: Fonde due o più oggetti in uno solo.
*   **Sottrazione**: Rimuove il volume di un oggetto da un altro.
*   **Intersezione**: Mantiene solo la parte comune tra gli oggetti.

> **Esempio (Foratura)**: Vuoi creare un buco in un cubo. Posiziona un cilindro in modo che attraversi il cubo. Seleziona prima il cubo (oggetto da cui sottrarre), poi il cilindro (oggetto che sottrae) e clicca **Sottrazione**. Il cilindro sparirà lasciando un foro nel cubo.

### Patterning
*   **Serie Lineare (Linear Array)**: Permette di creare copie multiple di un oggetto distribuendole lungo una direzione specifica (asse X, Y o Z). È possibile definire il numero di copie e la distanza tra di esse.

> **Esempio**: Per creare una scala, crea il primo gradino. Selezionalo, attiva **Serie Lineare**, imposta 10 copie con un offset su X e Y. Otterrai istantaneamente una scalinata perfetta.

## 5. Materiali e Visualizzazione

Nel Pannello Proprietà, puoi gestire l'aspetto degli oggetti:
*   **Colore**: Cambia il colore dell'oggetto selezionato.
*   **Trasparenza**: Regola l'opacità per rendere gli oggetti trasparenti o invisibili.
*   **Bordi**: Attiva/disattiva la visualizzazione dei bordi (wireframe) per vedere meglio la geometria.

## 6. Importazione ed Esportazione

*   **Importa**: Puoi caricare modelli esistenti in formato STL o progetti salvati.
*   **Esporta**: Salva il tuo lavoro corrente come file STL, pronto per la stampa 3D o per essere usato in altri software. L'esportazione supporta anche i gruppi, mantenendo la struttura gerarchica.

## 7. Storia e Annulla/Ripristina

L'**Albero della Storia** è uno strumento potente:
*   Ogni azione che compi (creazione, spostamento, modifica) crea un nuovo "nodo" nella storia.
*   Usa i pulsanti **Annulla (Undo)** e **Ripristina (Redo)** per navigare tra le tue azioni.
*   **L'albero visualizza graficamente il flusso del tuo lavoro, permettendoti di tornare a qualsiasi punto precedente con un click.**

> **Esempio**: Hai cancellato per sbaglio un oggetto importante. Invece di disperare, guarda l'Albero della Storia. Clicca sul pulsante **Undo** o seleziona il nodo precedente all'azione di cancellazione. L'oggetto tornerà magicamente al suo posto.

---
*Buon lavoro con Electron Esymia!*
