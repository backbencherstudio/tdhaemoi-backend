import { baseUrl } from "../../../utils/base_utl";

// const exercisess = {
//   "Mobilität & Flexibilität": [
//     {
//       title: "Fußsohlenmassage mit einem Ball",
//       sub_title:
//         "Fördert die Durchblutung und löst Verspannungen in der Plantarfaszie",
//       duration: "1-2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/21.png",
//       instructions: [
//         "Nimm einen kleinen Ball (z. B. Tennisball, Faszienball oder Golfball).",
//         "Setze dich auf einen Stuhl oder stelle dich aufrecht hin.",
//         "Platziere den Ball unter deiner Fußsohle.",
//         "Rolle den Ball langsam von der Ferse bis zu den Zehen vor und zurück.",
//       ],
//     },
//     {
//       title: "Waden & Achillessehnen Dehnung",
//       sub_title:
//         "Verbessert die Beweglichkeit im Sprunggelenk und reduziert die Spannung im Fersenbereich",
//       duration: "1-2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/22.png",
//       instructions: [
//         "Stelle dich mit beiden Händen an eine Wand.",
//         "Mach mit einem Bein einen großen Schritt nach hinten und strecke dieses durch.",
//         "Halte das hintere Bein gestreckt und die Ferse am Boden.",
//         "Halte die Dehnung 15-30 Sekunden lang und wechsle dann das Bein.",
//       ],
//     },
//     {
//       title: "Großzehen-Stretch an der Wand",
//       duration: "1-2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/23.png",
//       sub_title:
//         "Erhöht die Flexibilität der Großzehe und unterstützt eine gesunde Abrollbewegung.",
//       instructions: [
//         "Stelle dich mit einem Fuß nahe an eine Wand, der andere steht hinter dir.",
//         "Lege die Großzehe des vorderen Fußes an die Wand, die Ferse bleibt am Boden.",
//         "Stabilisiere dich mit den Händen an der Wand.",
//         "Verlagere das Gewicht leicht nach vorne, um die Zehen zu dehnen.",
//         "Halte die Position für 30 Sekunden, dann wechsle die Seite.",
//       ],
//     },
//     {
//       title: "Fersensitz zur Fußsohlendehnung",
//       sub_title:
//         "Dehnt die Plantarfaszie und wirkt unterstützend bei Fersenschmerzen.",
//       duration: "1-2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/24.png",
//       instructions: [
//         "Knie dich auf den Boden und stelle deine Zehen auf.",
//         "Setze dich langsam auf deine Fersen, sodass die Fußsohlen gedehnt werden können.",
//         "Halte den Oberkörper aufrecht und entspanne die Schultern.",
//         "Atme ruhig und halte die Position für 1-2 Minuten.",
//       ],
//     },
//     {
//       title: "Zehen-Fächerübung",
//       sub_title:
//         "Verbessert die Beweglichkeit und Koordination der Zehenmuskulatur.",
//       duration: "1-2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/25.png",
//       instructions: [
//         "Setze dich bequem hin oder stehe aufrecht.",
//         "Spitze aktiv alle Zehen so weit wie möglich ab.",
//         "Halte die Position für 5 Sekunden und entspanne.",
//         "Wiederhole das Öffnen und Schließen der Zehen 10-15 Mal.",
//       ],
//     },

//     // Add other exercises for this category...
//   ],

//   "Stabilität & Balance": [
//     {
//       title: "Kurze Fuß-Übung (Short Foot Exercise)",
//       sub_title:
//         "Aktiviert die Fußmuskulatur und verbessert die Gewölbestabilität. Einbeinige Balance-Übung",
//       duration: "1-2 Minuten je Fuß",
//       image: baseUrl + "/assets/v2/exercise/31.png",
//       instructions: [
//         "Stelle deinen Fuß flach auf den Boden.",
//         "Ziehe den Vorfuß leicht Richtung Ferse, ohne die Zehen zu krallen.",
//         "Halte den Bogen des Fußes aktiv, spüre die Spannung im Fußgewölbe.",
//         "Halte für 5-10 Sekunden, dann entspanne und 10 Mal wiederholen.",
//       ],
//     },

