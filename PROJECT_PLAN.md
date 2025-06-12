## 📋 Project Overview
- **Project Goals:** Créer une application de tableau de bord familial pour aider les enfants à suivre leurs responsabilités, respecter les règles, et être récompensés ou corrigés via un système de points. L'application vise à promouvoir l'autonomie et la motivation.
- **Target Audience:** Parents (pour la gestion) et enfants (pour l'interface interactive).
- **Success Criteria:**
    - Application fonctionnelle permettant la gestion des profils enfants, des tâches, des règles et des récompenses.
    - Système de points opérationnel (ajout/soustraction, échange contre récompenses).
    - Interface utilisateur intuitive et visuellement attrayante pour les enfants et les parents.
    - Persistance des données via Supabase avec sécurité RLS.
    - Authentification parent fonctionnelle.

## 🚀 Key Features
- **Core Features (MVP):**
    - Gestion des profils enfants (nom, avatar, âge, points, couleurs personnalisées).
    - Liste des tâches quotidiennes et des règles de comportement.
    - Système de points pour les tâches réussies (+X points) et règles non respectées (-X points).
    - Tableau des récompenses possibles avec coût en points.
    - Échange de points par les enfants contre des récompenses.
    - Tableau de bord par enfant affichant progression, points, tâches.
    - Section d'administration/parent pour la gestion complète (CRUD) des enfants, tâches, règles, récompenses.
    - Authentification par email/mot de passe pour les parents via Supabase.
    - Persistance des données via Supabase.
- **Advanced Features:**
    - Système de badges ou niveaux pour motiver davantage.
    - Rappels visuels ou "conséquences douces" pour les règles non respectées.
    - Historique détaillé des points et des actions.
    - Personnalisation avancée de l'interface pour chaque enfant.
- **Future Enhancements:**
    - Notifications push pour les tâches ou récompenses.
    - Intégration de jeux éducatifs liés aux points.
    - Rapports de progression pour les parents.
    - Support multi-langues.

## 🏗️ Technical Architecture
- **Technology Stack:**
    - **Frontend:** React.js (avec Vite), TypeScript, Tailwind CSS, shadcn/ui, `lucide-react` pour les icônes.
    - **Backend/Database/Auth:** Supabase (PostgreSQL, Authentification par email/mot de passe).
    - **Routing:** `react-router-dom`.
    - **State Management:** React Context API (pour l'authentification et les données globales), `useState`/`useReducer` pour l'état local.
    - **Notifications:** `sonner` pour les toasts.
    - **Theming:** `next-themes` pour le mode sombre.
- **Database Design (Supabase):**
    - `children`: id (uuid), name (text), age (int), avatar_url (text), custom_color (text), points (int), user_id (uuid, FK vers auth.users).
    - `tasks`: id (uuid), label (text), points_reward (int), is_daily (boolean), created_by (uuid, FK vers auth.users).
    - `rules`: id (uuid), label (text), points_penalty (int), created_by (uuid, FK vers auth.users).
    - `rewards`: id (uuid), label (text), cost (int), created_by (uuid, FK vers auth.users).
    - `child_tasks`: id (uuid), child_id (uuid, FK), task_id (uuid, FK), is_completed (boolean), completed_at (timestamptz). (Pour suivre les tâches par enfant et par jour)
    - `child_rules_violations`: id (uuid), child_id (uuid, FK), rule_id (uuid, FK), violated_at (timestamptz). (Pour suivre les violations de règles)
    - `child_rewards_claimed`: id (uuid), child_id (uuid, FK), reward_id (uuid, FK), claimed_at (timestamptz). (Pour suivre les récompenses réclamées)
- **API Design:**
    - Utilisation directe du client Supabase JS pour interagir avec la base de données et l'authentification.
    - Fonctions CRUD pour chaque entité (enfants, tâches, règles, récompenses).
    - Fonctions pour la gestion des points (ajouter/retirer), marquer les tâches comme complétées, réclamer les récompenses.
- **Security Considerations:**
    - Authentification par email/mot de passe via Supabase Auth.
    - Sécurité au niveau des lignes (RLS) activée sur toutes les tables de données pour s'assurer que seuls les utilisateurs autorisés (parents) peuvent gérer leurs propres enfants et données associées, et que les enfants ne peuvent voir que leurs propres données.
    - Utilisation de variables d'environnement pour les clés Supabase.

## 📁 Project Structure
```
project-root/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/             # Formulaires d'authentification
│   │   ├── layout/           # Composants de layout (navigation, footer)
│   │   └── ui/               # Composants shadcn/ui (READ-ONLY)
│   ├── context/              # Contextes React (AuthContext)
│   ├── hooks/                # Hooks personnalisés (useToast, etc.)
│   ├── lib/                  # Utilitaires (cn, supabase client)
│   ├── pages/                # Pages de l'application (routes)
│   │   ├── auth.tsx
│   │   ├── dashboard-child.tsx
│   │   ├── dashboard-parent.tsx
│   │   └── index.tsx
│   ├── types/                # Définitions de types TypeScript
│   ├── App.tsx               # Composant racine de l'application
│   ├── main.tsx              # Point d'entrée React
│   └── index.css             # Styles globaux et Tailwind
├── supabase/                 # Fichiers de configuration Supabase
│   └── migrations/           # Migrations SQL
├── .env                      # Variables d'environnement
├── package.json              # Dépendances et scripts
├── tailwind.config.js        # Configuration Tailwind CSS
├── tsconfig.json             # Configuration TypeScript
└── vite.config.ts            # Configuration Vite
```

## 🔄 Implementation Roadmap
### Phase 1: Foundation (Current)
- [x] Création du `PROJECT_PLAN.md`.
- [x] Installation des dépendances NPM (`react-router-dom`, `@supabase/supabase-js`, `next-themes`, `sonner`).
- [x] Configuration de Supabase (`.env` et migrations SQL initiales).
- [x] Mise en place du client Supabase dans `src/lib/supabase.ts`.
- [x] Définition des types TypeScript dans `src/types/index.ts`.
- [x] Création du contexte d'authentification dans `src/context/auth-context.tsx`.
- [x] Configuration du routage avec `react-router-dom` dans `src/App.tsx` et `src/main.tsx`.
- [x] Création des pages `index.tsx`, `auth.tsx`, `dashboard-parent.tsx`, `dashboard-child.tsx` (placeholders).
- [x] Création du composant de navigation `src/components/layout/main-nav.tsx`.
- [x] Création du formulaire d'authentification `src/components/auth/auth-form.tsx`.
- [x] Intégration de `next-themes` et `sonner`.

### Phase 2: Core Features (Next)
- [ ] Implémentation complète de la gestion des enfants (CRUD) dans le tableau de bord parent.
- [ ] Implémentation complète de la gestion des tâches (CRUD) dans le tableau de bord parent.
- [ ] Implémentation complète de la gestion des règles (CRUD) dans le tableau de bord parent.
- [ ] Implémentation complète de la gestion des récompenses (CRUD) dans le tableau de bord parent.
- [ ] Développement du tableau de bord enfant : affichage dynamique des tâches, points, récompenses.
- [ ] Logique de marquage des tâches comme complétées et mise à jour des points.
- [ ] Logique d'échange de points contre des récompenses.

### Phase 3: Enhancement
- [ ] Amélioration de l'UI/UX avec des animations et un feedback visuel riche.
- [ ] Ajout de la gestion des "punitions" (perte de points) et des alertes visuelles.
- [ ] Personnalisation des avatars et des couleurs pour chaque enfant.
- [ ] Affichage de l'historique des points et des actions.

### Phase 4: Deployment
- [ ] Optimisation des performances et de la sécurité.
- [ ] Documentation technique et guide utilisateur.
- [ ] Préparation pour le déploiement (hors périmètre WebContainer).

## 🛠️ Development Guidelines
- **Code Standards:** Utilisation de TypeScript pour un typage fort, respect des conventions de nommage (camelCase pour JS/TS, snake_case pour SQL), indentation à 2 espaces.
- **Testing Strategy:** Tests manuels approfondis pour chaque fonctionnalité.
- **Documentation:** Commenter le code complexe, documenter les composants réutilisables.
- **Version Control:** Non applicable dans WebContainer.

## 📊 Risk Assessment
- **Technical Risks:**
    - Complexité de la gestion de l'état global (enfants, tâches, points).
    - Problèmes de synchronisation des données avec Supabase.
    - Difficulté à implémenter des politiques RLS granulaires.
- **Timeline Risks:**
    - Sous-estimation de la complexité de l'UI/UX pour une expérience "digne d'une production".
- **Mitigation Strategies:**
    - Découper les fonctionnalités en petites tâches gérables.
    - Tester fréquemment les interactions avec Supabase.
    - Revoir et affiner les politiques RLS régulièrement.
    - Prioriser les fonctionnalités MVP pour assurer une base solide.

## 📚 Resources & Dependencies
- **External APIs:** Supabase.
- **Libraries & Frameworks:** React, Vite, `react-router-dom`, `@supabase/supabase-js`, Tailwind CSS, shadcn/ui, `lucide-react`, `next-themes`, `sonner`.
- **Learning Resources:** Documentation officielle de React, Supabase, Tailwind CSS, shadcn/ui.
