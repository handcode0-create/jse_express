import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Bike, Check, ChevronRight, MapPin, Phone, ShoppingBag } from "lucide-react";
import { useState } from "react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";

const prix=(v)=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(Number(v||0));

export default function CommandeValidation(){
 const { restaurant, zones=[], client={}, panier={}, flash={} }=usePage().props;
 const [zoneId,setZoneId]=useState(zones[0]?.id||"");
 const [adresse,setAdresse]=useState("");
 const [telephone,setTelephone]=useState(client.telephone||"");
 const [envoi,setEnvoi]=useState(false);
 const [erreur,setErreur]=useState("");

 const valider=(e)=>{e.preventDefault();setErreur("");setEnvoi(true);router.post("/commande",{zone_id:zoneId,adresse_livraison:adresse,telephone_livraison:telephone},{preserveScroll:true,onError:(errors)=>{setErreur(Object.values(errors||{})[0]||"Vérifiez les informations saisies.");setEnvoi(false);},onFinish:()=>setEnvoi(false)})};

 return <main className="min-h-screen bg-jse-fond text-jse-texte"><div className="mx-auto flex min-h-screen w-full max-w-[1440px]"><SidebarJSE /><div className="min-w-0 flex-1"><div className="mx-auto w-full max-w-[760px] px-5 pb-12 sm:px-8">
  <header className="flex items-center gap-4 pt-7"><button type="button" onClick={()=>router.visit("/panier")} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"><ArrowLeft size={23}/></button><div><h1 className="font-against text-[2.35rem] leading-none text-jse-principal">Finaliser</h1><p className="mt-1 font-sans text-sm text-jse-texte/55">Préparez votre livraison</p></div></header>

  <section className="mt-6 rounded-[26px] bg-white p-5 ring-1 ring-jse-texte/5"><div className="flex items-center gap-3"><div className="flex size-12 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire"><ShoppingBag size={23}/></div><div><p className="font-sans text-xs text-jse-texte/45">Restaurant</p><p className="font-sans text-base font-bold text-jse-principal">{restaurant?.nom}</p></div></div><div className="mt-4 space-y-2">{(panier.lignes||[]).map(l=><div key={l.id} className="flex justify-between font-sans text-sm"><span className="text-jse-texte/65">{l.nom} × {l.quantite}</span><span className="font-semibold">{prix(l.total)} FCFA</span></div>)}</div></section>

  <form onSubmit={valider} className="mt-4 space-y-4">
   <section className="rounded-[26px] bg-white p-5 ring-1 ring-jse-texte/5"><h2 className="font-against text-2xl text-jse-principal">Livraison</h2>
    <label className="mt-5 block font-sans text-xs font-semibold text-jse-principal">Zone</label><div className="relative mt-2"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-secondaire" size={19}/><select value={zoneId} onChange={e=>setZoneId(e.target.value)} required className="h-14 w-full appearance-none rounded-[18px] bg-jse-fond pl-11 pr-4 font-sans text-sm outline-none ring-1 ring-jse-texte/8">{zones.map(z=><option key={z.id} value={z.id}>{z.nom}</option>)}</select></div>
    <label className="mt-4 block font-sans text-xs font-semibold text-jse-principal">Adresse de livraison</label><textarea value={adresse} onChange={e=>setAdresse(e.target.value)} required rows={3} placeholder="Ex. Centre-ville, près de..." className="mt-2 w-full resize-none rounded-[18px] bg-jse-fond p-4 font-sans text-sm outline-none ring-1 ring-jse-texte/8 placeholder:text-jse-texte/35"/>
    <label className="mt-4 block font-sans text-xs font-semibold text-jse-principal">Téléphone</label><div className="relative mt-2"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-secondaire" size={18}/><input value={telephone} onChange={e=>setTelephone(e.target.value)} required className="h-14 w-full rounded-[18px] bg-jse-fond pl-11 pr-4 font-sans text-sm outline-none ring-1 ring-jse-texte/8"/></div>
   </section>
   <section className="rounded-[26px] bg-white p-5 ring-1 ring-jse-texte/5"><div className="flex justify-between font-sans text-sm"><span className="text-jse-texte/60">Sous-total</span><span>{prix(panier.sous_total)} FCFA</span></div><div className="mt-3 flex justify-between font-sans text-sm"><span className="text-jse-texte/60">Frais de livraison</span><span>500 FCFA</span></div><div className="my-4 border-t border-jse-texte/8"/><div className="flex justify-between"><strong className="font-sans text-lg">Total</strong><strong className="font-sans text-2xl text-jse-principal">{prix(panier.montant_total)} FCFA</strong></div></section>
   {erreur && <div className="rounded-[18px] bg-red-50 px-4 py-3 font-sans text-xs text-red-600">{erreur}</div>}
   <button disabled={envoi} type="submit" className="flex h-[68px] w-full items-center rounded-full bg-jse-secondaire px-6 text-white shadow-xl disabled:opacity-60"><span className="flex-1 text-left font-sans font-bold">{envoi?"Création de la commande...":"Confirmer la commande"}</span><ChevronRight size={24}/></button>
  </form>
 </div></div></div></main>
}