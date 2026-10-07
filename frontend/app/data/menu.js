/**
 * Menu del pescato del giorno — dato statico.
 * Fonte di verità per la sezione #pescato della homepage.
 * Il menu completo in PDF resta gestibile dall'admin e servito da /menu.
 *
 * @typedef {{ name: string, description?: string, price: string }} Dish
 * @typedef {{ id: string, title: string, column: 1 | 2, dishes: Dish[] }} MenuCategory
 */

/** @type {MenuCategory[]} */
export const MENU_CATEGORIES = [
  {
    id: 'crudi',
    title: 'Crudi di mare',
    column: 1,
    dishes: [
      { name: 'Mamer (Sardegna)', description: 'Ostrica', price: '€ 7' },
      { name: 'Etoile (Francia)', description: 'Ostrica', price: '€ 8' },
      { name: 'Gilardeu (Francia)', description: 'Ostrica — novità', price: '€ 7' },
      { name: 'Hamel (Francia)', description: 'Ostrica — novità', price: '€ 8' },
      { name: 'Taratufi', description: 'Frutti di mare crudi', price: '€ 10' },
      { name: 'Cannolicchi', description: 'Frutti di mare crudi', price: '€ 10' },
      { name: 'Cozze pelose', description: 'Frutti di mare crudi', price: '€ 8' },
      { name: 'Gamberi viola', description: 'Crostacei crudi, seconda misura · 2 pz a porzione', price: '€ 13' },
      { name: 'Scampi', description: 'Crostacei crudi, misura media', price: '€ 16' },
      { name: 'Gamberi gobetti', description: 'Crostacei crudi, su disponibilità', price: '€ 18' },
    ],
  },
  {
    id: 'tartare',
    title: 'Tartare & carpacci',
    column: 1,
    dishes: [
      { name: 'Mix tartare', description: 'Degustazione delle nostre tartare', price: '€ 25' },
      { name: 'Provola in carrozza', description: 'Con tartare di gambero rosso crudo e cream cheese', price: '€ 14' },
      { name: 'Tartare di tonno rosso', description: 'Con zucchine alla griglia e chips di fior di zucca', price: '€ 13' },
      { name: 'Tartare di salmone', description: 'Con riso alla soia e cremoso di scapece', price: '€ 10' },
      { name: 'Tartare di ricciola', description: 'Con tartare di mela verde e cialdina al mais', price: '€ 15' },
      { name: 'Carpaccio del giorno', description: 'Pescato giornaliero, su richiesta', price: '€ 10' },
    ],
  },
  {
    id: 'antipasti',
    title: 'Antipasti cotti',
    column: 1,
    dishes: [
      { name: "Polpo all'insalata", description: 'Con peperoncino verde', price: '€ 16' },
      { name: 'Arrosticini', description: 'Di pesce spada con zucchine alla scapece', price: '€ 14' },
      { name: 'Triglietta fango', description: 'Con insalatina iceberg', price: '€ 16' },
      { name: 'Tonno scottato', description: 'Con patate al forno', price: '€ 18' },
      { name: 'Pane burro e alici', description: 'Minibun piastrato con burro di bufala e acciughe del mar Cantabrico', price: '€ 20' },
      { name: 'Saté di vongole veraci', price: '€ 20' },
      { name: 'Cozze al barbecue', price: '€ 13' },
      { name: 'Baccalà', description: 'Con provola e cipolla caramellata', price: '€ 16' },
      { name: 'Parmigiana di alici', description: 'Con pomodorini all\'insalata — novità, a porzione', price: '€ 9' },
      { name: 'Degustazione antipasti', description: 'Assaggio di tutte le portate dei nostri antipasti', price: '€ 25' },
    ],
  },
  {
    id: 'primi',
    title: 'Primi',
    column: 2,
    dishes: [
      { name: 'Pezzogna di mare locale', description: 'Novità — per piatto', price: '€ 25' },
      { name: 'Cigala magnosa', description: '400/600gr — novità, per piatto', price: '€ 35' },
      { name: 'Con crostacei', description: "Aragosta rosa, astice Canada, granseola, gambero Carabineros — l'etto", price: '€ 15' },
      { name: 'Del pescatore', description: 'Rana pescatrice, pezzogna, San Pietro, ombrina, dentice — per piatto', price: '€ 25' },
      { name: 'Tagliolini', description: "All'uovo, limone e gambero crudo", price: '€ 25' },
      { name: 'Candela spezzata', description: 'Con genovese di tonno crudo', price: '€ 18' },
      { name: 'Linguine alle alghe', description: 'Con polpa di riccio di mare cruda', price: '€ 25' },
      { name: 'Spaghettone alla scapece', description: 'Con tartare di ombrina cruda e zest di limone', price: '€ 20' },
    ],
  },
  {
    id: 'paelle',
    title: 'Paelle per 2 persone',
    column: 2,
    dishes: [
      { name: 'Paella del pescatore', description: 'Gambero viola, scampi, cozze, seppia, peperoni e paprika dolce', price: '€ 70' },
      { name: 'Paella special', description: 'Componila con il pescato del giorno', price: '€ 150' },
    ],
  },
  {
    id: 'secondi',
    title: 'Secondi',
    column: 2,
    dishes: [
      { name: 'Frittura mista', description: "Calamari, gamberi, pesce di paranza — l'etto", price: '€ 10' },
      { name: 'Barbecue', description: "Seppia, ombrina, tonno, gamberoni — l'etto", price: '€ 10' },
      { name: 'Pescato del giorno', description: "Dentice, San Pietro, rana pescatrice, ombrina, spigole, orate e pezzogne — l'etto", price: '€ 15' },
      { name: 'Gratinati con provola', description: "Astici, aragoste, scampi, gamberi — l'etto", price: '€ 15' },
      { name: 'Tonno rosso del Mediterraneo', description: 'Novità', price: '€ 20' },
    ],
  },
  {
    id: 'degustazione',
    title: 'Degustazione della selezione',
    column: 2,
    dishes: [
      { name: 'Assaggio di tutte le portate', price: '€ 35' },
      { name: 'Sashimi di ombrina', price: '€ 16' },
      { name: 'Bresaola di tonno', price: '€ 13' },
      { name: 'Carpaccio di tonno', price: '€ 18' },
      { name: 'Salame di tonno', price: '€ 15' },
      { name: 'Sashimi di salmone', price: '€ 16' },
      { name: 'Cevice di ricciola', price: '€ 18' },
    ],
  },
  {
    id: 'dolci',
    title: 'Dolci',
    column: 2,
    dishes: [
      { name: 'Tagliata di stagione', description: "Noci, castagne, fico d'India, bananito", price: '€ 8' },
      { name: 'Fruttini ripieni di gelato', description: 'Con frutta esotica: melone, ananas, kiwi, mandarino, mango, passion fruit, fragole, dragon fruit', price: '€ 8' },
      { name: 'Bignè croccante', description: 'Con crema al latte e copertura al caramello salato', price: '€ 16' },
      { name: 'Mille foglie croccante', description: 'Con crema pasticciera e amarena', price: '€ 12' },
      { name: 'Cannolomisù', description: 'Con crema mascarpone e cacao', price: '€ 8' },
      { name: 'Gelato alla vaniglia', description: 'Con cioccolato', price: '€ 8' },
    ],
  },
  {
    id: 'premium',
    title: 'Premium',
    column: 2,
    dishes: [
      { name: 'Degustazione a mano libera', description: 'Percorso a sorpresa curato dallo chef, con selezione libera dei piatti in menù', price: '€ 50 / persona' },
    ],
  },
];

export const MENU_NOTE = "Se sei allergico o intollerante a una o più sostanze, informaci: ti indicheremo i piatti privi degli specifici allergeni. Tutte le portate del menù possono contenere prodotti surgelati, congelati o abbattuti; disponibilità soggetta al pescato giornaliero.";