//     {
//       title: "Einbeinig Balance Übung",
//       duration: "30-60 Sekunden pro Seite",
//       sub_title:
//         "Stärkt die Stabilität im Sprunggelenk und trainiert das Gleichgewicht",
//       image: baseUrl + "/assets/v2/exercise/32.png",
//       instructions: [
//         "Stelle dich auf ein Bein, das andere bleibt leicht angehoben.",
//         "Halte den Blick geradeaus und spanne deine Körpermitte an.",
//         "Halte die Balance ruhig und stabil.",
//         "Steigere den Effekt, indem du die Augen schließt oder auf instabile Untergründe gehst.",
//       ],
//     },
//     {
//       title: "Tandem-Stand (Fersen-Spitzen-Stand)",
//       duration: "Dauer: 30–60 Sekunden",
//       sub_title:
//         "Fördert die statische Balance und die Kontrolle über die Körperhaltung",
//       image: baseUrl + "/assets/v2/exercise/33.png",
//       instructions: [
//         "Stelle einen Fuß direkt vor den anderen, sodass die Ferse den Zehen des anderen Fußes berührt.",
//         "Halte die Arme locker neben dem Körper oder leicht zur Seite gestreckt.",
//         "Spanne deine Körpermitte an und halte den Blick geradeaus.",
//         "Halte die Position ruhig für 30–60 Sekunden, dann Seitenwechsel.",
//       ],
//     },
//     {
//       title: "Dynamischer Einbeinstand (Beinpendeln)",
//       duration: "1-2 Minuten pro Bein",
//       sub_title:
//         "Verbessert die Reaktionsfähigkeit und das Gleichgewicht im Alltag und Sport",
//       image: baseUrl + "/assets/v2/exercise/34.png",
//       instructions: [
//         "Stelle dich auf ein Bein, das andere schwingt frei nach vorne und hinten.",
//         "Halte den Oberkörper aufrecht und die Arme zur Seite zur Stabilisation.",
//         "Das Pendeln erfolgt locker aus der Hüfte, die Bewegung bleibt kontrolliert.",
//         "10-15 Wiederholungen, dann Bein wechseln.",
//       ],
//     },
//     {
//       title: "Zehenspitzenstand-Halten",
//       duration: "30 Sekunden – 1 Minute",
//       sub_title:
//         "Trainiert die Wadenmuskulatur und die Kontrolle über den Vorfuß",
//       image: baseUrl + "/assets/v2/exercise/35.png",
//       instructions: [
//         "Stelle dich aufrecht hin und gehe langsam auf die Zehenspitzen.",
//         "Halte die Fersen so weit wie möglich vom Boden entfernt.",
//         "Spanne Waden und Fußmuskulatur bewusst an.",
//         "Halte die Position stabil und ruhig.",
//         "Optional: mit geschlossenen Augen oder auf instabilem Untergrund steigern.",
//       ],
//     },
//   ],

//   "Muskelkräftigung & Kontrolle": [
//     {
//       title: "Wadenheben mit kontrolliertem Absenken",
//       sub_title:
//         "Kräftigt gezielt die Wadenmuskulatur und stabilisiert das Sprunggelenk",
//       duration: "1-2 Minuten, ca. 10-15 Wiederholungen",
//       image: baseUrl + "/assets/v2/exercise/41.png",
//       instructions: [
//         "Stelle dich mit den Fußballen auf eine kleine Stufe, Fersen hängen frei.",
//         "Hebe dich langsam auf die Zehenspitzen.",
//         "Senke die Fersen langsam und kontrolliert wieder nach unten.",
//         "Wiederhole die Bewegung gleichmäßig ohne Schwung.",
//       ],
//     },

