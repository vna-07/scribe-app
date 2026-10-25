export type Locale = "en" | "xh" | "zu" | "af";

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "xh", label: "isiXhosa", native: "isiXhosa" },
  { code: "zu", label: "isiZulu", native: "isiZulu" },
  { code: "af", label: "Afrikaans", native: "Afrikaans" },
];

// ⚠️ TRANSLATIONS PENDING NATIVE REVIEW
// The following strings require sign-off by a native speaker before public launch.
// Currently marked: [REVIEW] = financial/legal/ambiguous term.
export const dictionary = {
  en: {
    nav: {
      overview: "Overview",
      records: "Records",
      stock: "Stock",
      suppliers: "Suppliers",
      intelligence: "Intelligence",
      growth: "Growth Studio",
      opportunities: "Launch Studio",
      reports: "Reports",
      settings: "Settings",
      trustCentre: "Trust Centre",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      close: "Close",
      confirm: "Confirm",
      loading: "Loading…",
      error: "Something went wrong",
      retry: "Retry",
      addRecord: "Add record",
      captureEntry: "Capture entry",
      recordSale: "Record sale",
      recordExpense: "Record expense",
    },
    overview: {
      greeting: "Molo",
      subtitle: "Here is where your business stands.",
      revenue: "Recorded sales",
      readiness: "[REVIEW] Documented readiness",
      variance: "Stock discrepancy",
      actionCentre: "Action Centre",
      allCaughtUp: "You're all caught up.",
    },
    themba: {
      title: "Themba",
      subtitle: "Business Operations Assistant",
      placeholder: "Ask Themba to investigate or do something…",
      proposeAction: "Proposed Action",
      approve: "Approve & Execute",
      executed: "Action Executed",
      declined: "Declined",
    },
    growth: {
      title: "Growth Studio",
      newGoal: "+ New Goal",
      clearCompleted: "Clear completed",
      deleteTask: "Delete task",
      noTasks: "No tasks yet. Ask Themba to create a plan.",
    },
    stock: {
      title: "Product Catalogue",
      addProduct: "+ Add Product",
      receive: "Receive",
      count: "Count",
    },
    aiSummary: {
      title: "Business summary",
      badge: "AI-generated · Themba",
      expand: "Show recent highlights and outlook →",
      collapse: "← Collapse",
    },
    settings: {
      title: "Settings",
      appearance: "Appearance",
      language: "Language",
      light: "Daylight",
      dark: "Night",
      sunlight: "Sunlight",
      system: "System",
    },
  },
  xh: {
    nav: {
      overview: "Umbono Jikelele",
      records: "Iirekhodi",
      stock: "Isitokhwe",
      suppliers: "Abathengisi",
      intelligence: "Ubuchule",
      growth: "Istudio Yokukhula",
      opportunities: "Istudio Yokumisa",
      reports: "Iingxelo",
      settings: "Izicwangciso",
      trustCentre: "Iziko Lokuthembela",
    },
    common: {
      save: "Gcina",
      cancel: "Rhoxisa",
      delete: "Cima",
      close: "Vala",
      confirm: "Qinisekisa",
      loading: "Kuyalayisha…",
      error: "Kukho into engahambanga kakuhle",
      retry: "Zama kwakhona",
      addRecord: "Yongeza irekhodi",
      captureEntry: "Faka irekhodi",
      recordSale: "Bhala intengiso",
      recordExpense: "[REVIEW] Bhala inkcitho",
    },
    overview: {
      greeting: "Molo",
      subtitle: "Nantsi indawo ibhinqa lakho.",
      revenue: "Intengiso erekhodiweyo",
      readiness: "[REVIEW] Ukulungela okubhaliweyo",
      variance: "Umahluko kwisitokhwe",
      actionCentre: "Iziko Lwentshukumo",
      allCaughtUp: "Awukho umsebenzi osalayo.",
    },
    themba: {
      title: "Themba",
      subtitle: "Umncedisi wokusebenza kwezoshishino",
      placeholder: "Buza uThemba ukuba aphenye okanye enze into…",
      proposeAction: "Isenzo esiphakanyisiweyo",
      approve: "Vuma & Phumeza",
      executed: "Isenzo siphunyeziwe",
      declined: "Kwaliwe",
    },
    growth: {
      title: "Istudio Yokukhula",
      newGoal: "+ Injongo Entsha",
      clearCompleted: "Cima ezigqityiweyo",
      deleteTask: "Cima umsebenzi",
      noTasks: "Akukho misebenzi. Buza uThemba ukuba enze isicwangciso.",
    },
    stock: {
      title: "Uluhlu lweemveliso",
      addProduct: "+ Yongeza imveliso",
      receive: "Yamkela",
      count: "Bala",
    },
    aiSummary: {
      title: "Isishwankathelo seshishini",
      badge: "Yenziwe nge-AI · Themba",
      expand: "Bonisa izinto ezintsha kunye nombono →",
      collapse: "← Vala",
    },
    settings: {
      title: "Izicwangciso",
      appearance: "Inkangeleko",
      language: "Ulwimi",
      light: "Ukukhanya",
      dark: "Ubusuku",
      sunlight: "Ilanga",
      system: "Inkqubo",
    },
  },
  zu: {
    nav: {
      overview: "Umbono Jikelele",
      records: "Amarekhodi",
      stock: "Isitoko",
      suppliers: "Abahlinzeki",
      intelligence: "Ubuchule",
      growth: "Isitudiyo Sokukhula",
      opportunities: "Isitudiyo Sokuqalisa",
      reports: "Imibiko",
      settings: "Izilungiselelo",
      trustCentre: "Isikhungo Sokwethemba",
    },
    common: {
      save: "Gcina",
      cancel: "Khansela",
      delete: "Susa",
      close: "Vala",
      confirm: "Qinisekisa",
      loading: "Kuyalayisha…",
      error: "Kukhona okungahambanga kahle",
      retry: "Zama futhi",
      addRecord: "Engeza irekhodi",
      captureEntry: "Faka irekhodi",
      recordSale: "Bhala ukuthengisa",
      recordExpense: "[REVIEW] Bhala izindleko",
    },
    overview: {
      greeting: "Sawubona",
      subtitle: "Nakhu lapho ibhizinisi lakho likhona.",
      revenue: "Ukuthengisa okurekhodiwe",
      readiness: "[REVIEW] Ukulungela okubhaliwe",
      variance: "Umehluko kwisitoko",
      actionCentre: "Isikhungo Sezenzo",
      allCaughtUp: "Awukho umsebenzi osele.",
    },
    themba: {
      title: "Themba",
      subtitle: "Umsizi wezokusebenza kwebhizinisi",
      placeholder: "Buza uThemba ukuthi aphenye noma enze okuthile…",
      proposeAction: "Isenzo esihlongozwayo",
      approve: "Vuma & Qhubeka",
      executed: "Isenzo senziwe",
      declined: "Kwenqatshiwe",
    },
    growth: {
      title: "Isitudiyo Sokukhula",
      newGoal: "+ Inhloso Entsha",
      clearCompleted: "Susa okuphelile",
      deleteTask: "Susa umsebenzi",
      noTasks: "Awekho imisebenzi. Buza uThemba ukuthi enze uhlelo.",
    },
    stock: {
      title: "Uhlu lwemikhiqizo",
      addProduct: "+ Engeza umkhiqizo",
      receive: "Yamukela",
      count: "Bala",
    },
    aiSummary: {
      title: "Isifinyezo sebhizinisi",
      badge: "Kwenziwe nge-AI · Themba",
      expand: "Khombisa okusha kanye nombono →",
      collapse: "← Vala",
    },
    settings: {
      title: "Izilungiselelo",
      appearance: "Ukubukeka",
      language: "Ulimi",
      light: "Ukukhanya",
      dark: "Ubusuku",
      sunlight: "Ilanga",
      system: "Uhlelo",
    },
  },
  af: {
    nav: {
      overview: "Oorsig",
      records: "Rekords",
      stock: "Voorraad",
      suppliers: "Verskaffers",
      intelligence: "Intelligensie",
      growth: "Groei Studio",
      opportunities: "Lanserings Studio",
      reports: "Verslae",
      settings: "Instellings",
      trustCentre: "Trust-sentrum",
    },
    common: {
      save: "Stoor",
      cancel: "Kanselleer",
      delete: "Verwyder",
      close: "Maak toe",
      confirm: "Bevestig",
      loading: "Laai tans…",
      error: "Iets het verkeerd gegaan",
      retry: "Probeer weer",
      addRecord: "Voeg rekord by",
      captureEntry: "Vasle rekord",
      recordSale: "Teken verkoop aan",
      recordExpense: "[REVIEW] Teken uitgawe aan",
    },
    overview: {
      greeting: "Hallo",
      subtitle: "Hier is waar jou besigheid staan.",
      revenue: "Aangetekende verkope",
      readiness: "[REVIEW] Gedokumenteerde gereedheid",
      variance: "Voorraadverskil",
      actionCentre: "Aksiesentrum",
      allCaughtUp: "Jy is op datum.",
    },
    themba: {
      title: "Themba",
      subtitle: "Besigheidsbedryfsassistent",
      placeholder: "Vra Themba om te ondersoek of iets te doen…",
      proposeAction: "Voorgestelde aksie",
      approve: "Keur goed & Voer uit",
      executed: "Aksie uitgevoer",
      declined: "Afgekeur",
    },
    growth: {
      title: "Groei Studio",
      newGoal: "+ Nuwe doelwit",
      clearCompleted: "Verwyder voltooides",
      deleteTask: "Verwyder taak",
      noTasks: "Nog geen take nie. Vra Themba om 'n plan te maak.",
    },
    stock: {
      title: "Produkkatalogus",
      addProduct: "+ Voeg produk by",
      receive: "Ontvang",
      count: "Tel",
    },
    aiSummary: {
      title: "Besigheidsopsomming",
      badge: "KI-gegenereer · Themba",
      expand: "Wys onlangse hoogtepunte en vooruitsig →",
      collapse: "← Vou in",
    },
    settings: {
      title: "Instellings",
      appearance: "Voorkoms",
      language: "Taal",
      light: "Daglig",
      dark: "Nag",
      sunlight: "Sonlig",
      system: "Stelsel",
    },
  },
} as const;

// Helper: dot-path string lookup with English fallback
export function getTranslation(locale: Locale, path: string): string {
  const keys = path.split(".");
  let node: any = dictionary[locale];
  for (const k of keys) {
    if (node?.[k] == null) break;
    node = node[k];
  }
  if (typeof node === "string") return node;

  // Fallback to English
  node = dictionary.en;
  for (const k of keys) {
    if (node?.[k] == null) return path;
    node = node[k];
  }
  return typeof node === "string" ? node : path;
}