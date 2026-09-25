import React from 'react';
import { Head } from '@inertiajs/react';

export default function TableauDeBord({ statistiques = [] }) {
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
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#45B977]">JSE Express</p>
                    <h1 className="mt-2 text-3xl font-semibold">Administration</h1>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cartes.map(([label, valeur]) => (
                            <section key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-sm text-white/55">{label}</p>
                                <p className="mt-2 text-3xl font-semibold">{valeur}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
