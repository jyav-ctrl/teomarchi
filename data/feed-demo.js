(function () {
  "use strict";

  window.TEOMARCHI_FEED_DEMO = Object.freeze([
    {
      id: "demo-feed-centre-pompidou",
      isDemo: true,
      label: "Démo",
      authorId: "demo-atelier-teomarchi",
      authorName: "Atelier TEOMARCHI",
      authorRole: "etudiant",
      authorSchoolOrAgency: "Atelier école",
      authorVerified: false,
      visibility: "communaute",
      type: "projet",
      title: "Structure apparente et référence Pompidou",
      body: "Je teste une coupe où les réseaux et la structure deviennent lisibles. Référence utile : Centre Pompidou pour comprendre l'exosquelette et les plateaux libres.",
      projectPhase: "Concept",
      category: "Structure",
      tags: ["structure apparente", "coupe", "référence"],
      linkedAtlasIds: ["fr-centre-pompidou"],
      likesCount: 18,
      commentsCount: 3,
      repostsCount: 0,
      savesCount: 0,
      status: "active",
      previewComments: [
        { authorName: "Lina M.", body: "La logique de réseaux visibles peut aussi guider la façade." },
        { authorName: "Atelier B", body: "Regarde aussi la question des circulations verticales." }
      ]
    },
    {
      id: "demo-feed-brique-humidite",
      isDemo: true,
      label: "Démo",
      authorId: "demo-agence-matiere",
      authorName: "Agence Matière Claire",
      authorRole: "agence",
      authorSchoolOrAgency: "Bruxelles",
      authorVerified: true,
      visibility: "professionnel",
      type: "analyse",
      title: "Façade brique isolée : où placer la lame d'air ?",
      body: "Cas fréquent en Belgique : garder une lame ventilée, traiter les ponts thermiques en tableaux et éviter que l'isolant coupe la lecture constructive.",
      projectPhase: "Détail",
      category: "Matériaux",
      tags: ["brique", "humidité", "isolation"],
      linkedAtlasIds: ["be-hotel-tassel"],
      likesCount: 31,
      commentsCount: 5,
      repostsCount: 0,
      savesCount: 0,
      status: "active",
      previewComments: [
        { authorName: "Noé T.", body: "Utile pour mon détail au 1/20, merci." }
      ]
    },
    {
      id: "demo-feed-workshop-patio",
      isDemo: true,
      label: "Démo",
      authorId: "demo-ecole-studio",
      authorName: "Studio Climat",
      authorRole: "ecole",
      authorSchoolOrAgency: "Workshop été",
      authorVerified: false,
      visibility: "communaute",
      type: "workshop",
      title: "Workshop maison patio en climat chaud",
      body: "Exercice court : inertie au sol, ombre portée, ventilation traversante et seuils protégés. Objectif : une stratégie climatique avant le dessin de façade.",
      projectPhase: "Esquisse",
      category: "Climat",
      tags: ["patio", "climat chaud", "inertie"],
      linkedAtlasIds: ["ma-fes-medina"],
      likesCount: 22,
      commentsCount: 4,
      repostsCount: 0,
      savesCount: 0,
      status: "active",
      previewComments: [
        { authorName: "Yasmine A.", body: "La coupe climatique aide à clarifier le parti." }
      ]
    },
    {
      id: "demo-feed-concours-equipement",
      isDemo: true,
      label: "Démo",
      authorId: "demo-collectif-concours",
      authorName: "Collectif Concours",
      authorRole: "architecte",
      authorSchoolOrAgency: "Paris / Lyon",
      authorVerified: false,
      visibility: "professionnel",
      type: "concours",
      title: "Concours équipement public : trame bois ou béton ?",
      body: "Programme compact, portée moyenne, planning serré. Je cherche des retours sur une trame poteau-poutre bois avec noyaux béton pour garder une logique bas-carbone réaliste.",
      projectPhase: "APS",
      category: "Concours",
      tags: ["concours", "bois", "équipement public"],
      linkedAtlasIds: ["jp-sendai-mediatheque"],
      likesCount: 27,
      commentsCount: 6,
      repostsCount: 0,
      savesCount: 0,
      status: "active",
      previewComments: [
        { authorName: "Agence N.", body: "Attention aux portées et à l'acoustique si salle polyvalente." }
      ]
    },
    {
      id: "demo-feed-recherche-habitat",
      isDemo: true,
      label: "Démo",
      authorId: "demo-labo-habitat",
      authorName: "Labo Habitat Collectif",
      authorRole: "ecole",
      authorSchoolOrAgency: "Recherche logement",
      authorVerified: false,
      visibility: "tous",
      type: "recherche",
      title: "Recherche : coursives, seuils et communs habitables",
      body: "Je compile des références où la circulation devient un espace social, pas seulement un couloir réglementaire. Les retours de projets construits sont bienvenus.",
      projectPhase: "Recherche",
      category: "Logement",
      tags: ["habitat collectif", "coursive", "seuil"],
      linkedAtlasIds: ["fr-unite-marseille"],
      likesCount: 19,
      commentsCount: 2,
      repostsCount: 0,
      savesCount: 0,
      status: "active",
      previewComments: [
        { authorName: "Malo R.", body: "L'Unité de Marseille reste un bon point de départ." }
      ]
    }
  ]);
})();
