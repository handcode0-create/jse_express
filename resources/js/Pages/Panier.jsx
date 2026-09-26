import { router, usePage } from "@inertiajs/react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingBag, TicketPercent, Trash2, Bike } from "lucide-react";

const prix=(v)=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(Number(v||0));

export default function Panier(){
 const { panier={} }=usePage().props;
 const lignes=panier.lignes||[];
 const nombre=Number(panier.nombre_articles||0);
 const sousTotal=Number(panier.sous_total||0);
 const frais=Number(panier.frais_livraison||0);
 const total=Number(panier.montant_total||0);

 const modifier=(ligne,q)=>router.patch(`/panier/lignes/${ligne.id}`,{quantite:q},{preserveScroll:true});
 const supprimer=(ligne)=>router.delete(`/panier/lignes/${ligne.id}`,{preserveScroll:true});
 const commander=()=>router.visit("/commande/validation");

 return <main className="min-h-screen bg-jse-fond text-jse-texte">
  <div className="mx-auto flex min-h-screen w-full max-w-none">
   <SidebarJSE />
   <div className="min-w-0 flex-1">
    <div className="mx-auto min-h-screen w-full max-w-none px-5 pb-32 sm:px-8">
   <header className="flex items-center gap-4 pb-5 pt-7">
    <button type="button" onClick={()=>router.visit("/accueil")} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-jse-texte/5 text-jse-principal"><ArrowLeft size={23}/></button>
    <div><h1 className="font-against text-[2.5rem] leading-none text-jse-principal">Mon panier</h1><p className="mt-1 font-sans text-sm text-jse-texte/55">{nombre} produit{nombre>1?"s":""} dans votre panier</p></div>
   </header>

   {lignes.length===0 ? <section className="mt-12 rounded-[28px] bg-white px-6 py-16 text-center ring-1 ring-jse-texte/5">
    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire"><ShoppingBag size={30}/></div>
    <h2 className="mt-5 font-against text-2xl text-jse-principal">Votre panier est vide</h2>
    <p className="mt-2 font-sans text-sm text-jse-texte/50">Ajoutez un plat pour commencer votre commande.</p>
    <button type="button" onClick={()=>router.visit("/accueil")} className="mt-7 rounded-full bg-jse-principal px-7 py-3.5 font-sans text-sm font-bold text-white">Découvrir les restaurants</button>
   </section> : <>
    <section className="space-y-3">
     {lignes.map((ligne,index)=><article key={ligne.id} className="flex min-h-[184px] items-center gap-3 rounded-[25px] bg-white p-3.5 shadow-sm ring-1 ring-jse-texte/5">
      <img src={ligne.image || `https://images.unsplash.com/photo-${index%2===0?"1547592180-85f173990554":"1515003197210-e0cd71810b5f"}?auto=format&fit=crop&w=500&q=85`} alt={ligne.nom} className="h-[138px] w-[126px] shrink-0 rounded-[19px] object-cover"/>
      <div className="flex min-w-0 flex-1 flex-col self-stretch py-1">
       <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-sans text-base font-extrabold text-jse-principal">{ligne.nom}</h2><p className="mt-1 truncate font-sans text-sm text-jse-texte/55">{ligne.restaurant_nom||"Restaurant"}</p>{ligne.options?.length > 0 && <p className="mt-2 line-clamp-2 font-sans text-[10px] leading-4 text-jse-texte/45">{ligne.options.map((option) => option.groupe ? `${option.groupe} : ${option.nom}` : option.nom).join(" · ")}</p>}</div>
       <button type="button" onClick={()=>supprimer(ligne)} aria-label="Supprimer" className="flex size-9 shrink-0 items-center justify-center rounded-full text-jse-texte/55 hover:bg-red-50 hover:text-red-500"><Trash2 size={21}/></button></div>
       <div className="mt-auto flex items-end justify-between gap-2"><p className="font-sans text-xl font-extrabold text-jse-principal">{prix(ligne.prix_unitaire)} <span className="text-sm">FCFA</span></p>
        <div className="flex h-12 items-center rounded-full bg-jse-fond p-1 ring-1 ring-jse-texte/8"><button type="button" disabled={ligne.quantite<=1} onClick={()=>modifier(ligne,Number(ligne.quantite)-1)} className="flex size-10 items-center justify-center rounded-full text-jse-principal disabled:opacity-30"><Minus size={19}/></button><span className="w-9 text-center font-sans font-bold text-jse-principal">{ligne.quantite}</span><button type="button" onClick={()=>modifier(ligne,Number(ligne.quantite)+1)} className="flex size-10 items-center justify-center rounded-full bg-jse-principal text-white"><Plus size={19}/></button></div>
       </div>
      </div>
     </article>)}
    </section>

    <section className="mt-4 rounded-[24px] bg-jse-secondaire/10 p-4">
     <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire"><TicketPercent size={25}/></span><div><p className="font-sans text-sm font-bold text-jse-principal">Code promo</p><p className="mt-1 font-sans text-xs text-jse-texte/50">Les codes promotionnels seront disponibles prochainement.</p></div></div>
    </section>

    <section className="mt-4 rounded-[25px] bg-white p-5 ring-1 ring-jse-texte/5">
     <h2 className="font-against text-2xl text-jse-principal">Récapitulatif</h2>
     <div className="mt-5 space-y-3 font-sans text-sm"><div className="flex justify-between"><span className="text-jse-texte/60">Sous-total</span><span>{prix(sousTotal)} FCFA</span></div><div className="flex justify-between"><span className="text-jse-texte/60">Frais de livraison</span><span>{prix(frais)} FCFA</span></div></div>
     <div className="my-5 border-t border-jse-texte/8"/>
     <div className="flex items-center justify-between"><span className="font-sans text-lg font-bold">Total</span><strong className="font-sans text-2xl font-extrabold text-jse-principal">{prix(total)} FCFA</strong></div>
     <div className="mt-5 flex items-center gap-3 rounded-[20px] bg-jse-secondaire/10 px-4 py-3.5"><Bike size={26} className="text-jse-secondaire"/><p className="font-sans text-xs text-jse-texte/60">Livraison selon la zone sélectionnée. <strong className="text-jse-principal">Frais de démonstration : 500 FCFA.</strong></p></div>
    </section>

    {panier.plusieurs_restaurants && <div className="mt-4 rounded-[20px] bg-jse-accent/10 px-4 py-3 font-sans text-xs text-jse-principal">Votre panier contient des produits de plusieurs restaurants. Une commande doit concerner un seul restaurant.</div>}

    <button type="button" disabled={panier.plusieurs_restaurants} onClick={commander} className="mt-5 flex h-[70px] w-full items-center rounded-full bg-jse-secondaire px-6 text-white shadow-xl shadow-jse-secondaire/20 disabled:cursor-not-allowed disabled:opacity-45"><span className="flex-1 text-left font-sans text-base font-bold sm:text-lg">Passer la commande</span><span className="border-l border-white/25 pl-5 font-sans text-base font-bold sm:text-lg">{prix(total)} FCFA</span><ChevronRight className="ml-3" size={24}/></button>
   </>}
    </div>
   </div>
  </div>
 </main>
}