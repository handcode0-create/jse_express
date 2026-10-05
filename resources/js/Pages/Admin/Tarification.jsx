import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";
import { entetesJson } from "../../lib/csrf";

export default function Tarification({ utilisateur, tarifs = [], restaurants = [] }) {
    const [resultat, setResultat] = useState(null);
    const [simulation, setSimulation] = useState({ restaurant_id: restaurants[0]?.id || "", latitude: "", longitude: "", distance_km: "" });
    const [form, setForm] = useState({ distance_min_km: "", distance_max_km: "", frais: "" });

    const simuler = async (event) => {
        event.preventDefault();
        const response = await fetch("/administration/tarification/simuler", {
            method: "POST",
            credentials: "same-origin",
            headers: entetesJson(),
            body: JSON.stringify(simulation),
        });
        const data = await response.json().catch(() => ({}));
        setResultat(response.ok ? data : { erreur: data.message || "Simulation impossible." });
    };

    return <AdminDataPage utilisateur={utilisateur} title="Tarification" description="Tranches de livraison calculées par distance.">
        <section className="grid gap-5 lg:grid-cols-2">
            <form onSubmit={e=>{e.preventDefault();router.post("/administration/tarification",form,{preserveScroll:true,onSuccess:()=>setForm({distance_min_km:"",distance_max_km:"",frais:""})})}} className="jse-admin-card rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte">
                <h2 className="font-semibold">Ajouter une tranche</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {["distance_min_km","distance_max_km","frais"].map(name=><input key={name} required type="number" min="0" step="0.01" value={form[name]} onChange={e=>setForm({...form,[name]:e.target.value})} placeholder={name.replaceAll("_"," ")} className="jse-admin-input min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm outline-none"/>)}
                </div>
                <button className="mt-4 min-h-11 rounded-full bg-jse-principal px-5 text-sm font-semibold text-white">Ajouter</button>
            </form>
            <form onSubmit={simuler} className="jse-admin-card rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte">
                <h2 className="font-semibold">Simulateur serveur</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <select value={simulation.restaurant_id} onChange={e=>setSimulation({...simulation,restaurant_id:e.target.value})} className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"><option value="">Restaurant</option>{restaurants.map(r=><option key={r.id} value={r.id}>{r.nom}</option>)}</select>
                    <input type="number" min="0" step="0.01" value={simulation.distance_km} onChange={e=>setSimulation({...simulation,distance_km:e.target.value})} placeholder="Distance km (optionnel)" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                    <input type="number" step="0.0000001" value={simulation.latitude} onChange={e=>setSimulation({...simulation,latitude:e.target.value})} placeholder="Latitude client" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                    <input type="number" step="0.0000001" value={simulation.longitude} onChange={e=>setSimulation({...simulation,longitude:e.target.value})} placeholder="Longitude client" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                </div>
                <button className="mt-4 min-h-11 rounded-full bg-jse-secondaire px-5 text-sm font-semibold text-white">Simuler</button>
                {resultat && <p className="mt-4 text-sm">{resultat.erreur || (resultat.distance_km+" km — "+resultat.frais+" FCFA")}</p>}
            </form>
        </section>
        <section className="mt-5 grid gap-3">
            {tarifs.map(t=><article key={t.id} className="jse-admin-card rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface p-4">
                <form onSubmit={e=>{e.preventDefault();router.patch("/administration/tarification/"+t.id,{distance_min_km:e.currentTarget.distance_min_km.value,distance_max_km:e.currentTarget.distance_max_km.value,frais:e.currentTarget.frais.value},{preserveScroll:true})}} className="grid gap-3 sm:grid-cols-4">
                    <input name="distance_min_km" defaultValue={t.distance_min_km} type="number" min="0" step="0.01" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                    <input name="distance_max_km" defaultValue={t.distance_max_km} type="number" min="0" step="0.01" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                    <input name="frais" defaultValue={t.frais} type="number" min="0" step="0.01" className="min-h-11 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-sm"/>
                    <div className="flex gap-2"><button className="min-h-11 flex-1 rounded-full bg-jse-principal px-4 text-sm font-semibold text-white">Enregistrer</button><button type="button" onClick={()=>router.post("/administration/tarification/"+t.id+"/statut",{}, {preserveScroll:true})} className="min-h-11 rounded-full border border-jse-theme-border px-4 text-sm font-semibold">{t.statut==="actif"?"Désactiver":"Activer"}</button></div>
                </form>
            </article>)}
        </section>
    </AdminDataPage>;
}