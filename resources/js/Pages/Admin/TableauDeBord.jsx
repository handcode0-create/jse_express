import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    LayoutDashboard,
    PackageCheck,
    RefreshCw,
    Truck,
    UtensilsCrossed,
    Users,
} from 'lucide-react';
import PhotoProfil from '../../Composants/Profil/PhotoProfil';
import ThemeToggle from '../../Composants/Interface/ThemeToggle';

export default function TableauDeBord({
    statistiques = {},
    livraisons = [],
    livreurs = [],
    commandes = [],
}) {
    const [selection, setSelection] = useState({});
    const [motifs, setMotifs] = useState({});
    const [motifsAnnulation, setMotifsAnnulation] = useState({});
    const [traitement, setTraitement] = useState(null);
    const { auth } = usePage().props;
    const utilisateur = auth?.user;

    const reattribuer = (livraisonId) => {
        const livreurId = selection[livraisonId];
        const motif = (motifs[livraisonId] || '').trim();

        if (!livreurId || !motif) return;

        setTraitement(livraisonId);
        router.post('/administration/livraisons/' + livraisonId + '/reattribuer', {
            livreur_id: livreurId,
            motif,
        }, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
    };

    const annuler = (commande) => {
        const motif = (motifsAnnulation[commande.id] || '').trim();

        if (!motif) return;
        if (!window.confirm('Annuler la commande ' + (commande.reference || '#' + commande.id) + ' ?')) return;

        const identifiant = 'annulation-' + commande.id;
        setTraitement(identifiant);

        router.post('/administration/commandes/' + commande.id + '/annuler', { motif }, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
    };

    const formatMontant = (montant) =>
        new Intl.NumberFormat('fr-FR').format(Number(montant || 0));

    const profilNom = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(' ') || 'Administrateur';

    const statistiquesBarres = useMemo(() => {
        const elements = [
            {
                label: 'Commandes actives',
                valeur: Number(statistiques.commandes_actives ?? 0),
                icon: <UtensilsCrossed size={16} />,
            },
            {
                label: 'Livraisons actives',
                valeur: Number(statistiques.livraisons_actives ?? 0),
                icon: <Truck size={16} />,
            },
            {
                label: 'Livreurs disponibles',
                valeur: Number(statistiques.livreurs_disponibles ?? 0),
                icon: <Users size={16} />,
            },
            {
                label: 'Commandes livrées',
                valeur: Number(statistiques.commandes_livrees ?? 0),
                icon: <CheckCircle2 size={16} />,
            },
        ];

        const maximum = Math.max(...elements.map((element) => element.valeur), 1);

        return elements.map((element) => ({
            ...element,
            largeur: Math.max((element.valeur / maximum) * 100, element.valeur ? 8 : 0),
        }));
    }, [statistiques]);

    const cartes = [
        {
            label: 'Commandes actives',
            valeur: statistiques.commandes_actives ?? 0,
            icon: <UtensilsCrossed size={18} />,
            accent: 'text-[#45B977] bg-[#45B977]/10',
        },
        {
            label: 'Commandes livrées',
            valeur: statistiques.commandes_livrees ?? 0,
            icon: <CheckCircle2 size={18} />,
            accent: 'text-[#45B977] bg-[#45B977]/10',
        },
        {
            label: 'Livraisons actives',
            valeur: statistiques.livraisons_actives ?? 0,
            icon: <Truck size={18} />,
            accent: 'text-[#F28C28] bg-[#F28C28]/10',
        },
        {
            label: 'Livreurs disponibles',
            valeur: statistiques.livreurs_disponibles ?? 0,
            icon: <Users size={18} />,
            accent: 'text-[#F28C28] bg-[#F28C28]/10',
        },
    ];

    return (
        <>
            <Head title="Administration — JSE Express" />

            <main className="min-h-screen bg-[var(--jse-theme-bg)] text-jse-theme-text">
                <div className="flex min-h-screen flex-col lg:flex-row">
                    <aside className="border-b border-jse-theme-border bg-jse-theme-surface lg:sticky lg:top-0 lg:h-screen lg:w-[250px] lg:shrink-0 lg:border-b-0 lg:border-r">
                        <div className="flex h-full flex-col p-5 lg:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-against text-[18px] leading-none text-[#123C32] dark:text-[#45B977]">JSE</p>
                                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#45B977]">Express</p>
                                </div>
                                <div className="lg:hidden">
                                    <ThemeToggle />
                                </div>
                            </div>

                            <div className="mt-8 hidden lg:block">
                                <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[color:var(--jse-theme-muted)]">Navigation</p>
                                <nav className="mt-3 space-y-1">
                                    <a href="#vue-ensemble" className="flex items-center gap-3 rounded-2xl bg-[#123C32] px-4 py-3 text-sm font-semibold text-[#FFF7E8] shadow-[0_10px_25px_rgb(18_60_50_/_0.16)]">
                                        <LayoutDashboard size={17} />
                                        Tableau de bord
                                    </a>
                                    <a href="#commandes" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[color:var(--jse-theme-muted)] transition hover:bg-[#45B977]/10 hover:text-[#123C32] dark:hover:text-[#45B977]">
                                        <UtensilsCrossed size={17} />
                                        Commandes
                                    </a>
                                    <a href="#livraisons" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[color:var(--jse-theme-muted)] transition hover:bg-[#45B977]/10 hover:text-[#123C32] dark:hover:text-[#45B977]">
                                        <Truck size={17} />
                                        Livraisons
                                    </a>
                                </nav>
                            </div>

                            <div className="mt-auto hidden lg:block">
                                <div className="mb-5 flex justify-end">
                                    <ThemeToggle />
                                </div>
                                <div className="rounded-2xl border border-jse-theme-border bg-[color:var(--jse-theme-surface-soft)] p-3">
                                    <div className="flex items-center gap-3">
                                        <PhotoProfil user={utilisateur} size="size-10" dark />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold">{profilNom}</p>
                                            <p className="mt-0.5 truncate text-[9px] text-[color:var(--jse-theme-muted)]">Administrateur</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="min-w-0 flex-1">
                        <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
                            <header id="vue-ensemble" className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#45B977]">JSE Express</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Administration</h1>
                                    <p className="mt-2 max-w-2xl text-sm text-[color:var(--jse-theme-muted)]">Vue opérationnelle des commandes et des livraisons.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-jse-theme-border bg-jse-theme-surface px-4 py-2.5 text-right">
                                        <p className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--jse-theme-muted)]">Profil</p>
                                        <p className="mt-0.5 text-xs font-semibold">{profilNom}</p>
                                    </div>
                                </div>
                            </header>

                            <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {cartes.map((carte) => (
                                    <article key={carte.label} className="group rounded-[22px] border border-jse-theme-border bg-jse-theme-surface p-4 shadow-[0_10px_30px_rgb(18_60_50_/_0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgb(18_60_50_/_0.08)]">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] font-medium text-[color:var(--jse-theme-muted)]">{carte.label}</p>
                                                <p className="mt-2 text-2xl font-semibold tracking-tight">{carte.valeur}</p>
                                            </div>
                                            <span className={'flex size-10 items-center justify-center rounded-2xl ' + carte.accent}>{carte.icon}</span>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
                                <article className="rounded-[26px] border border-jse-theme-border bg-jse-theme-surface p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="flex size-9 items-center justify-center rounded-xl bg-[#45B977]/10 text-[#45B977]"><BarChart3 size={17} /></span>
                                                <h2 className="text-base font-semibold">Statistiques opérationnelles</h2>
                                            </div>
                                            <p className="mt-2 text-xs text-[color:var(--jse-theme-muted)]">Instantané des indicateurs actuellement disponibles.</p>
                                        </div>
                                        <span className="rounded-full border border-jse-theme-border px-3 py-1.5 text-[10px] font-medium text-[color:var(--jse-theme-muted)]">Temps réel</span>
                                    </div>

                                    <div className="mt-7 space-y-5">
                                        {statistiquesBarres.map((statistique) => (
                                            <div key={statistique.label}>
                                                <div className="mb-2 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 text-xs font-medium">
                                                        <span className="text-[color:var(--jse-theme-muted)]">{statistique.icon}</span>
                                                        {statistique.label}
                                                    </div>
                                                    <span className="text-xs font-semibold">{statistique.valeur}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-[#123C32]/10 dark:bg-white/[0.07]">
                                                    <div className="h-full rounded-full bg-[#45B977] transition-all duration-500" style={{ width: statistique.largeur + '%' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {statistiquesBarres.map((statistique) => (
                                            <div key={'mini-' + statistique.label} className="rounded-2xl border border-jse-theme-border bg-[color:var(--jse-theme-surface-soft)] p-3">
                                                <p className="text-[9px] leading-4 text-[color:var(--jse-theme-muted)]">{statistique.label}</p>
                                                <p className="mt-1 text-lg font-semibold">{statistique.valeur}</p>
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article id="commandes" className="rounded-[26px] border border-jse-theme-border bg-jse-theme-surface p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-base font-semibold">Commandes à surveiller</h2>
                                            <p className="mt-2 text-xs text-[color:var(--jse-theme-muted)]">Commandes encore en traitement.</p>
                                        </div>
                                        <span className="rounded-full bg-[#F28C28]/10 px-3 py-1.5 text-[10px] font-semibold text-[#F28C28]">{commandes.length}</span>
                                    </div>

                                    <div className="mt-5 max-h-[360px] space-y-2.5 overflow-auto pr-1">
                                        {commandes.length === 0 ? (
                                            <div className="flex min-h-[210px] items-center justify-center rounded-2xl border border-dashed border-jse-theme-border px-5 text-center text-xs text-[color:var(--jse-theme-muted)]">Aucune commande en attente de traitement.</div>
                                        ) : (
                                            commandes.map((commande) => {
                                                const motif = (motifsAnnulation[commande.id] || '').trim();
                                                const identifiant = 'annulation-' + commande.id;

                                                return (
                                                    <div key={commande.id} className="rounded-2xl border border-jse-theme-border bg-[color:var(--jse-theme-surface-soft)] p-3.5">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F28C28]/10 text-[#F28C28]"><Clock3 size={15} /></div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-xs font-semibold">{commande.reference || 'Commande #' + commande.id}</p>
                                                                        <p className="mt-1 truncate text-[10px] text-[color:var(--jse-theme-muted)]">{commande.restaurant || 'Restaurant'} · {commande.client || 'Client'}</p>
                                                                    </div>
                                                                    <span className="shrink-0 rounded-full bg-[#F28C28]/10 px-2 py-1 text-[9px] font-medium text-[#F28C28]">{commande.statut?.libelle || commande.statut?.code || 'En traitement'}</span>
                                                                </div>

                                                                <p className="mt-2 text-[10px] text-[color:var(--jse-theme-muted)]">{commande.zone || 'Zone non définie'} · {formatMontant(commande.montant_total)} FCFA</p>

                                                                <div className="mt-3 flex gap-2">
                                                                    <input
                                                                        value={motifsAnnulation[commande.id] || ''}
                                                                        onChange={(event) => setMotifsAnnulation((etat) => ({ ...etat, [commande.id]: event.target.value }))}
                                                                        placeholder="Motif d'annulation"
                                                                        className="min-w-0 flex-1 rounded-xl border border-jse-theme-border bg-jse-theme-surface px-3 py-2 text-[10px] text-jse-theme-text outline-none placeholder:text-[color:var(--jse-theme-muted)] focus:border-[#F28C28]"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        disabled={!motif || traitement === identifiant}
                                                                        onClick={() => annuler(commande)}
                                                                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-semibold text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        <AlertTriangle size={13} />
                                                                        {traitement === identifiant ? '...' : 'Annuler'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </article>
                            </section>

                            <section id="livraisons" className="mt-5 rounded-[26px] border border-jse-theme-border bg-jse-theme-surface p-5 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#45B977]/10 text-[#45B977]"><Truck size={17} /></span>
                                            <h2 className="text-base font-semibold">Livraisons actives</h2>
                                        </div>
                                        <p className="mt-2 text-xs text-[color:var(--jse-theme-muted)]">Suivi opérationnel et réattribution manuelle par zone.</p>
                                    </div>
                                    <span className="text-[10px] text-[color:var(--jse-theme-muted)]">{livraisons.length} livraison(s)</span>
                                </div>

                                {livraisons.length === 0 ? (
                                    <div className="mt-5 rounded-2xl border border-dashed border-jse-theme-border p-10 text-center text-xs text-[color:var(--jse-theme-muted)]">Aucune livraison active.</div>
                                ) : (
                                    <div className="mt-5 overflow-x-auto">
                                        <div className="min-w-[850px]">
                                            <div className="grid grid-cols-[1.1fr_0.75fr_1fr_1.5fr_auto] items-center gap-4 border-b border-jse-theme-border px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--jse-theme-muted)]">
                                                <span>Commande</span>
                                                <span>Statut</span>
                                                <span>Livreur actuel</span>
                                                <span>Réattribution</span>
                                                <span />
                                            </div>

                                            <div className="divide-y divide-[color:var(--jse-theme-border)]">
                                                {livraisons.map((livraison) => {
                                                    const candidats = livreurs.filter((livreur) => livreur.zone_id === livraison.zone_id);

                                                    const statut = livraison.statut === 'en_cours'
                                                        ? { label: 'En cours', icon: <PackageCheck size={13} />, classe: 'text-[#45B977] bg-[#45B977]/10' }
                                                        : livraison.statut === 'attribuee'
                                                          ? { label: 'Attribuée', icon: <Truck size={13} />, classe: 'text-[#F28C28] bg-[#F28C28]/10' }
                                                          : { label: 'En attente', icon: <Clock3 size={13} />, classe: 'text-[color:var(--jse-theme-muted)] bg-[#123C32]/5 dark:bg-white/5' };

                                                    return (
                                                        <div key={livraison.id} className="grid grid-cols-[1.1fr_0.75fr_1fr_1.5fr_auto] items-center gap-4 px-3 py-4">
                                                            <div>
                                                                <p className="text-xs font-semibold">{livraison.reference || 'Livraison #' + livraison.id}</p>
                                                                <p className="mt-1 text-[10px] text-[color:var(--jse-theme-muted)]">Zone : {livraison.zone || 'Non définie'}</p>
                                                            </div>

                                                            <span className={'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-medium ' + statut.classe}>
                                                                {statut.icon}
                                                                {statut.label}
                                                            </span>

                                                            <div>
                                                                <p className="text-xs font-medium">{livraison.livreur || 'Non attribué'}</p>
                                                                <p className="mt-1 text-[9px] text-[color:var(--jse-theme-muted)]">Zone opérationnelle</p>
                                                            </div>

                                                            <div className="grid grid-cols-[1fr_1fr] gap-2">
                                                                <select
                                                                    value={selection[livraison.id] || ''}
                                                                    onChange={(event) => setSelection((etat) => ({ ...etat, [livraison.id]: event.target.value }))}
                                                                    className="min-w-0 rounded-xl border border-jse-theme-border bg-[color:var(--jse-theme-surface-soft)] px-3 py-2 text-[10px] text-jse-theme-text outline-none focus:border-[#45B977]"
                                                                >
                                                                    <option value="">Choisir un livreur</option>
                                                                    {candidats.map((livreur) => (
                                                                        <option key={livreur.id} value={livreur.id}>{livreur.nom} — {livreur.disponibilite || 'indisponible'}</option>
                                                                    ))}
                                                                </select>

                                                                <input
                                                                    value={motifs[livraison.id] || ''}
                                                                    onChange={(event) => setMotifs((etat) => ({ ...etat, [livraison.id]: event.target.value }))}
                                                                    placeholder="Motif"
                                                                    className="min-w-0 rounded-xl border border-jse-theme-border bg-[color:var(--jse-theme-surface-soft)] px-3 py-2 text-[10px] text-jse-theme-text outline-none placeholder:text-[color:var(--jse-theme-muted)] focus:border-[#45B977]"
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                disabled={!selection[livraison.id] || !motifs[livraison.id]?.trim() || traitement === livraison.id}
                                                                onClick={() => reattribuer(livraison.id)}
                                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#45B977] px-3 py-2 text-[10px] font-semibold text-[#123C32] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <RefreshCw size={13} className={traitement === livraison.id ? 'animate-spin' : ''} />
                                                                Réattribuer
                                                            </button>

                                                            {candidats.length === 0 && (
                                                                <div className="col-span-full flex items-center gap-2 rounded-xl bg-[#F28C28]/10 px-3 py-2 text-[10px] text-[#A9530A] dark:text-[#F6A04A]">
                                                                    <AlertTriangle size={13} />
                                                                    Aucun livreur actif n'est disponible dans cette zone.
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <footer className="mt-5 flex flex-col gap-2 pb-3 text-[9px] text-[color:var(--jse-theme-muted)] sm:flex-row sm:items-center sm:justify-between">
                                <span>JSE Express · Administration opérationnelle</span>
                                <span>Design system JSE · Poppins · Rounded Geometric</span>
                            </footer>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