//     {
//       title:
//         "Theraband-Übung für Fußmuskulatur (Außen- & Innenmuskeln aktivieren)",
//       sub_title:
//         "Aktiviert die äußere und innere Fußmuskulatur und verbessert die Fußkontrolle",
//       duration: "1–2 Minuten pro Richtung",
//       image: baseUrl + "/assets/v2/exercise/42.png",
//       instructions: [
//         "Setze dich auf den Boden mit gestrecktem Bein.",
//         "Lege ein Theraband um den Vorfuß und ziehe es mit der Hand oder am fixierten Punkt.",
//         "Drücke den Fuß gegen den Widerstand nach außen oder innen.",
//         "Halte kurz die Endposition und kehre langsam zurück.",
//       ],
//     },
//     {
//       title: "Tuchgreif-Übung (Kräftigung der Zehenmuskulatur)",
//       sub_title:
//         "Trainiert gezielt die Zehenmuskulatur und verbessert die Greiffunktion",
//       duration: "1–2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/43.png",
//       instructions: [
//         "Lege ein Handtuch flach auf den Boden.",
//         "Stelle den Fuß mit den Zehen auf das Tuch.",
//         "Krall die Zehen und ziehe das Tuch Stück für Stück zu dir heran.",
//         "Wiederhole bis das gesamte Tuch eingezogen ist.",
//       ],
//     },
//     {
//       title: "Zehen-Yoga (Koordination & Fußkontrolle verbessern)",
//       sub_title:
//         "Fördert die Koordination und die bewusste Steuerung der Zehen",
//       duration: "1–2 Minuten",
//       image: baseUrl + "/assets/v2/exercise/44.png",
//       instructions: [
//         "Setze dich oder stelle dich bequem hin.",
//         "Spreize aktiv alle Zehen weit auseinander.",
//         "Hebe abwechselnd nur die großen Zehen, dann nur die kleinen Zehen.",
//         "Versuche bewusst jede Zehe einzeln zu bewegen – langsam und kontrolliert.",
//         "Fördert die Kontrolle über die Fußmuskulatur und verbessert die Koordination.",
//       ],
//     },
//     {
//       title: "Fußkanten-Krafttraining (Supination & Pronation stärken)",
//       sub_title:
//         "Stärkt gezielt die Muskulatur zur Kontrolle von Supination und Pronation",
//       duration: "1–2 Minuten pro Seite",
//       image: baseUrl + "/assets/v2/exercise/45.png",
//       instructions: [
//         "Stelle dich hüftbreit hin. Verlage das Gewicht kontrolliert auf die Außenkante (Supination), dann auf die Innenkante (Pronation) des Fußes.",
//         "Achte auf eine gleichmäßige Bewegung, ohne die Balance zu verlieren.",
//         "Wiederhole die Bewegung langsam 10–15 Mal.",
//         "Stärkt gezielt die stabilisierende Muskulatur an Fußaußen- und -innenseite.",
//       ],
//     },
//   ],
// };

