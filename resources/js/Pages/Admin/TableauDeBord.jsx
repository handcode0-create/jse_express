import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import PhotoProfil from '../../Composants/Profil/PhotoProfil';
import ThemeToggle from '../../Composants/Interface/ThemeToggle';

export default function TableauDeBord({ statistiques = {}, livraisons = [], livreurs = [] }) {
    const [selection, setSelection] = useState({});
    const [motifs, setMotifs] = useState({});
    const [traitement, setTraitement] = useState(null);
    const { auth } = usePage().props;
    const utilisateur = auth?.user;
    const reattribuer = (livraisonId) => {
        const livreurId = selection[livraisonId];
        const motif = (motifs[livraisonId] || '').trim();
        if (!livreurId || !motif) return;

        setTraitement(livraisonId);
        router.post(`/administration/livraisons/${livraisonId}/reattribuer`, {
            livreur_id: livreurId,
            motif,
        }, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
    };

    const cartes = [
        ['Commandes actives', statistiques.commandes_actives ?? 0],
        ['Commandes livrées', statistiques.commandes_livrees ?? 0],
        ['Livraisons actives', statistiques.livraisons_actives ?? 0],
        ['Livreurs disponibles', statistiques.livreurs_disponibles ?? 0],
    ];

    return (
        <>
            <Head title="Administration — JSE Express" />
            <main className="min-h-screen bg-[#0B0D0E] px-5 py-8 text-white md:px-10">
                <div className="mx-auto max-w-none">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#45B977]">JSE Express</p>
                            <h1 className="mt-2 text-3xl font-semibold">Administration</h1>
                        </div>
                        <ThemeToggle />
                    </div>
                    <section className="mt-8 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                        <PhotoProfil user={utilisateur} size="size-16" dark />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold">Profil administrateur</p>
                            <p className="mt-1 text-[10px] text-white/45">{[utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Administrateur"}</p>
                            <p className="mt-1 text-[9px] text-white/30">Cliquez sur la photo pour la modifier · JPG, PNG ou WebP · 5 Mo maximum.</p>
                        </div>
                    </section>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cartes.map(([label, valeur]) => (
                            <section key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-sm text-white/55">{label}</p>
                                <p className="mt-2 text-3xl font-semibold">{valeur}</p>
                            </section>
                        ))}
                    </div>

                    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Livraisons actives</h2>
                                <p className="mt-1 text-xs text-white/45">Suivi opérationnel et réattribution manuelle par zone.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/45">
                                <Truck size={15} />
                                {livraisons.length} livraison(s)
                            </div>
                        </div>

                        {livraisons.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
                                Aucune livraison active.
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {livraisons.map((livraison) => {
                                    const candidats = livreurs.filter((livreur) => livreur.zone_id === livraison.zone_id);
                                    const statut = livraison.statut === 'en_cours'
                                        ? { label: 'En cours', icon: <PackageCheck size={14} />, classe: 'text-[#45B977] bg-[#45B977]/10' }
                                        : livraison.statut === 'attribuee'
                                            ? { label: 'Attribuée', icon: <Truck size={14} />, classe: 'text-[#F28C28] bg-[#F28C28]/10' }
                                            : { label: 'En attente', icon: <Clock3 size={14} />, classe: 'text-white/60 bg-white/5' };

                                    return (
                                        <div key={livraison.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_1fr_auto] xl:items-center">
                                                <div>
                                                    <p className="text-sm font-semibold">{livraison.reference || `Livraison #${livraison.id}`}</p>
                                                    <p className="mt-1 text-xs text-white/45">Zone : {livraison.zone || 'Non définie'}</p>
                                                </div>

                                                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${statut.classe}`}>
                                                    {statut.icon}
                                                    {statut.label}
                                                </span>

                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Livreur actuel</p>
                                                    <p className="mt-1 text-sm text-white/75">{livraison.livreur || 'Non attribué'}</p>
                                                </div>

                                                <div className="xl:text-right">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Action</p>
                                                    <p className="mt-1 text-xs text-white/45">Réattribuer si nécessaire</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                                                <select
                                                    value={selection[livraison.id] || ''}
                                                    onChange={(event) => setSelection((etat) => ({ ...etat, [livraison.id]: event.target.value }))}
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#45B977]"
                                                >
                                                    <option value="">Choisir un livreur de la zone</option>
                                                    {candidats.map((livreur) => (
                                                        <option key={livreur.id} value={livreur.id}>
                                                            {livreur.nom} — {livreur.disponibilite || 'indisponible'}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    value={motifs[livraison.id] || ''}
                                                    onChange={(event) => setMotifs((etat) => ({ ...etat, [livraison.id]: event.target.value }))}
                                                    placeholder="Motif de la réattribution"
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#45B977]"
                                                />

                                                <button
                                                    type="button"
                                                    disabled={!selection[livraison.id] || !motifs[livraison.id]?.trim() || traitement === livraison.id}
                                                    onClick={() => reattribuer(livraison.id)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#45B977] px-4 py-2.5 text-sm font-semibold text-[#123C32] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <RefreshCw size={15} className={traitement === livraison.id ? 'animate-spin' : ''} />
                                                    Réattribuer
                                                </button>
                                            </div>

                                            {candidats.length === 0 && (
                                                <p className="mt-3 flex items-center gap-2 text-xs text-[#F28C28]">
                                                    <AlertTriangle size={14} />
                                                    Aucun livreur actif n'est disponible dans cette zone.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
