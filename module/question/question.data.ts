export const questionnaireData = [
    {
        "id": 1,
        "title": "Alltagsschuhe",
        "image": "/category/category2.png",
        "questions": [
            {
                "id": 1,
                "question": "Welche Alltagsschuhe suchen sie?",
                "options": [
                    {
                        "id": 1,
                        "option": "Sneaker"
                    },
                    {
                        "id": 2,
                        "option": "Anzugsschuhe "
                    },
                    {
                        "id": 3,
                        "option": "Sportschuhe"
                    },
                    {
                        "id": 4,
                        "option": "Sandalen"
                    },
                    {
                        "id": 5,
                        "option": "Arbeitsschuhe"
                    },
                    {
                        "id": 6,
                        "option": "Bequemschuhe"
                    }
                ]
            },
            {
                "id": 2,
                "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                "options": [
                    {
                        "id": 1,
                        "option": "Die perfekt empfohlene Passform basierend auf meinem 3D-Scan"
                    },
                    {
                        "id": 2,
                        "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                    },
                    {
                        "id": 3,
                        "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                    }
                ]
            },
            {
                "id": 3,
                "question": "Sind Sie im Besitz einer Orthopädischen Einlage?",
                "options": [
                    {
                        "id": 1,
                        "option": "Ja"
                    },
                    {
                        "id": 2,
                        "option": "Nein"
                    },
                    {
                        "id": 3,
                        "option": "In Planung"
                    }
                ]
            }
        ]
    },
    {
        "id": 2,
        "title": "Sportschuhe",
        "slug": "sportschuhe",
        "image": "/category/category1.png",
        "data": [
            {
                "id": 1,
                "title": "Alpines Skifahren",
                "slug": "alpines-skifahren",
                "image": "/categoryData/img01.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Sind Sie Anfänger, Fortgeschrittener oder Experte?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Anfänger"
                            },
                            {
                                "id": 2,
                                "option": "Fortgeschrittener "
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Was suchen Sie?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Nur Skischuhe",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Nur Skischuhe",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Möchten Sie ein Modell aus einer bestimmten Preisklasse?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Budget (günstig & funktional)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittelklasse (ausgewogene Performance & Komfort)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Premium (höchste Qualität & Technologie)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Wie eng soll der Skischuh sitzen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Komfortabel (mehr Bewegungsfreiheit, wärmer)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eng anliegend (bessere Kontrolle, aber weniger bequem)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Sehr eng (maximale Performance für Rennfahrer)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Welchen Flex bevorzugen Sie?  ",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Weich (Flex 60–90, komfortabel für Einsteiger)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittel (Flex 90–110, ausgewogene Kontrolle)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Hart (Flex 120+, maximale Präzision für Profis)"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 2,
                                "option": "Nur Ski",
                                "nextQuestions": {
                                    "id": 2,
                                    "title": "Nur Ski",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Welche Art von Ski benötigen Sie?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Rennski"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Freeride-Ski"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Freestyle-Ski"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Wie lang sollten Ihre Ski sein?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Kurze Ski – Leicht zu steuern, ideal für Anfänger und enge Slalom-Schwünge"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittellange Ski – Gute Balance zwischen Kontrolle und Geschwindigkeit"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Lange Ski – Mehr Stabilität bei hoher Geschwindigkeit, für erfahrene Skifahrer"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 3,
                                "option": "Komplettes Set (Ski & Skischuhe )",
                                "nextQuestions": {
                                    "id": 3,
                                    "title": "Komplettes Set (Ski & Skischuhe )",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Möchten Sie ein Modell aus einer bestimmten Preisklasse?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Budget (günstig & funktional)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittelklasse (ausgewogene Performance & Komfort)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Premium (höchste Qualität & Technologie)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Wie eng soll der Skischuh sitzen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Komfortabel (mehr Bewegungsfreiheit, wärmer)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eng anliegend (bessere Kontrolle, aber weniger bequem)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Sehr eng (maximale Performance für Rennfahrer)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Welchen Flex bevorzugen Sie?  ",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Weich (Flex 60–90, komfortabel für Einsteiger)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittel (Flex 90–110, ausgewogene Kontrolle)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Hart (Flex 120+, maximale Präzision für Profis)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Welche Art von Ski benötigen Sie?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Rennski"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Freeride-Ski"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Freestyle-Ski"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 7,
                                            "question": "Wie lang sollten Ihre Ski sein?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Kurze Ski – Leicht zu steuern, ideal für Anfänger und enge Slalom-Schwünge"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittellange Ski – Gute Balance zwischen Kontrolle und Geschwindigkeit"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Lange Ski – Mehr Stabilität bei hoher Geschwindigkeit, für erfahrene Skifahrer"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "id": 2,
                "title": "Laufschuhe",
                "slug": "laufschuhe",
                "image": "/categoryData/img02.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Für welchen Zweck suchen Sie die Laufschuhe?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Allrounder",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Allrounder",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Allround - Laufschuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Laufschuh-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Kennen Sie Ihren Fußtyp oder Ihre Pronation?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Analyse basierend auf meinem 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Neutralfuß"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Überpronation (starker Einknick nach innen)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Hatten Sie schon einmal Probleme oder Schmerzen beim Laufen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Nein"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Ja, Knieprobleme"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Ja, Wadenprobleme "
                                                },
                                                {
                                                    "id": 4,
                                                    "option": "Ja, Shin Splints (Schienbeinschmerzen)"
                                                },
                                                {
                                                    "id": 5,
                                                    "option": "Ja, Plantarfasziitis (Fersenschmerzen)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Welche Rolle spielt Dämpfung im Verhältnis zu Stabilität?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Maximale Dämpfung – Fokus auf Komfort und Gelenkschonung"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Ausgewogen – Gutes Verhältnis von Dämpfung und Stabilität"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Mehr Stabilität – Fokus auf Kontrolle und Führung"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 2,
                                "option": "Trailrunning (Gelände)",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Trailrunning (Gelände)",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Trailrunning - Schuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Trailrunning-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Soll dein Schuh wasserdicht sein (Gore-Tex-Membran)?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Ja, wasserdicht und atmungsaktiv (Gore-Tex oder ähnliche Membran)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Nein, leichter und besser belüftet"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Wo wirst du deine Trailrunning-Schuhe hauptsächlich nutzen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Nur auf Trails & im Gelände"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mischung aus Trail & Straße (Hybrid-Nutzung)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Welche Schafthöhe soll dein Schuh haben?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Niedrig (unter dem Knöchel)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Mittel/Hoch (knöchelhoch oder darüber)"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 3,
                                "option": "Lange Distanzen/Dauerläufe",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Lange Distanzen/Dauerläufe",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Dauer - Laufschuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Laufschuh-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Auf welchem Untergrund wirst du hauptsächlich laufen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Asphalt/Straße – Für regelmäßige, feste Oberflächen "
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Wald-/Feldwege – Für weiche, unebene Pfade"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Gemischt – Für eine Kombination beider Oberflächen"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Hatten Sie schon einmal Probleme oder Schmerzen beim Laufen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Nein"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Ja, Knieprobleme"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Ja, Wadenproblem"
                                                },
                                                {
                                                    "id": 4,
                                                    "option": "Ja, Shin Splints (Schienbeinschmerzen)"
                                                },
                                                {
                                                    "id": 5,
                                                    "option": "Ja, Plantarfasziitis (Fersenschmerzen)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Kennen Sie Ihren Fußtyp oder Ihre Pronation?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Analyse basierend auf meinem 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Neutralfuß"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Überpronation (starker Einknick nach innen)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 5,
                                            "question": "Welche Rolle spielt Dämpfung im Verhältnis zu Stabilität?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Maximale Dämpfung – Fokus auf Komfort und Gelenkschonung"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Ausgewogen – Gutes Verhältnis von Dämpfung und Stabilität"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Mehr Stabilität – Fokus auf Kontrolle und Führung"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 4,
                                "option": "Wettkampf/Marathon",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Wettkampf/Marathon",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Wettkampf - Schuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Wettkampf-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Welche Art von Wettkampfschuhen suchst du?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Wettkampfschuhe mit Carbon"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Wettkampfschuhe ohne Carbon"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Für welche Distanz suchst du Wettkampf-Schuhe?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Kurzstrecke (5 km – 10 km)"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Halbmarathon (21,1 km)"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Marathon (42,2 km & mehr)"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 4,
                                            "question": "Welche Sprengung bevorzugst du?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "6–10 mm – Bewährte Wahl, unterstützt das Abrollen."
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "≤ 5 mm – Direkter Abdruck, erfordert trainierte Technik."
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 5,
                                "option": "Intervallläufe/Laufbahn",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Intervallläufe/Laufbahn",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Intervall - Laufschuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Intervall-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Auf welchem Untergrund läufst du deine Intervalltrainings?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Laufbahn (Spikes)",
                                                    "nextQuestions": {
                                                        "id": 1,
                                                        "title": "Laufbahn (Spikes)",
                                                        "questions": [
                                                            {
                                                                "id": 1,
                                                                "question": "Welche Distanz läufst du bei deinen Intervalltrainings?",
                                                                "options": [
                                                                    {
                                                                        "id": 1,
                                                                        "option": "Kurzstrecke (100–400 m)"
                                                                    },
                                                                    {
                                                                        "id": 2,
                                                                        "option": "Mittel- & Langstrecke (800 m – 10.000 m)"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Asphalt/Laufbahn (ohne Spikes)"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 6,
                                "option": "Walkingschuhe",
                                "nextQuestions": {
                                    "id": 1,
                                    "title": "Walkingschuhe",
                                    "questions": [
                                        {
                                            "id": 1,
                                            "question": "Wie bevorzugen Sie Ihre Walking - Laufschuhe zu tragen?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Die perfekte Laufschuh-passform basierend auf  meinen 3D-Scan"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                                                },
                                                {
                                                    "id": 3,
                                                    "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 2,
                                            "question": "Auf welchem Untergrund wirst du hauptsächlich unterwegs sein?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Harter Untergrund – Asphalt, Pflastersteine, Gehwege"
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Gemischtes Terrain – Abwechslung aus Natur- und Stadtwegen"
                                                }
                                            ]
                                        },
                                        {
                                            "id": 3,
                                            "question": "Bevorzugen Sie eine höhere Sohle oder eine normale bis mittlere Sohlenhöhe?",
                                            "options": [
                                                {
                                                    "id": 1,
                                                    "option": "Höhere Sohle – Fokus auf Komfort "
                                                },
                                                {
                                                    "id": 2,
                                                    "option": "Normale bis mittlere Sohle – Fokus auf nätürliches Abrollverhalten"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "id": 3,
                "title": "Radschuhe",
                "slug": "radschuhe",
                "image": "/categoryData/img03.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Welche Passform bevorzugst du?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Enge, sportliche Passform (maximale Kraftübertragung)"
                            },
                            {
                                "id": 2,
                                "option": "Ausgewogene Passform (Kombination aus Performance und Komfort)"
                            },
                            {
                                "id": 3,
                                "option": "Bequeme Passform (mehr Platz und Komfort für lange Fahrten)"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Welche Art von Radsport betreibst du?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Rennrad"
                            },
                            {
                                "id": 2,
                                "option": "Mountainbike"
                            },
                            {
                                "id": 3,
                                "option": "Gravel"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Welche Art von Pedalen benutzt du?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Klickpedale"
                            },
                            {
                                "id": 2,
                                "option": "Plattformpedale"
                            },
                            {
                                "id": 3,
                                "option": "Hybridpedale"
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "question": "Welcher Steifigkeitsindex passt zu dir?",
                        "options": [
                            {
                                "id": 1,
                                "option": "5–7 – Mehr Flexibilität und Komfort, ideal für lange Touren & Gehen."
                            },
                            {
                                "id": 2,
                                "option": "8–10 – Perfekte Balance zwischen Komfort & Effizienz für Training & Rennen."
                            },
                            {
                                "id": 3,
                                "option": "11–15 – Maximale Kraftübertragung für Wettkämpfe & explosive Sprints."
                            }
                        ]
                    },
                    {
                        "id": 5,
                        "question": "Möchtest du mit einer individuell angepassten Winsole deine Performance auf das nächste Level heben?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Ja, für optimale Kraftübertragung und Bestleistung"
                            },
                            {
                                "id": 2,
                                "option": "Nein "
                            }
                        ]
                    }
                ]
            },
            {
                "id": 4,
                "title": "Tennisschuhe",
                "slug": "tennisschuhe",
                "image": "/categoryData/img04.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Die perfekte Tennisschuh-passform basierend auf  meinen 3D-Scan"
                            },
                            {
                                "id": 2,
                                "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                            },
                            {
                                "id": 3,
                                "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Auf welchem Belag spielen Sie hauptsächlich?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Sandplatz/Claycourt "
                            },
                            {
                                "id": 2,
                                "option": "Hartplatz/Allcourt  "
                            },
                            {
                                "id": 3,
                                "option": "Rasenplatz"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Ist dir Performance oder Langlebigkeit wichtiger?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Maximale Performance  (Leichter, agiler Schuh für schnelle Bewegungen)"
                            },
                            {
                                "id": 2,
                                "option": "Langlebigkeit & Strapazierfähigkeit (Robustere Materialien für längere Haltbarkeit) "
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "question": "Bewegst du dich mehr seitlich oder sprintest oft vor und zurück?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Seitlich – Häufige Seitwärtsbewegungen"
                            },
                            {
                                "id": 2,
                                "option": "Vor & zurück – Viele schnelle Sprints"
                            },
                            {
                                "id": 3,
                                "option": "Beides – Ein guter Mix aus beiden"
                            }
                        ]
                    }
                ]
            },
            {
                "id": 5,
                "title": "Basketball",
                "slug": "basketball",
                "image": "/categoryData/img05.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Die perfekte Baskettball-schuhpassform basierend auf  meinen 3D-Scan"
                            },
                            {
                                "id": 2,
                                "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                            },
                            {
                                "id": 3,
                                "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Traktion & Grip – Wie ist der Untergrund?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Indoor-Halle"
                            },
                            {
                                "id": 2,
                                "option": "Outdoor"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Brauchst du mehr Knöchelschutz oder mehr Bewegungsfreiheit?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Viel Schutz (High-Tops)"
                            },
                            {
                                "id": 2,
                                "option": "Balance (Mid-Tops)"
                            },
                            {
                                "id": 3,
                                "option": "Bewegungsfreiheit (Low-Tops)"
                            }
                        ]
                    }
                ]
            },
            {
                "id": 6,
                "title": "Kletterschuhe",
                "slug": "kletterschuhe",
                "image": "/categoryData/img06.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Die empfohlene Kletterschuh-passform basierend auf  meinen 3D-Scan"
                            },
                            {
                                "id": 2,
                                "option": "Eher enger, für reduzierten Komfort und maximaler Performance"
                            },
                            {
                                "id": 3,
                                "option": "Eher weiter, für mehr Bewegungsfreiheit und höheren Tragekomfort"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Wofür brauchst du die Kletterschuhe?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Mehrseillängen / Alpinklettern"
                            },
                            {
                                "id": 2,
                                "option": "Bouldern"
                            },
                            {
                                "id": 3,
                                "option": "Sportklettern"
                            },
                            {
                                "id": 4,
                                "option": "Rissklettern"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Welche Fußform hast du?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Ägyptisch"
                            },
                            {
                                "id": 2,
                                "option": "Römisch"
                            },
                            {
                                "id": 3,
                                "option": "Griechisch"
                            },
                            {
                                "id": 4,
                                "option": "Automatische Analyse laut Scan"
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "question": "Was ist dir bei der Sohle deines Kletterschuhs am wichtigsten?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Maximales Gefühl und Präzision"
                            },
                            {
                                "id": 2,
                                "option": "Unterstützung und Komfort"
                            },
                            {
                                "id": 3,
                                "option": "Langlebigkeit und Robustheit"
                            },
                            {
                                "id": 4,
                                "option": "Balance aus Haltbarkeit und Performance"
                            }
                        ]
                    },
                    {
                        "id": 5,
                        "question": "Welche Form bevorzugen Sie?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Neutral – Komfortabel für lange Touren & Anfänger"
                            },
                            {
                                "id": 2,
                                "option": "Moderate Krümmung – Gute Balance aus Komfort & Präzision"
                            },
                            {
                                "id": 3,
                                "option": "Stark gekrümmt (Aggressiv) – Maximale Präzision für steile & schwierige Routen"
                            }
                        ]
                    }
                ]
            },
            {
                "id": 7,
                "title": "Fussballschuhe",
                "slug": "fussballschuhe",
                "image": "/categoryData/img07.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Die perfekte Fussballschuh-passform basierend auf  meinen 3D-Scan"
                            },
                            {
                                "id": 2,
                                "option": "Eher weiter, da ich mehr Becwegungsfreiheit bevorzuge"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Auf welchem Untergrund spielst du hauptsächlich?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Naturrasen (FG)"
                            },
                            {
                                "id": 2,
                                "option": "Kunstrasen (AG)"
                            },
                            {
                                "id": 3,
                                "option": "Halle (IC)"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Was ist Ihnen wichtiger – Geschwindigkeit oder Stabilität?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Geschwindigkeit – Leichter Schuh für schnelle Antritte & Richtungswechsel."
                            },
                            {
                                "id": 2,
                                "option": "Stabilität - Fester Sitz & Optimal für harte Zweikämpfe"
                            },
                            {
                                "id": 3,
                                "option": "Vielseitigkeit – Balance aus Speed & Halt für flexible Spielstile."
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "question": "Welche Preisklasse bevorzugst du für deine Fußballschuhe?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Einsteiger-Modelle (€50 – €100)"
                            },
                            {
                                "id": 2,
                                "option": "Mittelklasse-Modelle (€100 – €200)"
                            },
                            {
                                "id": 3,
                                "option": "Premium-Modelle (über €200)"
                            }
                        ]
                    }
                ]
            },
            {
                "id": 8,
                "title": "Schlittschuhe (Coming soon)",
                "slug": "schlittschuhe",
                "image": "/categoryData/img08.png",
                "questions": []
            },
            {
                "id": 9,
                "title": "Golfschuhe",
                "slug": "golfschuhe",
                "image": "/categoryData/img09.png",
                "questions": [
                    {
                        "id": 1,
                        "question": "Wie bevorzugen Sie Ihre Schuhe zu tragen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Die perfekt empfohlene Golfschuh-passform basierend auf meinem 3D-Scan"
                            },
                            {
                                "id": 2,
                                "option": "Eher enger, da ich meine Schuhe gern fest am Fuß trage"
                            },
                            {
                                "id": 3,
                                "option": "Eher weiter, da ich mehr Bewegungsfreiheit bevorzuge"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "question": "Spikes oder Spikeless – Welcher Sohlen-Typ benötigst du?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Spikeless"
                            },
                            {
                                "id": 2,
                                "option": "Spikes"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "question": "Wie wichtig sind Wasserdichtigkeit und Atmungsaktivität bei deinen Golfschuhen?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Maximale Wasserdichtigkeit, weniger Atmungsaktivität"
                            },
                            {
                                "id": 2,
                                "option": "Gute Balance zwischen wasserdicht & atmungsaktiv"
                            },
                            {
                                "id": 3,
                                "option": "Keine Wasserdichtigkeit nötig, maximale Belüftung"
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "question": "Was ist dir wichtiger – Stabilität oder Komfort?",
                        "options": [
                            {
                                "id": 1,
                                "option": "Stabilität – Sicherer Halt & maximale Kontrolle beim Schwung"
                            },
                            {
                                "id": 2,
                                "option": "Komfort – Längere Runden  "
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": 3,
        "title": "Berg-Trekkingschuhe",
        "slug": "berg-trekkingschuhe",
        "image": "/category/category.png",
        "questions": [
            {
                "id": 1,
                "question": "Auf welchem Untergrund werden Sie den Schuh hauptsächlich nutzen? ",
                "options": [
                    {
                        "id": 1,
                        "option": "Waldwege & befestigte Wege"
                    },
                    {
                        "id": 2,
                        "option": "Felsiges & unebenes Gelände"
                    },
                    {
                        "id": 3,
                        "option": "Dorf & Stadt"
                    },
                    {
                        "id": 4,
                        "option": "Kletterpassagen & Hochtouren"
                    }
                ]
            },
            {
                "id": 2,
                "question": "Welche Schafthöhe bevorzugen Sie?",
                "options": [
                    {
                        "id": 1,
                        "option": "High-Cut – Maximaler Halt und Knöchelschutz für schwieriges Gelände."
                    },
                    {
                        "id": 2,
                        "option": "Mid-Cut – Gute Balance aus Beweglichkeit und Halt für vielseitige Touren."
                    },
                    {
                        "id": 3,
                        "option": "Low-Cut – Leicht und flexibel für schnelle, einfache Wege."
                    }
                ]
            },
            {
                "id": 2,
                "question": "Soll der Schuh wasserdicht sein?",
                "options": [
                    {
                        "id": 1,
                        "option": "Wasserdichte Membran (z. B. Gore-Tex®)"
                    },
                    {
                        "id": 2,
                        "option": "Atmungsaktive, nicht wasserdichte Schuhe"
                    },
                    {
                        "id": 3,
                        "option": "Spielt keine entscheidende Rolle"
                    }
                ]
            },
            {
                "id": 3,
                "question": "Wie wichtig sind Gewicht und Komfort?",
                "options": [
                    {
                        "id": 1,
                        "option": "Leicht & Flexibel"
                    },
                    {
                        "id": 2,
                        "option": "Robust & stabil"
                    },
                    {
                        "id": 3,
                        "option": "Ausgewogen zwischen Komfort & Stabilität "
                    }
                ]
            }
        ]
    }
]