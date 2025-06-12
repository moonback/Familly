/*
  # Initialisation du schéma de la base de données

  Cette migration crée les tables initiales nécessaires pour l'application de tableau de bord familial.

  1. Nouvelles Tables
    - `children`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `user_id` (uuid, clé étrangère vers `auth.users`, non nul) - L'ID de l'utilisateur parent associé.
      - `name` (text, non nul) - Nom de l'enfant.
      - `age` (integer) - Âge de l'enfant.
      - `avatar_url` (text) - URL de l'avatar de l'enfant.
      - `custom_color` (text) - Couleur personnalisée pour l'interface de l'enfant.
      - `points` (integer, par défaut 0) - Points actuels de l'enfant.
      - `created_at` (timestamptz, par défaut maintenant)
    - `tasks`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `user_id` (uuid, clé étrangère vers `auth.users`, non nul) - L'ID de l'utilisateur parent qui a créé la tâche.
      - `label` (text, non nul) - Description de la tâche.
      - `points_reward` (integer, par défaut 0) - Points gagnés pour cette tâche.
      - `is_daily` (boolean, par défaut true) - Indique si la tâche est quotidienne.
      - `created_at` (timestamptz, par défaut maintenant)
    - `rules`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `user_id` (uuid, clé étrangère vers `auth.users`, non nul) - L'ID de l'utilisateur parent qui a créé la règle.
      - `label` (text, non nul) - Description de la règle.
      - `points_penalty` (integer, par défaut 0) - Points perdus pour non-respect de cette règle.
      - `created_at` (timestamptz, par défaut maintenant)
    - `rewards`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `user_id` (uuid, clé étrangère vers `auth.users`, non nul) - L'ID de l'utilisateur parent qui a créé la récompense.
      - `label` (text, non nul) - Description de la récompense.
      - `cost` (integer, non nul) - Coût en points de la récompense.
      - `created_at` (timestamptz, par défaut maintenant)
    - `child_tasks`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `child_id` (uuid, clé étrangère vers `children`, non nul)
      - `task_id` (uuid, clé étrangère vers `tasks`, non nul)
      - `is_completed` (boolean, par défaut false) - Statut de complétion de la tâche pour l'enfant.
      - `completed_at` (timestamptz) - Date de complétion de la tâche.
      - `due_date` (date, non nul) - Date à laquelle la tâche est due (pour les tâches quotidiennes).
      - `created_at` (timestamptz, par défaut maintenant)
    - `child_rules_violations`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `child_id` (uuid, clé étrangère vers `children`, non nul)
      - `rule_id` (uuid, clé étrangère vers `rules`, non nul)
      - `violated_at` (timestamptz, par défaut maintenant) - Date de la violation.
      - `created_at` (timestamptz, par défaut maintenant)
    - `child_rewards_claimed`
      - `id` (uuid, clé primaire, généré automatiquement)
      - `child_id` (uuid, clé étrangère vers `children`, non nul)
      - `reward_id` (uuid, clé étrangère vers `rewards`, non nul)
      - `claimed_at` (timestamptz, par défaut maintenant) - Date de la réclamation.
      - `created_at` (timestamptz, par défaut maintenant)

  2. Sécurité (Row Level Security - RLS)
    - Activer RLS sur toutes les nouvelles tables (`children`, `tasks`, `rules`, `rewards`, `child_tasks`, `child_rules_violations`, `child_rewards_claimed`).
    - Ajouter des politiques RLS pour permettre aux utilisateurs authentifiés (parents) de :
      - Insérer, sélectionner, mettre à jour, supprimer leurs propres enfants.
      - Insérer, sélectionner, mettre à jour, supprimer leurs propres tâches, règles, récompenses.
      - Insérer, sélectionner, mettre à jour, supprimer les enregistrements `child_tasks`, `child_rules_violations`, `child_rewards_claimed` liés à leurs enfants.
    - Les enfants (via leur `child_id` lié à `user_id` du parent) pourront voir leurs propres tâches, règles, récompenses et progression.

  3. Modifications
    - Aucune modification de tables existantes.
*/

-- Création de la table `children`
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age integer,
  avatar_url text,
  custom_color text,
  points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `children`
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `children`
CREATE POLICY "Parents can view their own children"
  ON children FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert their own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own children"
  ON children FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can delete their own children"
  ON children FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Création de la table `tasks`
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  points_reward integer DEFAULT 0 NOT NULL,
  is_daily boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `tasks`
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `tasks`
CREATE POLICY "Parents can view their own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert their own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can delete their own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Création de la table `rules`
CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  points_penalty integer DEFAULT 0 NOT obstante,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `rules`
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `rules`
CREATE POLICY "Parents can view their own rules"
  ON rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert their own rules"
  ON rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own rules"
  ON rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can delete their own rules"
  ON rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Création de la table `rewards`
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  cost integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `rewards`
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `rewards`
CREATE POLICY "Parents can view their own rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert their own rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can delete their own rewards"
  ON rewards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Création de la table `child_tasks`
CREATE TABLE IF NOT EXISTS child_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  due_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `child_tasks`
ALTER TABLE child_tasks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `child_tasks`
CREATE POLICY "Parents can manage child tasks for their children"
  ON child_tasks FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()));

-- Création de la table `child_rules_violations`
CREATE TABLE IF NOT EXISTS child_rules_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  rule_id uuid REFERENCES rules(id) ON DELETE CASCADE NOT NULL,
  violated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `child_rules_violations`
ALTER TABLE child_rules_violations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `child_rules_violations`
CREATE POLICY "Parents can manage child rule violations for their children"
  ON child_rules_violations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()));

-- Création de la table `child_rewards_claimed`
CREATE TABLE IF NOT EXISTS child_rewards_claimed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  claimed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table `child_rewards_claimed`
ALTER TABLE child_rewards_claimed ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour `child_rewards_claimed`
CREATE POLICY "Parents can manage child claimed rewards for their children"
  ON child_rewards_claimed FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM children WHERE id = child_id AND user_id = auth.uid()));
