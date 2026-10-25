export type Locale = "en" | "xh" | "zu" | "af";

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "xh", label: "isiXhosa", native: "isiXhosa" },
  { code: "zu", label: "isiZulu", native: "isiZulu" },
  { code: "af", label: "Afrikaans", native: "Afrikaans" },
];

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
    },
    themba: {
      title: "Themba",
      subtitle: "Business Operations Assistant",
      intro:
        "I'm Themba. I can investigate your records, draft messages to suppliers, propose plans, and help you understand your business. Try one of the suggestions below, or ask anything.",
      suggestion: {
        supplier: "Draft a message to my supplier",
        stock: "Why is my stock short?",
        score: "How can I improve my readiness score?",
      },
      placeholder: "Ask Themba to investigate or do something…",
      proposeAction: "Proposed Action",
      approve: "Approve & Execute",
      executed: "Action Executed",
      declined: "Declined",
    },
    overview: {
      greeting: "Molo",
      salesLabel: "Total recorded sales",
      salesSub: "Range across all recorded months",
      stockLabel: "Stock gaps to review",
      stockSub: "{total} tracked · {variance} with variance",
      scoreLabel: "Consistency Score",
      actionCentre: "Action Centre",
      allCaughtUp: "You're all caught up.",
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
      save: "Gcina", cancel: "Rhoxisa", delete: "Cima", close: "Vala",
      confirm: "Qinisekisa", loading: "Kuyalayisha…",
      error: "Kukho into engahambanga kakuhle", retry: "Zama kwakhona",
    },
    themba: {
      title: "Themba",
      subtitle: "Umncedisi wokusebenza kwezoshishino",
      intro:
        "NdinguThemba. Ndingaphenya iirekhodi zakho, ndibhale imiyalezo kubathengisi, ndicebise izicwangciso, kwaye ndikuncede uqonde ishishini lakho.",
      suggestion: {
        supplier: "Bhala umyalezo kumthengisi wam",
        stock: "Kutheni isitokhwe sam sifutshane?",
        score: "Ndingasiphucula njani inqaku lam lokulungela?",
      },
      placeholder: "Buza uThemba ukuba aphenye okanye enze into…",
      proposeAction: "Isenzo esiphakanyisiweyo",
      approve: "Vuma & Phumeza",
      executed: "Isenzo siphunyeziwe",
      declined: "Kwaliwe",
    },
    overview: {
      greeting: "Molo",
      salesLabel: "Intengiso erekhodiweyo iyonke",
      salesSub: "Uluhlu kuzo zonke iinyanga ezirekhodiweyo",
      stockLabel: "Izithuba zesitokhwe ekufuneka zihlolwe",
      stockSub: "{total} zilandelwa · {variance} ezinomahluko",
      scoreLabel: "Inqaku Lokungaguquguquki",
      actionCentre: "Iziko Lwentshukumo",
      allCaughtUp: "Awukho umsebenzi osalayo.",
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
      save: "Gcina", cancel: "Khansela", delete: "Susa", close: "Vala",
      confirm: "Qinisekisa", loading: "Kuyalayisha…",
      error: "Kukhona okungahambanga kahle", retry: "Zama futhi",
    },
    themba: {
      title: "Themba",
      subtitle: "Umsizi wezokusebenza kwebhizinisi",
      intro:
        "NginguThemba. Ngingaphenya amarekhodi akho, ngibhale imilayezo kubabizi, ngiphakamise izinhlelo, futhi ngikusize uqonde ibhizinisi lakho.",
      suggestion: {
        supplier: "Bhala umlayezo kumhlinzeki wami",
        stock: "Kungani isitoko sami sishoda?",
        score: "Ngingasithuthukisa kanjani iphuzu lami lokulungela?",
      },
      placeholder: "Buza uThemba ukuthi aphenye noma enze okuthile…",
      proposeAction: "Isenzo esihlongozwayo",
      approve: "Vuma & Qhubeka",
      executed: "Isenzo senziwe",
      declined: "Kwenqatshiwe",
    },
    overview: {
      greeting: "Sawubona",
      salesLabel: "Ukuthengisa okurekhodiwe konke",
      salesSub: "Ibanga kuzo zonke izinyanga ezirekhodiwe",
      stockLabel: "Izikhala zesitoko okufanele zibuyekezwe",
      stockSub: "{total} zilandelwa · {variance} ezinomehluko",
      scoreLabel: "Iphuzu Lokungaguquguquki",
      actionCentre: "Isikhungo Sezenzo",
      allCaughtUp: "Awukho umsebenzi osele.",
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
      save: "Stoor", cancel: "Kanselleer", delete: "Verwyder", close: "Maak toe",
      confirm: "Bevestig", loading: "Laai tans…",
      error: "Iets het verkeerd gegaan", retry: "Probeer weer",
    },
    themba: {
      title: "Themba",
      subtitle: "Besigheidsbedryfsassistent",
      intro:
        "Ek is Themba. Ek kan jou rekords ondersoek, boodskappe aan verskaffers opstel, planne voorstel en jou help om jou besigheid te verstaan.",
      suggestion: {
        supplier: "Stel 'n boodskap aan my verskaffer op",
        stock: "Hoekom is my voorraad te min?",
        score: "Hoe kan ek my gereedheidstelling verbeter?",
      },
      placeholder: "Vra Themba om te ondersoek of iets te doen…",
      proposeAction: "Voorgestelde aksie",
      approve: "Keur goed & Voer uit",
      executed: "Aksie uitgevoer",
      declined: "Afgekeur",
    },
    overview: {
      greeting: "Hallo",
      salesLabel: "Totale aangetekende verkope",
      salesSub: "Reeks oor alle aangetekende maande",
      stockLabel: "Voorraadgapings om na te gaan",
      stockSub: "{total} dopgehou · {variance} met verskil",
      scoreLabel: "Konsekwentheidstelling",
      actionCentre: "Aksiesentrum",
      allCaughtUp: "Jy is op datum.",
    },
  },
} as const;

export function getTranslation(locale: Locale, path: string): string {
  const keys = path.split(".");
  const lookup = (dict: any): string | null => {
    let node: any = dict;
    for (const k of keys) {
      if (node?.[k] == null) return null;
      node = node[k];
    }
    return typeof node === "string" ? node : null;
  };

  return lookup(dictionary[locale]) ?? lookup(dictionary.en) ?? path;
}