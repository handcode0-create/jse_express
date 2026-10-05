# Modèle d'audit de repo — JSE Express

> Copier ce fichier sous `docs/audits/AAAA-MM-JJ-audit.md`, puis remplir chaque section.
> Stack de référence : Laravel 13 · PHP 8.5 · Inertia 3 + React 19 · Tailwind 4 · Vite 8 · PHPUnit 12.

## 0. Fiche d'identité

| Champ | Valeur |
|---|---|
| Date de l'audit | `AAAA-MM-JJ` |
| Auditeur | |
| Branche / commit audité | `main` @ `<sha>` |
| Périmètre | Complet / Ciblé : `<zones>` |
| Hors périmètre | |
| Environnement vérifié | Local / CI / Préprod / Prod |

## 1. Synthèse

**Verdict global :** 🟢 Sain / 🟠 À surveiller / 🔴 Bloquant

| Axe | Note /5 | Constats critiques | Constats majeurs | Commentaire en une ligne |
|---|---|---|---|---|
| Sécurité | | | | |
| Architecture & qualité du code | | | | |
| Base de données | | | | |
| Frontend (Inertia/React) | | | | |
| Tests | | | | |
| Performance | | | | |
| Dépendances | | | | |
| CI/CD & exploitation | | | | |
| Documentation | | | | |

**Top 3 des actions à mener en priorité :**

1.
2.
3.

## 2. Échelle de gravité

| Niveau | Définition | Délai de correction |
|---|---|---|
| 🔴 Critique | Faille exploitable, perte de données, blocage de commande ou de paiement | Immédiat |
| 🟠 Majeur | Bug fonctionnel, contournement d'autorisation partiel, régression probable | Sprint en cours |
| 🟡 Mineur | Dette technique, incohérence, manque de test | Backlog priorisé |
| ⚪ Info | Suggestion, amélioration de confort | Au fil de l'eau |

## 3. Relevé automatique

Lancer ces commandes et reporter le résultat brut (réussi / échoué + chiffres).

| Vérification | Commande | Résultat |
|---|---|---|
| Tests | `php artisan test` | |
| Style PHP | `vendor/bin/pint --test` | |
| Failles PHP | `composer audit` | |
| Paquets PHP obsolètes | `composer outdated --direct` | |
| Failles JS | `npm audit` | |
| Paquets JS obsolètes | `npm outdated` | |
| Build frontend | `npm run build` | |
| Routes exposées | `php artisan route:list` | |
| État des migrations | `php artisan migrate:status` | |
| Secrets suivis par git | `git ls-files .env "*.pem" "*.key" "*.sqlite"` | |
| Dernière exécution CI | `gh run list --limit 5` | |

## 4. Grille de contrôle

Cocher `[x]` conforme, laisser `[ ]` non conforme (créer un constat en section 5), noter `N/A` si sans objet.

### 4.1 Sécurité

- [ ] `.env` absent du dépôt ; `.env.example` à jour et sans secret réel
- [ ] `APP_DEBUG=false` et `APP_ENV=production` en production
- [ ] Toutes les routes sensibles de `routes/web.php` sont derrière `auth` et un contrôle de rôle
- [ ] Chaque action sur une ressource passe par une Policy (`app/Policies`) — pas d'accès par simple identifiant (IDOR)
- [ ] Espaces Admin / Restaurant / Livreur / Client cloisonnés côté serveur, pas seulement côté interface
- [ ] Validation de toutes les entrées (Form Request ou `validate()`), aucun `$request->all()` vers `create()`/`update()`
- [ ] Modèles protégés contre l'assignation de masse (`$fillable` explicite)
- [ ] Aucune requête SQL brute avec concaténation d'entrée utilisateur
- [ ] Limitation de débit sur connexion, inscription, PIN de livraison et routes coûteuses
- [ ] En-têtes de sécurité actifs (`SecurityHeaders`) : CSP, HSTS, X-Frame-Options, Referrer-Policy
- [ ] Protection CSRF active sur toutes les requêtes modifiant l'état
- [ ] Mots de passe et PIN hachés ; jamais journalisés ni renvoyés dans les props Inertia
- [ ] Props Inertia partagées : aucune donnée sensible exposée (hash, jetons, champs internes)
- [ ] Fichiers envoyés : type, taille et emplacement de stockage contrôlés
- [ ] Sessions et cookies : `secure`, `http_only`, `same_site` configurés

### 4.2 Architecture & qualité du code

- [ ] Contrôleurs fins ; logique métier dans `app/Services`
- [ ] Pas de duplication notable entre contrôleurs ou services
- [ ] Règles métier critiques (tarification, zones, statuts de commande) centralisées en un seul endroit
- [ ] Transitions de statut de commande explicites et contrôlées
- [ ] Nommage cohérent (conventions du projet, français métier)
- [ ] Pas de code mort, de `dd()`, `dump()`, `console.log` ni de TODO oubliés
- [ ] Gestion d'erreurs cohérente ; pas d'exception avalée en silence
- [ ] Configuration lue via `config()`, jamais `env()` hors de `config/`
- [ ] Historique git lisible (messages conventionnels, pas de séries revert/re-commit non expliquées)

### 4.3 Base de données

