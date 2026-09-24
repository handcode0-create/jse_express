# JSE Express — migrations métier

Ces migrations sont reconstruites à partir du MLD JSE Express validé.

Ordre :
1 users
2 zones
3 statuts_commandes
4 restaurants
5 categories
6 produits
7 paniers
8 ligne_panier
9 commandes
10 ligne_commandes
11 paiements
12 livraisons
13 profils_livreurs
14 attributions_livraison
15 historique_commandes
16 notifications

Les migrations Laravel techniques `cache`, `jobs` et leurs tables associées peuvent être conservées.

Important :
- Remplacer la migration Laravel `create_users_table.php` existante par celle fournie ici.
- Ne pas créer une deuxième migration `users`.
- Après copie, exécuter `php artisan migrate:fresh` uniquement si la base peut être réinitialisée.
