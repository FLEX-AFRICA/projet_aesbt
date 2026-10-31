/**
 * Défauts locaux des contenus éditables, par page.
 *
 * Les clés ET les valeurs sont identiques à celles du registre du backend
 * (backend_aesbt/src/contenus/registre.ts) : un test du backend échoue dès
 * qu'une clé ou une valeur diverge. Ce sont les textes réellement affichés
 * aujourd'hui par le site : tant que l'API est absente ou qu'aucune valeur n'est
 * publiée, le site s'affiche donc comme avant.
 *
 * Pages : `association`, `accueil` et `commun` (bande d'adhésion, navigation,
 * pied de page, partagés). Une image est une source (chemin public ou
 * identifiant de média) ; son texte alternatif est une clé `*_alt` à part.
 *
 * Sources : src/app/association/page.tsx, src/components/hero-lab/*,
 * src/components/layout/*, src/components/association/*, src/data/association.ts.
 */

export type ValeurContenu = string | number | null | Record<string, string | number | null>[];

export interface MissionContenu extends Record<string, string | number | null> {
  titre: string;
  description: string;
}

export const DEFAUTS: Record<string, Record<string, ValeurContenu>> = {
  association: {
    // Référencement (SEO)
    "association.seo.titre": "L'association",
    "association.seo.description": "Présentation, historique, missions, mot du Président et Bureau Exécutif de l'Association des Étudiants et Stagiaires Burkinabè en Tunisie.",
    // En-tête
    "association.hero.etiquette": "AESBT",
    "association.hero.titre": "Une association au service de sa communauté.",
    "association.hero.description": "[Emplacement réservé à la présentation générale de l'AESBT. Le texte officiel sera fourni par le Bureau Exécutif.]",
    // Historique
    "association.historique.etiquette": "Histoire",
    "association.historique.titre": "Historique",
    "association.historique.paragraphes": [
      {
        "texte": "[Emplacement réservé à l'historique de l'association.]"
      },
      {
        "texte": "[Étapes clés, dates et faits marquants à compléter.]"
      }
    ],
    // Missions
    "association.missions.etiquette": "Missions",
    "association.missions.titre": "Missions et objectifs",
    "association.missions": [
      {
        "titre": "[Mission 1]",
        "description": "[Description de la mission, à compléter avec le contenu officiel.]"
      },
      {
        "titre": "[Mission 2]",
        "description": "[Description de la mission, à compléter avec le contenu officiel.]"
      },
      {
        "titre": "[Mission 3]",
        "description": "[Description de la mission, à compléter avec le contenu officiel.]"
      }
    ],
    // Mot du Président
    "association.president.etiquette": "Mot du Président",
    "association.president.photo": null,
    "association.president.photo_alt": "Portrait du président de l'AESBT, à venir",
    "association.president.photo_vide": "Portrait à venir",
    "association.president.message": "[Emplacement réservé au mot du Président. Le texte officiel sera fourni par le Bureau Exécutif.]",
    "association.president.nom": "Nom à communiquer",
    "association.president.role": "Président de l'AESBT",
    // Bureau Exécutif
    "association.bureau.etiquette": "Gouvernance",
    "association.bureau.titre": "Bureau Exécutif",
    "association.bureau.description": "Les noms des membres seront renseignés dès leur communication officielle.",
  },
  accueil: {
    // Référencement (SEO)
    "accueil.seo.titre": "AESBT : Association des Étudiants et Stagiaires Burkinabè en Tunisie",
    "accueil.seo.description": "Site officiel de l'AESBT, association des étudiants et stagiaires burkinabè en Tunisie : association, actualités, galerie, centre de ressources, événements et contact.",
    "accueil.seo.og_titre": "AESBT : étudiants et stagiaires burkinabè en Tunisie",
    // Hero
    "accueil.hero.logo_alt": "AESBT, Association des Étudiants et Stagiaires Burkinabè en Tunisie",
    "accueil.hero.titre_debut": "Une communauté,",
    "accueil.hero.titre_mots": [
      {
        "mot": "forte"
      },
      {
        "mot": "unie"
      },
      {
        "mot": "soudée"
      }
    ],
    "accueil.hero.intro": "Une communauté qui accueille, accompagne et fait avancer, de l'arrivée en Tunisie à la réussite du diplôme.",
    "accueil.hero.photo": "/aesbt/staff-groupe.jpg",
    "accueil.hero.photo_alt": "Le collectif AESBT réuni lors d'un événement de l'association",
    "accueil.hero.photo_legende": "Le staff de l'AESBT, Tunis",
    "accueil.hero.cta_libelle": "Rejoindre l'association",
    "accueil.hero.cta_lien": "/inscription",
    // À l'affiche
    "accueil.actus.etiquette": "À l'affiche",
    "accueil.actus.titre": "Ce qui anime l'association.",
    "accueil.actus.tout_libelle": "Toutes les actualités",
    "accueil.actus.tout_lien": "/actualites",
    "accueil.actus.lire_libelle": "Lire l'actualité",
    "accueil.actus.renvoi_texte": "Les comptes rendus, annonces et appels à participation de l'association sont regroupés sur la page Actualités.",
    "accueil.actus.renvoi_libelle": "Ouvrir le fil d'actualités",
    "accueil.actus.renvoi_lien": "/actualites",
    // L'AESBT en mouvement
    "accueil.montage.etiquette": "En vidéo",
    "accueil.montage.titre": "Une année d'AESBT en quelques secondes.",
    "accueil.montage.texte": "Cérémonies, weekends d'intégration, journées culturelles et sportives : le montage rassemble les moments qui rythment la vie de l'association, entre Tunis et Ouagadougou.",
    "accueil.montage.galerie_libelle": "Voir la galerie",
    "accueil.montage.galerie_lien": "/galerie",
    "accueil.montage.suivi_suffixe": "+ membres nous suivent",
    "accueil.montage.photos": [
      {
        "src": "/picture-1.jpg"
      },
      {
        "src": "/picture-2.jpg"
      },
      {
        "src": "/picture-3.jpg"
      },
      {
        "src": "/picture-4.jpg"
      },
      {
        "src": "/picture-5.jpg"
      },
      {
        "src": "/picture-6.jpg"
      },
      {
        "src": "/picture-7.jpg"
      },
      {
        "src": "/picture-8.jpg"
      },
      {
        "src": "/picture-9.jpg"
      },
      {
        "src": "/picture-10.jpg"
      },
      {
        "src": "/picture-11.jpg"
      }
    ],
    // Fenêtre de l'étudiant
    "accueil.fenetre.etiquette": "Lancement officiel",
    "accueil.fenetre.titre": "Fenêtre de l'étudiant",
    "accueil.fenetre.intro_courte": "L'AESBT lance sa nouvelle rubrique : elle valorise les étudiants et stagiaires burkinabè en Tunisie, leurs compétences, leurs projets et leurs ambitions.",
    "accueil.fenetre.intro_longue": "Parce que chaque parcours mérite d'être connu, chaque réussite d'être célébrée et chaque étudiant d'être mis en lumière, l'AESBT lance sa nouvelle rubrique : elle valorise les étudiants et stagiaires burkinabè en Tunisie, leurs compétences, leurs projets, leurs engagements et leurs ambitions.",
    "accueil.fenetre.explication": "Chaque édition met à l'honneur un étudiant ou un stagiaire : son histoire, son parcours et sa vision. De quoi faire découvrir les talents de la communauté, et inspirer celles et ceux qui arrivent.",
    "accueil.fenetre.cta_libelle": "Proposer un profil",
    "accueil.fenetre.cta_lien": "/contact",
    "accueil.fenetre.lien2_libelle": "Suivre les éditions",
    "accueil.fenetre.lien2_lien": "/actualites",
    // Cellule scientifique
    "accueil.science.titre_debut": "La cellule",
    "accueil.science.titre_fin": "scientifique",
    "accueil.science.media": "/picture-11.jpg",
    "accueil.science.media_alt": "Étudiants et stagiaires de l'AESBT réunis",
    "accueil.science.media_ratio": 2048 / 1378,
    "accueil.science.poles": [
      {
        "name": "Pôle Arts et Techniques du Bâtiment",
        "fields": "Architecture, génie civil, travaux publics",
        "icon": "batiment"
      },
      {
        "name": "Pôle Génie Industriel",
        "fields": "Mécanique, électromécanique, maintenance, production",
        "icon": "industriel"
      },
      {
        "name": "Pôle Santé et Biomédical",
        "fields": "Médecine, pharmacie, soins, génie biomédical",
        "icon": "sante"
      },
      {
        "name": "Pôle Économie, Finance et Commerce",
        "fields": "Gestion, comptabilité, banque, commerce",
        "icon": "economie"
      },
      {
        "name": "Pôle Data Sciences et IA",
        "fields": "Informatique, données, intelligence artificielle",
        "icon": "data"
      },
      {
        "name": "Pôle Sciences",
        "fields": "Mathématiques, physique, chimie, biologie",
        "icon": "sciences"
      }
    ],
    "accueil.science.legende_mobile": "Six pôles éducatifs, un par grande famille de filières.",
    "accueil.science.badge": "Cellule scientifique",
    "accueil.science.phrase": "Chaque pôle réunit les étudiants d'une même famille de filières : on s'y oriente, on s'y entraide, et on y retrouve les aînés.",
    "accueil.science.cta_libelle": "Rejoindre un pôle",
    "accueil.science.cta_lien": "/contact",
    // Contact
    "accueil.contact.titre": "Une question ? L'AESBT vous répond.",
    "accueil.contact.ecrire_libelle": "Nous écrire",
    "accueil.contact.rejoindre_libelle": "Rejoindre",
    "accueil.contact.rejoindre_lien": "/inscription",
    "accueil.contact.libelle_email": "E-mail",
    "accueil.contact.libelle_telephone": "Téléphone (Tunisie)",
    "accueil.contact.libelle_whatsapp": "WhatsApp (Burkina)",
    // On t'accompagne
    "accueil.accompagnement.mascotte": "/mascots/garcon-cartoon2.png",
    "accueil.accompagnement.mascotte_alt": "Mascotte étudiant AESBT, pouce levé, tenant un cahier",
    "accueil.accompagnement.etiquette": "Nouveau en Tunisie ?",
    "accueil.accompagnement.titre": "On t'accompagne, pas à pas.",
    "accueil.accompagnement.texte": "Démarches d'arrivée, logement, études, vie associative : l'AESBT regroupe ce dont tu as besoin pour bien commencer et avancer sereinement.",
    "accueil.accompagnement.ressources_libelle": "Centre de ressources",
    "accueil.accompagnement.ressources_lien": "/ressources",
    "accueil.accompagnement.membre_libelle": "Devenir membre",
    "accueil.accompagnement.membre_lien": "/inscription",
  },
  commun: {
    // Bande d'adhésion (accueil et association)
    "commun.cta.etiquette": "Adhésion ouverte",
    "commun.cta.titre_debut": "Tu arrives en Tunisie ?",
    "commun.cta.titre_accent": "L'AESBT t'attend.",
    "commun.cta.intro": "Accueil à l'aéroport, démarches administratives, logement, entraide entre promotions : rejoindre l'association, c'est ne jamais commencer seul.",
    "commun.cta.bouton_libelle": "Rejoindre l'AESBT",
    "commun.cta.bouton_lien": "/inscription",
    "commun.cta.visages": [
      {
        "src": "/picture-2.jpg"
      },
      {
        "src": "/picture-5.jpg"
      },
      {
        "src": "/picture-8.jpg"
      },
      {
        "src": "/picture-11.jpg"
      }
    ],
    "commun.cta.membres_precision": "entre Tunis et Ouagadougou",
    "commun.cta.question_debut": "Une question d'abord ?",
    "commun.cta.question_lien_libelle": "Écris-nous",
    "commun.cta.question_lien": "/contact",
    "commun.cta.question_fin": ", ou appelle le",
    // Navigation
    "commun.nav.cta_libelle": "Rejoindre",
    "commun.nav.cta_libelle_mobile": "Rejoindre l'association",
    "commun.logo": "/logo_aesbt.jpg",
    // Coordonnées et chiffres
    "commun.site.whatsapp": "+226 57 32 01 47",
    "commun.site.membres_nombre": "3,2 K",
    // Pied de page
    "commun.pied.accroche": "Rejoignez une communauté qui vous accompagne.",
    "commun.pied.accroche_sous_titre": "De l'arrivée en Tunisie à la réussite, l'AESBT est à vos côtés.",
    "commun.pied.cta_libelle": "Inscription",
    "commun.pied.description_suite": "Un collectif au service de la réussite, de l'accompagnement et de la solidarité étudiante.",
    "commun.pied.copyright": "Tous droits réservés.",
  },
};
