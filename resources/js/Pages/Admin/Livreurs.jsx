import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Livreurs({ utilisateur, livreurs = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const basculer = (livreur) => {
        setTraitement(livreur.id);
        router.post("/administration/livreurs/" + livreur.id + "/disponibilite", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };
    return <AdminDataPage utilisateur={utilisateur} title="Livreurs" description="Matricules, zones, disponibilité et activité des livreurs." actionLabel="Nouveau livreur" actionHref="/administration/utilisateurs?nouveau=livreur" search={recherche} searchPlaceholder="Nom, matricule ou téléphone" rows={livreurs.data || []} pagination={livreurs} columns={[
        { key: "nom", label: "Livreur" },
        { key: "matricule", label: "Matricule", render: row => <span className="font-semibold text-jse-secondaire">{row.matricule || "—"}</span> },
        { key: "telephone", label: "Téléphone" },
        { key: "zone", label: "Zone" },
        { key: "disponibilite", label: "Disponibilité", render: row => <span className={row.disponibilite === "disponible" ? "text-jse-secondaire" : "text-jse-theme-muted"}>{row.disponibilite || "—"}</span> },
        { key: "livraisons_count", label: "Livraisons actives" },
        { key: "actions", label: "Action", render: row => <button type="button" onClick={() => basculer(row)} disabled={traitement === row.id} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-jse-principal sm:w-auto sm:rounded-full px-4 text-xs font-semibold text-white disabled:opacity-50"><Power size={15} />{traitement === row.id ? "..." : row.disponibilite === "disponible" ? "Indisponible" : "Disponible"}</button> },
    ]} emptyMessage="Aucun livreur trouvé." />;
}