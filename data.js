/**
 * VOCABOLARIO ACCADEMICO E CURATO DELLA LINGUA ITALIANA
 * Ogni gruppo può includere un campo opzionale `note` con una curiosità
 * linguistica, etimologica o culturale che viene rivelata a fine partita.
 */
const CATEGORIES_DATA = {
  yellow: [
    { category: "FORMATI DI PASTA CORTA", words: ["PENNE", "FUSILLI", "RIGATONI", "FARFALLE"] },
    { category: "AGRUMI", words: ["ARANCIA", "LIMONE", "MANDARINO", "CEDRO"] },
    { category: "AMBIENTI DELLA CASA", words: ["CUCINA", "SALOTTO", "BAGNO", "STUDIO"] },
    { category: "CALZATURE", words: ["MOCASSINO", "SANDALO", "STIVALE", "SCARPONE"] },
    { category: "ANIMALI DELLA FATTORIA", words: ["MUCCA", "PECORA", "MAIALE", "GALLINA"] },
    { category: "ORTAGGI A FOGLIA", words: ["SPINACIO", "LATTUGA", "BIETOLA", "CICORIA"] },
    { category: "METALLI E LEGHE", words: ["ORO", "ARGENTO", "RAME", "BRONZO"] },
    { category: "BEVANDE DELLA COLAZIONE", words: ["LATTE", "CAFFÈ", "SPREMUTA", "CAPPUCCINO"] },
    { category: "MEZZI DI TRASPORTO URBANO", words: ["AUTOBUS", "METRO", "TRAM", "FILOBUS"] },
    { category: "FRUTTI CON IL NOCCIOLO", words: ["PESCA", "ALBICOCCA", "CILIEGIA", "SUSINA"] },
    { category: "STRUMENTI AD ARCO", words: ["VIOLINO", "VIOLA", "CELLO", "CONTRABBASSO"] },
    { category: "RAZZE CANINE", words: ["ALANO", "BARBONE", "BASSOTTO", "LEVRIERO"] },
    { category: "PIANETI DEL SISTEMA SOLARE", words: ["MARTE", "VENERE", "GIOVE", "SATURNO"] },
    { category: "ERBE AROMATICHE", words: ["BASILICO", "ROSMARINO", "SALVIA", "ORIGANO"] },
    { category: "PIATTI TRADIZIONALI ITALIANI", words: ["PIZZA", "RISOTTO", "POLENTA", "LASAGNA"] },
    { category: "ABBIGLIAMENTO INVERNALE", words: ["CAPPOTTO", "SCIARPA", "GUANTO", "COLBACCO"] },
    { category: "ARTICOLI DI CANCELLERIA", words: ["GOMMA", "RIGHELLO", "TEMPERINO", "MATITA"] },
    { category: "ALBERI DA FRUTTO", words: ["MELO", "PERO", "CILIEGIO", "MANDORLO"] },
    { category: "DOLCI ITALIANI", words: ["TIRAMISÙ", "CANNOLO", "CASSATA", "BABÀ"] },
    { category: "SPORT CON LA PALLA", words: ["CALCIO", "BASKET", "VOLLEY", "RUGBY"] },
    { category: "PRECIPITAZIONI METEO", words: ["PIOGGIA", "NEVE", "GRANDINE", "BRINA"] },
    { category: "ORGANI DEL CORPO UMANO", words: ["CUORE", "POLMONE", "FEGATO", "MILZA"] },
    { category: "POSATE DA TAVOLA", words: ["FORCHETTA", "COLTELLO", "CUCCHIAIO", "MESTOLO"] },
    { category: "INSETTI ALATI", words: ["FARFALLA", "APE", "LIBELLULA", "MOSCA"] },
    { category: "GENERI DELLA NARRATIVA", words: ["ROMANZO", "NOVELLA", "RACCONTO", "FAVOLA"] },
    { category: "ARREDI DELLA CAMERA", words: ["ARMADIO", "COMODINO", "COMO", "LETTO"] },
    { category: "LEGNI PREGIATI", words: ["QUERCIA", "ROVERE", "NOCE", "MOGANO"] },
    { category: "PIETRE PREZIOSE", words: ["DIAMANTE", "RUBINO", "SMERALDO", "ZAFFIRO"] },
    { category: "FORMAGGI FRESCHI", words: ["MOZZARELLA", "RICOTTA", "STRACCHINO", "BURRATA"] },
    { category: "FUNGHI COMMESTIBILI", words: ["PORCINO", "OVOLO", "CHIODINO", "FINFERLO"] },
    { category: "PESCI DI MARE", words: ["ORATA", "SPIGOLA", "SOGLIOLA", "TRIGLIA"] },
    { category: "UCCELLI RAPACI", words: ["AQUILA", "FALCO", "GUFO", "POIANA"] },
    { category: "FIORI DA GIARDINO", words: ["ROSA", "TULIPANO", "GIGLIO", "GAROFANO"] },
    { category: "SPEZIE IN CUCINA", words: ["ZAFFERANO", "CANNELLA", "CURCUMA", "PEPE"] },
    { category: "LEGUMI", words: ["CECE", "LENTICCHIA", "FAGIOLO", "FAVA"] },
    { category: "CEREALI", words: ["FRUMENTO", "ORZO", "AVENA", "SEGALE"] },
    { category: "FRUTTA A GUSCIO", words: ["MANDORLA", "NOCCIOLA", "PISTACCHIO", "PINOLO"] },
    { category: "SALUMI ITALIANI", words: ["PROSCIUTTO", "SALAME", "BRESAOLA", "COPPA"] },
    { category: "FORMAGGI STAGIONATI", words: ["PARMIGIANO", "PECORINO", "FONTINA", "PROVOLONE"] },
    { category: "TAGLI DI CARNE BOVINA", words: ["FILETTO", "COSTATA", "GIRELLO", "SCAMONE"] },
    { category: "CONDIMENTI E SALSE", words: ["MAIONESE", "SENAPE", "PESTO", "SALSA"] },
    { category: "BIANCHERIA DI CASA", words: ["LENZUOLO", "FEDERA", "TOVAGLIA", "SALVIETTA"] },
    { category: "STRUMENTI A PERCUSSIONE", words: ["TAMBURO", "TIMPANO", "XILOFONO", "PIATTI"] },
    { category: "DANZE E BALLI", words: ["VALZER", "TANGO", "MAZURCA", "SAMBA"] },
    { category: "SPORT INVERNALI", words: ["SLITTINO", "SCI", "BIATHLON", "BOB"] },
    { category: "DISCIPLINE DI ATLETICA", words: ["MARATONA", "DISCO", "OSTACOLI", "STAFFETTA"] },
    { category: "MOMENTI DEL GIORNO", words: ["ALBA", "MATTINO", "MERIGGIO", "TRAMONTO"] },
    { category: "CONTENITORI PER VINO", words: ["BOTTIGLIA", "CARAFFA", "FIASCO", "BOTTE"] },
    { category: "UTENSILI DA CUCINA", words: ["SETACCIO", "GRATTUGIA", "MATTARELLO", "COLINO"] },
    { category: "RECIPIENTI DI COTTURA", words: ["PENTOLA", "PADELLA", "TEGAME", "PENTOLINO"] },
    { category: "ATTREZZI DA GIARDINO", words: ["RASTRELLO", "VANGA", "CESOIA", "PALA"] },
    { category: "ARNESI DEL FALEGNAME", words: ["PIALLA", "SCALPELLO", "SEGA", "MORSA"] },
    { category: "CAPOLUOGHI DI REGIONE", words: ["FIRENZE", "BOLOGNA", "TORINO", "PALERMO"] },
    { category: "ISOLE ITALIANE", words: ["ELBA", "ISCHIA", "CAPRI", "LIPARI"] },
    { category: "FIUMI D'ITALIA", words: ["TEVERE", "ARNO", "ADIGE", "PIAVE"] },
    { category: "LAGHI ITALIANI", words: ["GARDA", "ISEO", "TRASIMENO", "BOLSENA"] },
    { category: "VULCANI ITALIANI", words: ["VESUVIO", "ETNA", "STROMBOLI", "VULCANO"] },
    { category: "MARI ITALIANI", words: ["TIRRENO", "ADRIATICO", "IONIO", "LIGURE"] },
    { category: "STILI DEL NUOTO", words: ["DELFINO", "DORSO", "RANA", "STILE"] },
    { category: "CAFFÈ AL BAR", words: ["ESPRESSO", "MACCHIATO", "RISTRETTO", "LUNGO"] }
  ],

  green: [
    { category: "OGGETTI DOTATI DI TASTI", words: ["PIANOFORTE", "CITOFONO", "TASTIERA", "FISARMONICA"] },
    { category: "ENTITÀ DOTATE DI ALI", words: ["AEROPLANO", "ANGELO", "MULINO", "UCCELLO"] },
    { category: "ALIMENTI CHE SI SGUSCIANO", words: ["UOVO", "ARACHIDE", "GAMBERO", "CASTAGNA"] },
    {
      category: "HANNO UNA CORONA",
      words: ["SOVRANO", "OROLOGIO", "DENTE", "ROSARIO"],
      note: "Nell'orologio è la rotellina laterale di carica; nel dente è la parte visibile sopra la gengiva."
    },
    { category: "STRUMENTI A FIATO", words: ["FLAUTO", "TROMBA", "CLARINETTO", "OBOE"] },
    { category: "HANNO LE LANCETTE", words: ["CRONOMETRO", "BUSSOLA", "TACHIMETRO", "SVEGLIA"] },
    { category: "OGGETTI CHE SI GONFIANO", words: ["PALLONCINO", "SALVAGENTE", "GOMMONE", "RUOTA"] },
    { category: "FONTI DI LUCE", words: ["LAMPADINA", "CANDELA", "LANTERNA", "TORCIA"] },
    { category: "OGGETTI CON IL MANICO", words: ["VALIGIA", "SCOPA", "OMBRELLO", "SECCHIO"] },
    { category: "FANNO TIC-TAC", words: ["PENDOLO", "METRONOMO", "FRECCIA", "TIMER"] },
    { category: "SUPERFICI CHE RIFLETTONO", words: ["SPECCHIO", "VETRINA", "STAGNO", "CRISTALLO"] },
    { category: "COSE CHE SI STAPPANO", words: ["SPUMANTE", "LAVANDINO", "PROSECCO", "SCARICO"] },
    {
      category: "DOTATI DI TASCHE",
      words: ["PANTALONE", "GREMBIULE", "ZAINO", "BILIARDO"],
      note: "Nel biliardo all'americana (pool) le 6 buche agli angoli e ai lati sono chiamate proprio «tasche»."
    },
    { category: "DOTATI DI CODA", words: ["COMETA", "VOLPE", "CORTEO", "ABITO"] },
    { category: "OGGETTI CHE SI ARROTOLANO", words: ["TAPPETO", "PERGAMENA", "TUBO", "SERRANDA"] },
    { category: "EMETTONO FUMO", words: ["CAMINO", "VULCANO", "INCENSO", "COMIGNOLO"] },
    { category: "COSE CHE SI ALLACCIANO", words: ["SCARPA", "CINTURA", "CRAVATTA", "CASCO"] },
    { category: "OGGETTI CON LA CERNIERA", words: ["BORSA", "ASTUCCIO", "TENDA", "GIACCA"] },
    { category: "COSE CHE SI CARICANO", words: ["CELLULARE", "BATTERIA", "BALESTRA", "MOLLA"] },
    { category: "SI SCIOLGONO AL CALDO", words: ["GHIACCIO", "CERA", "CIOCCOLATO", "BURRO"] },
    { category: "DOTATI DI LAMA", words: ["RASOIO", "SPADA", "PATTINO", "TAGLIERINO"] },
    { category: "ANIMALI CON GUSCIO O CONCHIGLIA", words: ["TARTARUGA", "CHIOCCIOLA", "PAGURO", "COZZA"] },
    { category: "MATERIALI TRASPARENTI", words: ["VETRO", "QUARZO", "PLEXIGLAS", "CELLOFAN"] },
    { category: "DOCUMENTI CHE SI TIMBRANO", words: ["BIGLIETTO", "PASSAPORTO", "CARTOLINA", "TESSERA"] },
    { category: "SEDUTE CON I BRACCIOLI", words: ["POLTRONA", "DIVANO", "TRONO", "SDRAIO"] },
    { category: "USANO UNA CORDICELLA", words: ["AQUILONE", "CAMPANELLO", "TAPPARELLA", "BURATTINO"] },
    { category: "OGGETTI CON I DENTI", words: ["PETTINE", "INGRANAGGIO", "RASTRELLO", "ZIP"] },
    { category: "HANNO UN COLLO", words: ["CAMICIA", "CHITARRA", "FIASCO", "GIRAFFA"] },
    { category: "HANNO LE GAMBE", words: ["TAVOLO", "COMPASSO", "CAVALLETTO", "SEDIA"] },
    { category: "HANNO UN DORSO", words: ["LIBRO", "MANO", "COLTELLO", "MONTE"] },
    { category: "COSE CHE SI PIEGANO", words: ["FAZZOLETTO", "ORIGAMI", "VENTAGLIO", "MAPPA"] },
    { category: "GIRANO SU SE STESSI", words: ["TROTTOLA", "GIOSTRA", "ELICA", "GIRANDOLA"] },
    { category: "LASCIANO UNA TRACCIA", words: ["GESSO", "PENNARELLO", "LUMACA", "PNEUMATICO"] },
    { category: "COSE CHE RIMBALZANO", words: ["PALLA", "SASSO", "CANGURO", "GOMMA"] },
    { category: "OGGETTI CON I BUCHI", words: ["COLINO", "DOCCIA", "SPUGNA", "GRUVIERA"] },
    { category: "SI APPENDONO AL MURO", words: ["QUADRO", "CALENDARIO", "TARGA", "POSTER"] },
    { category: "CONTENGONO INCHIOSTRO", words: ["PENNA", "TIMBRO", "STILOGRAFICA", "CARTUCCIA"] },
    { category: "USATI SEMPRE IN COPPIA", words: ["GUANTI", "CALZINI", "ORECCHINI", "BASTONCINI"] },
    { category: "COSE CHE GALLEGGIANO", words: ["SUGHERO", "BOA", "ZATTERA", "ICEBERG"] },
    { category: "STRUMENTI CON LE LENTI", words: ["OCCHIALI", "BINOCOLO", "TELESCOPIO", "MICROSCOPIO"] },
    { category: "SI APRONO CON LA CHIAVE", words: ["LUCCHETTO", "CASSAFORTE", "DIARIO", "PORTONE"] },
    { category: "DOTATI DI CORDE", words: ["ARPA", "RACCHETTA", "RING", "VELIERO"] },
    { category: "HANNO UN COPERCHIO", words: ["SCATOLA", "BAULE", "BARATTOLO", "URNA"] },
    { category: "FATTI DI CARTA", words: ["GIORNALE", "BANCONOTA", "BUSTA", "TOVAGLIOLO"] },
    { category: "DOTATI DI PEDALI", words: ["BICICLETTA", "AUTOMOBILE", "PEDALÒ", "ORGANO"] },
    { category: "COSE CHE SI SPREMONO", words: ["AGRUMI", "TUBETTO", "OLIVA", "UVA"] },
    { category: "FRUTTI CHE SI SBUCCIANO", words: ["BANANA", "PATATA", "MELA", "PERA"] },
    { category: "SI GRATTUGIANO IN CUCINA", words: ["GRANA", "PANE", "SCORZA", "CAROTA"] },
    { category: "SI MONTANO IN PASTICCERIA", words: ["PANNA", "ALBUME", "CREMA", "TUORLO"] },
    { category: "ELEMENTI CHE SI IMPASTANO", words: ["FARINA", "ARGILLA", "CEMENTO", "CRETA"] },
    { category: "DOTATI DI ANTENNA", words: ["RADIO", "TELEVISORE", "MODEM", "RADAR"] },
    { category: "DOTATI DI MOLLA", words: ["MATERASSO", "TRAMPOLINO", "MOLLETTA", "DIVANO"] },
    { category: "HANNO I GRADINI", words: ["SCALA", "PODIO", "TRIBUNA", "ALTARE"] },
    { category: "HANNO LE SBARRE", words: ["PRIGIONE", "CANCELLO", "CULLA", "GABBIA"] },
    { category: "DOTATI DI AGO", words: ["SIRINGA", "GIRADISCHI", "BILANCIA", "CUCITRICE"] },
    { category: "DOTATI DI FILTRO", words: ["MOKA", "TEIERA", "CAPPA", "ACQUARIO"] },
    { category: "COSE CHE SI SFOGLIANO", words: ["RIVISTA", "MARGHERITA", "CARCIOFO", "CIPOLLA"] },
    { category: "STRUMENTI DA ACCORDARE", words: ["UKULELE", "MANDOLINO", "LIUTO", "BANJO"] },
    { category: "USANO UNA RETE", words: ["PORTA", "TENNIS", "PESCA", "AMACA"] },
    { category: "FANNO SCHIUMA", words: ["SAPONE", "SHAMPOO", "BIRRA", "DETERSIVO"] }
  ],

  blue: [
    {
      category: "SINONIMI DI DENARO",
      words: ["GRANO", "QUATTRINI", "SPICCIOLI", "FONDI"],
      note: "«Quattrini» deriva dall'antica moneta romana da quattro denari; «grano» era invece una moneta del Regno di Napoli."
    },
    { category: "LESSICO DEL CINEMA", words: ["REGIA", "MONTAGGIO", "COPIONE", "RIPRESA"] },
    { category: "TONALITÀ DI ROSSO", words: ["CARMINIO", "SCARLATTO", "VERMIGLIO", "AMARANTO"] },
    { category: "STRUMENTI METEOROLOGICI", words: ["BAROMETRO", "TERMOMETRO", "ANEMOMETRO", "IGROMETRO"] },
    { category: "PARTI DELLA NAVE", words: ["PRUA", "POPPA", "CHIGLIA", "TIMONE"] },
    { category: "PARTI DI UN LIBRO", words: ["INDICE", "PREFAZIONE", "COPERTINA", "PROLOGO"] },
    { category: "SINONIMI COLTI DI CASA", words: ["DIMORA", "MAGIONE", "RESIDENZA", "TETTO"] },
    { category: "POLIGONI GEOMETRICI", words: ["ROMBO", "TRAPEZIO", "ESAGONO", "QUADRATO"] },
    { category: "ANDAMENTI MUSICALI", words: ["ADAGIO", "ANDANTE", "ALLEGRO", "VIVACE"] },
    {
      category: "VENTI DEL MEDITERRANEO",
      words: ["SCIROCCO", "MAESTRALE", "LIBECCIO", "BORA"],
      note: "Nella Rosa dei Venti classica, il Maestrale soffia da nord-ovest (verso Roma, «magistra»), mentre lo Scirocco arriva da sud-est."
    },
    { category: "RUOLI DEL CALCIO", words: ["PORTIERE", "TERZINO", "MEDIANO", "PUNTA"] },
    { category: "LESSICO DEI TRIBUNALI", words: ["VERDETTO", "SENTENZA", "APPELLO", "UDIENZA"] },
    { category: "VULCANOLOGIA", words: ["CALDERA", "MAGMA", "LAPILLO", "CRATERE"] },
    {
      category: "FIGURE RETORICHE",
      words: ["METAFORA", "OSSIMORO", "ANAFORA", "IPERBOLE"],
      note: "L'ossimoro accosta due termini opposti («ghiaccio bollente»), mentre l'anafora ripete una parola a inizio verso."
    },
    { category: "VALUTE MONDIALI", words: ["DOLLARO", "STERLINA", "FRANCO", "YEN"] },
    { category: "TECNICA FOTOGRAFICA", words: ["DIAFRAMMA", "OBIETTIVO", "ISO", "FUOCO"] },
    { category: "ELEMENTI GASSOSI", words: ["ELIO", "AZOTO", "OSSIGENO", "NEON"] },
    { category: "ASTRONOMIA", words: ["NEBULOSA", "ASTEROIDE", "ECLISSI", "GALASSIA"] },
    { category: "PEZZI DEGLI SCACCHI", words: ["TORRE", "ALFIERE", "CAVALLO", "PEDONE"] },
    { category: "ARCHITETTURA CLASSICA", words: ["COLONNA", "FRONTONE", "CAPITELLO", "ARCO"] },
    { category: "SEGNI DELLO ZODIACO", words: ["ARIETE", "GEMELLI", "SCORPIONE", "LEONE"] },
    { category: "GRAMMATICA ITALIANA", words: ["VERBO", "PRONOME", "AGGETTIVO", "AVVERBIO"] },
    { category: "METODI DI COTTURA", words: ["FORNO", "VAPORE", "FRITTURA", "GRIGLIA"] },
    { category: "PUNTEGGI DEL POKER", words: ["COLORE", "COPPIA", "TRIS", "FULL"] },
    { category: "UNITÀ DI MISURA FISICHE", words: ["WATT", "VOLT", "AMPERE", "JOULE"] },
    { category: "TESSUTI PREGIATI", words: ["SETA", "LINO", "VELLUTO", "RASO"] },
    { category: "BOTANICA DEL FIORE", words: ["PISTILLO", "STAME", "PETALO", "CALICE"] },
    { category: "ANATOMIA DELL'OCCHIO", words: ["IRIDE", "RETINA", "PUPILLA", "CORNEA"] },
    { category: "STRUMENTI CHIRURGICI", words: ["STETOSCOPIO", "BISTURI", "PINZA", "TAMPONE"] },
    { category: "STRUMENTI DEL PITTORE", words: ["TELA", "SPATOLA", "PENNELLO", "TAVOLOZZA"] },
    { category: "VOCI DELLA LIRICA", words: ["SOPRANO", "CONTRALTO", "TENORE", "BARITONO"] },
    { category: "STILI DI STORIA DELL'ARTE", words: ["ROMANICO", "GOTICO", "CLASSICO", "BAROCCO"] },
    {
      category: "ANATOMIA DELL'ORECCHIO",
      words: ["COCLEA", "STAFFA", "INCUDINE", "MARTELLO"],
      note: "Martello, incudine e staffa formano la catena degli ossicini dell'orecchio medio: la staffa è l'osso più piccolo del corpo umano."
    },
    { category: "PUNTEGGIATURA", words: ["VIRGOLA", "PUNTO", "PARENTESI", "TRATTINO"] },
    { category: "METRICA POETICA", words: ["SONETTO", "STROFA", "ODE", "RIMA"] },
    { category: "TIPI DI NUVOLE", words: ["CIRRO", "CUMULO", "STRATO", "NEMBO"] },
    { category: "TIPI DI ROCCE", words: ["GRANITO", "BASALTO", "ARDESIA", "TUFO"] },
    { category: "OSSA DELLO SCHELETRO", words: ["FEMORE", "OMERO", "COSTOLA", "TIBIA"] },
    { category: "MUSCOLI DEL CORPO", words: ["BICIPITE", "DELTOIDE", "PETTORALE", "DORSALE"] },
    { category: "AMBIENTI DEL TEATRO", words: ["PLATEA", "PALCO", "SIPARIO", "GALLERIA"] },
    { category: "GERGO GIORNALISTICO", words: ["OCCHIELLO", "SOMMARIO", "ARTICOLO", "CORSIVO"] },
    { category: "MATEMATICA", words: ["SOMMA", "RESTO", "PRODOTTO", "POTENZA"] },
    { category: "ANGOLI GEOMETRICI", words: ["ACUTO", "OTTUSO", "RETTO", "PIATTO"] },
    { category: "ARCANI DEI TAROCCHI", words: ["MATTO", "MAGO", "EREMITA", "MONDO"] },
    { category: "SEMI DELLE CARTE ITALIANE", words: ["DENARI", "COPPE", "SPADE", "BASTONI"] },
    { category: "MASCHERE TRADIZIONALI", words: ["ARLECCHINO", "PULCINELLA", "BRIGHELLA", "COLOMBINA"] },
    { category: "DEI DELL'OLIMPO", words: ["APOLLO", "MINERVA", "NETTUNO", "PLUTONE"] },
    { category: "MUSE GRECHE", words: ["CLIO", "ERATO", "TALIA", "URANIA"] },
    { category: "SETTE RE DI ROMA", words: ["ROMOLO", "NUMA", "TULLO", "ANCO"] },
    { category: "CORRENTI FILOSOFICHE", words: ["STOICISMO", "CINISMO", "IDEALISMO", "EMPIRISMO"] },
    { category: "TONALITÀ DI BLU", words: ["COBALTO", "INDACO", "TURCHESE", "CELESTE"] },
    { category: "TONALITÀ DI GIALLO", words: ["OCRA", "AMBRA", "CREMA", "PAGLIERINO"] },
    { category: "TONALITÀ DI VERDE", words: ["SMERALDO", "ACQUAMARINA", "OLIVA", "MENTA"] },
    { category: "VINI E VITIGNI ITALIANI", words: ["BARBERA", "NEBBIOLO", "CHIANTI", "BAROLO"] },
    { category: "PASTA ALL'UOVO", words: ["TAGLIATELLA", "FETTUCCINA", "PAPPARDELLA", "TAGLIOLINO"] },
    { category: "GRADI MILITARI", words: ["CAPORALE", "SERGENTE", "TENENTE", "COLONNELLO"] },
    { category: "LESSICO DEL TENNIS", words: ["ACE", "VOLÉE", "BREAK", "SERVIZIO"] },
    { category: "LESSICO DELLA SCHERMA", words: ["FIORETTO", "SCIABOLA", "STOCCATA", "AFFONDO"] },
    { category: "LESSICO DELLA VELA", words: ["BOLINA", "ORZA", "POPPA", "VIRATA"] },
    { category: "LESSICO DELL'ALPINISMO", words: ["CORDATA", "PARETE", "PICCOZZA", "RAMPONE"] }
  ],

  purple: [
    {
      category: "INIZIANO CON UNA NOTA MUSICALE",
      words: ["DOMINO", "RETE", "MIRAGGIO", "FALCO"],
      note: "DO-mino, RE-te, MI-raggio, FA-lco: le prime quattro note della scala diatonica nascondono l'inizio di ciascun vocabolo."
    },
    {
      category: "PARTI DEL CORPO IN GEOGRAFIA",
      words: ["BOCCA", "BRACCIO", "LINGUA", "GOLA"],
      note: "Bocca di porto, braccio di mare, lingua di terra, gola montana: la geografia fisica usa spesso metafore anatomiche."
    },
    {
      category: "PAROLE PALINDROME",
      words: ["RADAR", "ANNA", "OTTO", "INGEGNI"],
      note: "Si leggono esattamente allo stesso modo da sinistra a destra e da destra a sinistra."
    },
    {
      category: "COMPLETANO «COLPO DI ...»",
      words: ["FULMINE", "SCENA", "GRAZIA", "STATO"],
      note: "Colpo di fulmine, colpo di scena, colpo di grazia, colpo di stato."
    },
    {
      category: "SI COMBINANO CON «LUNA»",
      words: ["MEZZA", "PIENA", "MIELE", "STORTA"],
      note: "Mezzaluna, luna piena, luna di miele e avere la luna storta."
    },
    {
      category: "INIZIANO CON UN NUMERO",
      words: ["TRENO", "QUATTRO", "SEI", "OTTOBRE"],
      note: "TRE-no, QUATTRO, SEI, OTTO-bre: i numeri iniziali erano il vero filo nascosto."
    },
    {
      category: "SEGUONO LA PAROLA «CARTA»",
      words: ["BIANCA", "BOLLATA", "REGALO", "VETRATA"],
      note: "Carta bianca, carta bollata, carta regalo e carta vetrata."
    },
    {
      category: "ANAGRAMMI DI «ROMA»",
      words: ["AMOR", "RAMO", "MORA", "ORMA"],
      note: "Tutte e quattro le parole sono composte dalle stesse identiche lettere A-M-O-R."
    },
    {
      category: "METAFORE MARINE",
      words: ["ONDATA", "MAREA", "CORRENTE", "SCOGLIO"],
      note: "Ondata di freddo, marea di gente, corrente di pensiero e scoglio da superare."
    },
    {
      category: "COMPLETANO «PUNTO DI ...»",
      words: ["VISTA", "ROTTURA", "FUSIONE", "INCONTRO"],
      note: "Punto di vista, punto di rottura, punto di fusione, punto di incontro."
    },
    {
      category: "LETTERE DELL'ALFABETO SCRITTE",
      words: ["ACCA", "ZETA", "EFFE", "ESSE"],
      note: "Sono i nomi scritti per esteso delle consonanti H, Z, F ed S."
    },
    {
      category: "COMPLETANO «TESTA DI ...»",
      words: ["PONTE", "SERIE", "CUOIO", "LEGNO"],
      note: "Testa di ponte (militare), testa di serie (sport), testa di cuoio, testa di legno."
    },
    {
      category: "NOMI USATI AL PLURALE",
      words: ["NOZZE", "FORBICI", "FERIE", "SPESE"],
      note: "In grammatica sono chiamati «pluralia tantum»: nomi che si usano abitualmente solo al plurale."
    },
    {
      category: "COMPLETANO «GIOCO DI ...»",
      words: ["MANO", "SQUADRA", "PAROLE", "RUOLO"],
      note: "Gioco di mano, gioco di squadra, gioco di parole, gioco di ruolo."
    },
    {
      category: "TERMINI POLISEMICI DI FINANZA",
      words: ["TITOLO", "AZIONE", "BORSA", "QUOTA"],
      note: "Parole comunissime nel linguaggio quotidiano che in economia assumono un significato tecnico preciso."
    },
    {
      category: "CAMBIANO SENSO CON L'ACCENTO",
      words: ["ANCORA", "PRINCIPI", "SUBITO", "AMBITO"],
      note: "Sono omografi: àncora/ancóra, prìncipi/princìpi, sùbito/subìto, àmbito/ambìto."
    },
    {
      category: "COMPLETANO «SALTO NEL ...»",
      words: ["BUIO", "VUOTO", "TEMPO", "PASSATO"],
      note: "Salto nel buio, salto nel vuoto, salto nel tempo, salto nel passato."
    },
    {
      category: "COSE DEFINITE «FREDDE»",
      words: ["GUERRA", "TAVOLA", "CRONACA", "ARMA"],
      note: "Guerra fredda, tavola fredda, cronaca fredda e arma fredda (arma bianca)."
    },
    {
      category: "TERMINI MUSICALI CON DOPPIO SENSO",
      words: ["ACCORDO", "NOTA", "PAUSA", "TONO"],
      note: "Appartengono al pentagramma ma anche alla diplomazia, alla scrittura, al tempo e allo stile."
    },
    {
      category: "HANNO UN «CUORE» FIGURATO",
      words: ["CARCIOFO", "PROBLEMA", "NOTTE", "CITTÀ"],
      note: "Il cuore del carciofo, il cuore del problema, nel cuore della notte, nel cuore della città."
    },
    {
      category: "CONTENGONO TUTTE LE 5 VOCALI",
      words: ["AIUOLE", "SEQUOIA", "LIBRERIA", "AUTONOMIE"],
      note: "Sono parole «panvocaliche»: contengono ciascuna almeno una A, una E, una I, una O e una U."
    },
    {
      category: "COMPLETANO «FILO DI ...»",
      words: ["SPERANZA", "LANA", "FERRO", "VOCE"],
      note: "Filo di speranza, filo di lana, filo di ferro e un filo di voce."
    },
    {
      category: "COSE CHE SI «PERDONO» IN MODO DI DIRE",
      words: ["TEMPO", "BUSSOLA", "STAFFETTA", "PAZIENZA"],
      note: "Perdere tempo, perdere la bussola, perdere la staffetta (o le staffe) e perdere la pazienza."
    },
    {
      category: "COSE DEFINITE «CIECHE»",
      words: ["FIDUCIA", "FORTUNA", "RABBIA", "STRADA"],
      note: "Fiducia cieca, fortuna cieca, rabbia cieca e strada cieca (senza uscita)."
    },
    {
      category: "COMPLETANO «FERRO DA ...»",
      words: ["STIRO", "CAVALLO", "CALZA", "CANTIERE"],
      note: "Ferro da stiro, ferro di/da cavallo, ferro da calza e ferro da cantiere."
    },
    {
      category: "COMPLETANO «ACQUA ...»",
      words: ["CHETA", "DOLCE", "VITA", "SANTA"],
      note: "Acqua cheta, acqua dolce, acquavite (acqua vita) e acqua santa."
    },
    {
      category: "COMPLETANO «FUOCO DI ...»",
      words: ["PAGLIA", "FILA", "CAMPO", "ARTIFICIO"],
      note: "Fuoco di paglia, fuoco di fila, fuoco da/di campo e fuoco d'artificio."
    },
    {
      category: "COMPLETANO «ARIA DI ...»",
      words: ["FESTA", "CASA", "MARE", "CRISI"],
      note: "Aria di festa, aria di casa, aria di mare e aria di crisi."
    },
    {
      category: "COMPLETANO «TERRA DI ...»",
      words: ["NESSUNO", "MEZZO", "CONFINE", "SIENA"],
      note: "Terra di nessuno, Terra di Mezzo, terra di confine e terra di Siena (il pigmento)."
    },
    {
      category: "FORMANO COMPOSTI CON «PORTA-»",
      words: ["MONETE", "FOGLIO", "CENERE", "CHIAVI"],
      note: "Portamonete, portafoglio, portacenere e portachiavi."
    },
    {
      category: "FORMANO COMPOSTI CON «CAPO-»",
      words: ["STAZIONE", "UFFICIO", "LAVORO", "GRUPPO"],
      note: "Capostazione, capoufficio, capolavoro e capogruppo."
    },
    {
      category: "COMPLETANO «CAVALLO DI ...»",
      words: ["TROIA", "BATTAGLIA", "CORSA", "RAZZA"],
      note: "Cavallo di Troia, cavallo di battaglia, cavallo da/di corsa e cavallo di razza."
    },
    {
      category: "COMPLETANO «PIETRA DI ...»",
      words: ["PARAGONE", "LUNA", "SCANDALO", "ANGOLO"],
      note: "Pietra di paragone, pietra di luna, pietra dello scandalo e pietra d'angolo."
    },
    {
      category: "COMPLETANO «CANE DA ...»",
      words: ["GUARDIA", "CACCIA", "PASTORE", "TARTUFO"],
      note: "Cane da guardia, cane da caccia, cane da pastore e cane da tartufo."
    },
    {
      category: "ASSOCIATI AL «GATTO»",
      words: ["NERO", "STIVALI", "NEVI", "FUSA"],
      note: "Gatto nero, Il gatto con gli stivali, gatto delle nevi e fare le fusa."
    },
    {
      category: "ANIMALI CAMBIANDO L'INIZIALE",
      words: ["TANE", "MATTO", "TOPO", "BALLO"],
      note: "Cambiando la prima lettera diventano CANE, GATTO, LUPO (o TOPO stesso) e GALLO."
    },
    {
      category: "COMPLETANO «LINEA DI ...»",
      words: ["CONFINE", "TIRO", "PARTENZA", "FEBBRE"],
      note: "Linea di confine, linea di tiro, linea di partenza e linea di febbre."
    },
    {
      category: "COMPLETANO «CAMPO DI ...»",
      words: ["GRANO", "CALCIO", "GIOCO", "MARTE"],
      note: "Campo di grano, campo di calcio, campo da/di gioco e Campo di Marte."
    },
    {
      category: "COMPLETANO «ONDA DI ...»",
      words: ["CALORE", "URTO", "PIENA", "RADIO"],
      note: "Onda di calore, onda d'urto, onda di piena e onda radio."
    },
    {
      category: "COMPLETANO «TAGLIO DI ...»",
      words: ["CAPELLI", "LUCE", "LEGNA", "PREZZO"],
      note: "Taglio di capelli, taglio di luce, taglio della legna e taglio di prezzo."
    },
    {
      category: "COMPLETANO «BAGNO DI ...»",
      words: ["FOLLA", "SOLE", "UMILTÀ", "SANGUE"],
      note: "Bagno di folla, bagno di sole, bagno di umiltà e bagno di sangue."
    },
    {
      category: "COMPLETANO «GIRO DI ...»",
      words: ["VITE", "BOA", "PISTA", "ONORE"],
      note: "Giro di vite, giro di boa, giro di pista e giro d'onore."
    },
    {
      category: "COMPLETANO «MANO DI ...»",
      words: ["VERNICE", "POKER", "AIUTO", "BIANCO"],
      note: "Una mano di vernice, una mano di poker, una mano d'aiuto e una mano di bianco."
    },
    {
      category: "COMPLETANO «OCCHIO DI ...»",
      words: ["FALCO", "BUE", "TIGRE", "RIGUARDO"],
      note: "Occhio di falco, occhio di bue (finestra o uovo), occhio di tigre (pietra) e occhio di riguardo."
    },
    {
      category: "COMPLETANO «DENTE DI ...»",
      words: ["LEONE", "LATTE", "GIUDIZIO", "SEGA"],
      note: "Dente di leone (tarassaco), dente da/di latte, dente del giudizio e dente di sega."
    },
    {
      category: "COMPLETANO «VOCE DEL ...»",
      words: ["POPOLO", "VERBO", "CORO", "PADRONE"],
      note: "Voce del popolo, voce del verbo, voce del coro e «La voce del padrone»."
    },
    {
      category: "COMPLETANO «OMBRA DI ...»",
      words: ["DUBBIO", "SOSPETTO", "VINO", "BANCO"],
      note: "Senza ombra di dubbio, ombra di sospetto, un'ombra di vino (in Veneto) e ombra di banco."
    },
    {
      category: "COMPLETANO «NOTTE DEI ...»",
      words: ["TEMPI", "CRISTALLI", "DESIDERI", "MIRACOLI"],
      note: "Dalla notte dei tempi, Notte dei cristalli, notte dei desideri (San Lorenzo) e notte dei miracoli."
    },
    {
      category: "COMPLETANO «ALBERO ...»",
      words: ["MAESTRO", "MOTORE", "NATALE", "GENEALOGICO"],
      note: "Albero maestro (nautica), albero motore (meccanica), albero di Natale e albero genealogico."
    },
    {
      category: "COMPLETANO «STELLA ...»",
      words: ["POLARE", "ALPINA", "COMETA", "MARINA"],
      note: "Stella Polare, stella alpina, stella cometa e stella marina."
    },
    {
      category: "LOCUZIONI CON «CROCE»",
      words: ["DELIZIA", "TESTA", "ROSSA", "SUD"],
      note: "Croce e delizia, testa o croce, Croce Rossa e Croce del Sud."
    },
    {
      category: "COMPLETANO «ANIMA ...»",
      words: ["GEMELLA", "VIVA", "PIA", "BUONA"],
      note: "Anima gemella, non c'era anima viva, anima pia e buon'anima."
    },
    {
      category: "METAFORE BOTANICHE",
      words: ["RADICE", "RAMO", "FRUTTO", "SEME"],
      note: "La radice di un problema, un ramo d'azienda, il frutto del lavoro e il seme del dubbio."
    },
    {
      category: "VERBI USATI COME SOSTANTIVI",
      words: ["PIACERE", "DOVERE", "POTERE", "SAPERE"],
      note: "Infiniti sostantivati che indicano concetti astratti fondamentali (il piacere, il dovere, il potere, il sapere)."
    },
    {
      category: "COMPLETANO «LETTO DI ...»",
      words: ["FIUME", "ROSE", "PIUME", "CHIODI"],
      note: "Letto di fiume, letto di rose, letto di piume e letto di chiodi (fachiri)."
    },
    {
      category: "COMPLETANO «NODO ALLA ...»",
      words: ["GOLA", "CRAVATTA", "CORDA", "FAZZOLETTO"],
      note: "Nodo alla gola, nodo alla cravatta, nodo alla corda e nodo al fazzoletto."
    },
    {
      category: "TRENI ALTA VELOCITÀ «FRECCIA-»",
      words: ["ROSSA", "ARGENTO", "BIANCA", "ORO"],
      note: "Frecciarossa, Frecciargento, Frecciabianca e il celebre Freccia d'Oro."
    },
    {
      category: "COMPLETANO «SPECCHIO ...»",
      words: ["ACQUA", "RETROVISORE", "USTORIO", "MAGICO"],
      note: "Specchio d'acqua, specchio retrovisore, specchio ustorio (di Archimede) e specchio magico."
    },
    {
      category: "COMPLETANO «PONTE ...»",
      words: ["AEREO", "SOSPESO", "RADIO", "LEVATOIO"],
      note: "Ponte aereo, ponte sospeso, ponte radio e ponte levatoio."
    },
    {
      category: "COMPLETANO «SCATOLA ...»",
      words: ["NERA", "CHIUSA", "CRANICA", "CINESI"],
      note: "Scatola nera, a scatola chiusa, scatola cranica e scatole cinesi."
    }
  ]
};

// Normalizzazione preventiva del database
Object.keys(CATEGORIES_DATA).forEach(tier => {
  CATEGORIES_DATA[tier].forEach(group => {
    group.category = group.category.trim().toUpperCase();
    group.words = group.words.map(w => w.trim().toUpperCase());
  });
});