- [ ] Migrations rejouables à blanc (`migrate:fresh --seed`) sans erreur
- [ ] Clés étrangères et contraintes d'intégrité présentes (suppression en cascade ou restriction voulue)
- [ ] Index sur les colonnes filtrées, triées ou jointes
- [ ] Montants stockés en entiers (FCFA), pas en flottants
- [ ] Opérations multi-tables enveloppées dans une transaction
- [ ] Pas de requêtes N+1 sur les listes (chargement anticipé)
- [ ] Listes paginées, aucune collection illimitée renvoyée
- [ ] Seeders et factories à jour avec le schéma

### 4.4 Frontend (Inertia / React)

- [ ] Pages (`resources/js/Pages`) et composants (`resources/js/Composants`) correctement découpés, pas de page monolithique
- [ ] Aucune page orpheline ou doublon (ex. anciennes versions de la page d'accueil)
- [ ] États de chargement, vide et erreur gérés sur chaque écran
- [ ] Erreurs de validation serveur affichées au bon champ
- [ ] Parcours utilisable au mobile (360 px) sans défilement horizontal
- [ ] Accessibilité : contrastes, libellés de formulaires, navigation clavier, textes alternatifs
- [ ] Jetons Tailwind cohérents ; pas de couleurs ou d'espacements codés en dur en dehors du design system
- [ ] Images optimisées et chargées en différé ; pas de dépendance à un service externe sans repli
- [ ] Animations (GSAP) respectueuses de `prefers-reduced-motion` et nettoyées au démontage
- [ ] Aucune erreur ni avertissement dans la console du navigateur

### 4.5 Tests

- [ ] Suite entièrement verte en local et en CI
- [ ] Parcours critiques couverts : inscription, connexion, commande, annulation, PIN de livraison, tarification
- [ ] Tests d'autorisation pour chaque rôle (accès permis **et** refusé)
- [ ] Cas limites et cas d'erreur testés, pas seulement le cas nominal
- [ ] Aucun test ignoré, vide ou reliquat (`ExampleTest`)
- [ ] Tests indépendants les uns des autres (base réinitialisée)

### 4.6 Performance

- [ ] Poids du bundle JS raisonnable ; découpage par page actif
- [ ] Bibliothèques lourdes (Leaflet, GSAP) chargées uniquement là où elles servent
- [ ] Cache de configuration, routes et vues activé en production
- [ ] Traitements longs (notifications, e-mails) envoyés en file d'attente
- [ ] Temps de réponse des pages principales mesuré sur réseau mobile lent

### 4.7 Dépendances

- [ ] Aucune faille connue (`composer audit`, `npm audit`)
- [ ] Versions majeures à jour ou retard justifié
- [ ] Aucune dépendance inutilisée
- [ ] `composer.lock` et `package-lock.json` versionnés et synchronisés
- [ ] Licences compatibles avec l'usage commercial

### 4.8 CI/CD & exploitation

- [ ] CI exécutée sur chaque push et pull request vers `main`
- [ ] CI couvre tests, build, style (`pint`) et audit de dépendances
- [ ] Branche `main` protégée ; fusion par pull request relue
- [ ] Procédure de déploiement et de retour arrière documentée
- [ ] Sauvegardes de la base planifiées et restauration testée
- [ ] Journaux et erreurs de production centralisés et consultés
- [ ] Fichiers locaux non suivis (`.devdbrc`, caches) ignorés par `.gitignore`

### 4.9 Documentation

- [ ] `README.md` décrit le projet (et non le squelette Laravel par défaut)
- [ ] Installation locale reproductible en suivant la documentation seule
- [ ] Variables d'environnement documentées dans `.env.example`
- [ ] Rôles, statuts de commande et règles de tarification documentés
- [ ] `CLAUDE.md` / `AGENTS.md` à jour avec les conventions du projet

## 5. Constats

Un bloc par constat, numéroté dans l'ordre de gravité.

### C-01 — `<titre court>`

| Champ | Valeur |
|---|---|
| Gravité | 🔴 / 🟠 / 🟡 / ⚪ |
| Axe | Sécurité / Architecture / Base de données / Frontend / Tests / Performance / Dépendances / CI-CD / Documentation |
| Emplacement | `chemin/du/fichier.php:ligne` |
| Statut | Ouvert / En cours / Corrigé / Accepté |

**Constat :** ce qui est observé, factuellement.

**Preuve :** extrait de code, commande et sortie, ou étapes de reproduction.

**Impact :** ce qui peut arriver concrètement, et pour qui (client, restaurant, livreur, admin).

**Recommandation :** correction proposée, la plus simple possible.

**Effort estimé :** S (< 1 h) / M (demi-journée) / L (plusieurs jours)

## 6. Plan d'action

| # | Constat | Action | Gravité | Effort | Responsable | Échéance | Statut |
|---|---|---|---|---|---|---|---|
| 1 | C-01 | | | | | | |

## 7. Points positifs

Ce qui est bien fait et doit être conservé.

-

## 8. Suivi

| Champ | Valeur |
|---|---|
| Audit précédent | `docs/audits/<fichier>` |
| Constats du précédent audit toujours ouverts | |
| Date du prochain audit | |