const exercises = [
  {
    id: 21,
    title: "Fußsohlenmassage mit einem Ball",
    sub_title:
      "Fördert die Durchblutung und löst Verspannungen in der Plantarfaszie",
    duration: "1-2 Minuten",
    image: baseUrl + "/assets/v2/exercise/21.png",
    instructions: [
      "Nimm einen kleinen Ball (z. B. Tennisball, Faszienball oder Golfball).",
      "Setze dich auf einen Stuhl oder stelle dich aufrecht hin.",
      "Platziere den Ball unter deiner Fußsohle.",
      "Rolle den Ball langsam von der Ferse bis zu den Zehen vor und zurück.",
    ],
    category: "Mobilität & Flexibilität",
  },
  {
    id: 22,
    title: "Waden & Achillessehnen Dehnung",
    sub_title:
      "Verbessert die Beweglichkeit im Sprunggelenk und reduziert die Spannung im Fersenbereich",
    duration: "1-2 Minuten",
    image: baseUrl + "/assets/v2/exercise/22.png",
    instructions: [
      "Stelle dich mit beiden Händen an eine Wand.",
      "Mach mit einem Bein einen großen Schritt nach hinten und strecke dieses durch.",
      "Halte das hintere Bein gestreckt und die Ferse am Boden.",
      "Halte die Dehnung 15-30 Sekunden lang und wechsle dann das Bein.",
    ],
    category: "Mobilität & Flexibilität",
  },
  {
    id: 23,
    title: "Großzehen-Stretch an der Wand",
    duration: "1-2 Minuten",
    image: baseUrl + "/assets/v2/exercise/23.png",
    sub_title:
      "Erhöht die Flexibilität der Großzehe und unterstützt eine gesunde Abrollbewegung.",
    instructions: [
      "Stelle dich mit einem Fuß nahe an eine Wand, der andere steht hinter dir.",
      "Lege die Großzehe des vorderen Fußes an die Wand, die Ferse bleibt am Boden.",
      "Stabilisiere dich mit den Händen an der Wand.",
      "Verlagere das Gewicht leicht nach vorne, um die Zehen zu dehnen.",
      "Halte die Position für 30 Sekunden, dann wechsle die Seite.",
    ],
    category: "Mobilität & Flexibilität",
  },
  {
    id: 24,
    title: "Fersensitz zur Fußsohlendehnung",
    sub_title:
      "Dehnt die Plantarfaszie und wirkt unterstützend bei Fersenschmerzen.",
    duration: "1-2 Minuten",
    image: baseUrl + "/assets/v2/exercise/24.png",
    instructions: [
      "Knie dich auf den Boden und stelle deine Zehen auf.",
      "Setze dich langsam auf deine Fersen, sodass die Fußsohlen gedehnt werden können.",
      "Halte den Oberkörper aufrecht und entspanne die Schultern.",
      "Atme ruhig und halte die Position für 1-2 Minuten.",
    ],
    category: "Mobilität & Flexibilität",
  },
  {
    id: 25,
    title: "Zehen-Fächerübung",
    sub_title:
      "Verbessert die Beweglichkeit und Koordination der Zehenmuskulatur.",
    duration: "1-2 Minuten",
    image: baseUrl + "/assets/v2/exercise/25.png",
    instructions: [
      "Setze dich bequem hin oder stehe aufrecht.",
      "Spitze aktiv alle Zehen so weit wie möglich ab.",
      "Halte die Position für 5 Sekunden und entspanne.",
      "Wiederhole das Öffnen und Schließen der Zehen 10-15 Mal.",
    ],
    category: "Mobilität & Flexibilität",
  },

  {
    id: 31,
    title: "Kurze Fuß-Übung (Short Foot Exercise)",
    sub_title:
      "Aktiviert die Fußmuskulatur und verbessert die Gewölbestabilität. Einbeinige Balance-Übung",
    duration: "1-2 Minuten je Fuß",
    image: baseUrl + "/assets/v2/exercise/31.png",
    instructions: [
      "Stelle deinen Fuß flach auf den Boden.",
      "Ziehe den Vorfuß leicht Richtung Ferse, ohne die Zehen zu krallen.",
      "Halte den Bogen des Fußes aktiv, spüre die Spannung im Fußgewölbe.",
      "Halte für 5-10 Sekunden, dann entspanne und 10 Mal wiederholen.",
    ],
    category: "Stabilität & Balance",
  },
  {
    id: 32,
    title: "Einbeinig Balance Übung",
    duration: "30-60 Sekunden pro Seite",
    sub_title:
      "Stärkt die Stabilität im Sprunggelenk und trainiert das Gleichgewicht",
    image: baseUrl + "/assets/v2/exercise/32.png",
    instructions: [
      "Stelle dich auf ein Bein, das andere bleibt leicht angehoben.",
      "Halte den Blick geradeaus und spanne deine Körpermitte an.",
      "Halte die Balance ruhig und stabil.",
      "Steigere den Effekt, indem du die Augen schließt oder auf instabile Untergründe gehst.",
    ],
    category: "Stabilität & Balance",
  },
  {
    id: 33,
    title: "Tandem-Stand (Fersen-Spitzen-Stand)",
    duration: "Dauer: 30–60 Sekunden",
    sub_title:
      "Fördert die statische Balance und die Kontrolle über die Körperhaltung",
    image: baseUrl + "/assets/v2/exercise/33.png",
    instructions: [
      "Stelle einen Fuß direkt vor den anderen, sodass die Ferse den Zehen des anderen Fußes berührt.",
      "Halte die Arme locker neben dem Körper oder leicht zur Seite gestreckt.",
      "Spanne deine Körpermitte an und halte den Blick geradeaus.",
      "Halte die Position ruhig für 30–60 Sekunden, dann Seitenwechsel.",
    ],
    category: "Stabilität & Balance",
  },
  {
    id: 34,
    title: "Dynamischer Einbeinstand (Beinpendeln)",
    duration: "1-2 Minuten pro Bein",
    sub_title:
      "Verbessert die Reaktionsfähigkeit und das Gleichgewicht im Alltag und Sport",
    image: baseUrl + "/assets/v2/exercise/34.png",
    instructions: [
      "Stelle dich auf ein Bein, das andere schwingt frei nach vorne und hinten.",
      "Halte den Oberkörper aufrecht und die Arme zur Seite zur Stabilisation.",
      "Das Pendeln erfolgt locker aus der Hüfte, die Bewegung bleibt kontrolliert.",
      "10-15 Wiederholungen, dann Bein wechseln.",
    ],
    category: "Stabilität & Balance",
  },

  {
    id: 35,
    title: "Zehenspitzenstand-Halten",
    duration: "30 Sekunden – 1 Minute",
    sub_title:
      "Trainiert die Wadenmuskulatur und die Kontrolle über den Vorfuß",
    image: baseUrl + "/assets/v2/exercise/35.png",
    instructions: [
      "Stelle dich aufrecht hin und gehe langsam auf die Zehenspitzen.",
      "Halte die Fersen so weit wie möglich vom Boden entfernt.",
      "Spanne Waden und Fußmuskulatur bewusst an.",
      "Halte die Position stabil und ruhig.",
      "Optional: mit geschlossenen Augen oder auf instabilem Untergrund steigern.",
    ],
    category: "Stabilität & Balance",
  },

  {
    id: 41,
    title: "Wadenheben mit kontrolliertem Absenken",
    sub_title:
      "Kräftigt gezielt die Wadenmuskulatur und stabilisiert das Sprunggelenk",
    duration: "1-2 Minuten, ca. 10-15 Wiederholungen",
    image: baseUrl + "/assets/v2/exercise/41.png",
    instructions: [
      "Stelle dich mit den Fußballen auf eine kleine Stufe, Fersen hängen frei.",
      "Hebe dich langsam auf die Zehenspitzen.",
      "Senke die Fersen langsam und kontrolliert wieder nach unten.",
      "Wiederhole die Bewegung gleichmäßig ohne Schwung.",
    ],
    category: "Muskelkräftigung & Kontrolle",
  },
  {
    id: 42,
    title:
      "Theraband-Übung für Fußmuskulatur (Außen- & Innenmuskeln aktivieren)",
    sub_title:
      "Aktiviert die äußere und innere Fußmuskulatur und verbessert die Fußkontrolle",
    duration: "1–2 Minuten pro Richtung",
    image: baseUrl + "/assets/v2/exercise/42.png",
    instructions: [
      "Setze dich auf den Boden mit gestrecktem Bein.",
      "Lege ein Theraband um den Vorfuß und ziehe es mit der Hand oder am fixierten Punkt.",
      "Drücke den Fuß gegen den Widerstand nach außen oder innen.",
      "Halte kurz die Endposition und kehre langsam zurück.",
    ],
    category: "Muskelkräftigung & Kontrolle",
  },
  {
    id: 43,
    title: "Tuchgreif-Übung (Kräftigung der Zehenmuskulatur)",
    sub_title:
      "Trainiert gezielt die Zehenmuskulatur und verbessert die Greiffunktion",
    duration: "1–2 Minuten",
    image: baseUrl + "/assets/v2/exercise/43.png",
    instructions: [
      "Lege ein Handtuch flach auf den Boden.",
      "Stelle den Fuß mit den Zehen auf das Tuch.",
      "Krall die Zehen und ziehe das Tuch Stück für Stück zu dir heran.",
      "Wiederhole bis das gesamte Tuch eingezogen ist.",
    ],
    category: "Muskelkräftigung & Kontrolle",
  },
  {
    id: 44,
    title: "Zehen-Yoga (Koordination & Fußkontrolle verbessern)",
    sub_title: "Fördert die Koordination und die bewusste Steuerung der Zehen",
    duration: "1–2 Minuten",
    image: baseUrl + "/assets/v2/exercise/44.png",
    instructions: [
      "Setze dich oder stelle dich bequem hin.",
      "Spreize aktiv alle Zehen weit auseinander.",
      "Hebe abwechselnd nur die großen Zehen, dann nur die kleinen Zehen.",
      "Versuche bewusst jede Zehe einzeln zu bewegen – langsam und kontrolliert.",
      "Fördert die Kontrolle über die Fußmuskulatur und verbessert die Koordination.",
    ],
    category: "Muskelkräftigung & Kontrolle",
  },
  {
    id: 45,
    title: "Fußkanten-Krafttraining (Supination & Pronation stärken)",
    sub_title:
      "Stärkt gezielt die Muskulatur zur Kontrolle von Supination und Pronation",
    duration: "1–2 Minuten pro Seite",
    image: baseUrl + "/assets/v2/exercise/45.png",
    instructions: [
      "Stelle dich hüftbreit hin. Verlage das Gewicht kontrolliert auf die Außenkante (Supination), dann auf die Innenkante (Pronation) des Fußes.",
      "Achte auf eine gleichmäßige Bewegung, ohne die Balance zu verlieren.",
      "Wiederhole die Bewegung langsam 10–15 Mal.",
      "Stärkt gezielt die stabilisierende Muskulatur an Fußaußen- und -innenseite.",
    ],
    category: "Muskelkräftigung & Kontrolle",
  },
];

export default exercises;
