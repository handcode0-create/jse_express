import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Camera, LoaderCircle } from "lucide-react";
import PhotoProfil from "./PhotoProfil";

const MAX_UPLOAD_BYTES = 1500 * 1024;
const MAX_WIDTH = 1800;
const MAX_HEIGHT = 900;

function preparerCouverture(fichier) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(fichier);

        image.onload = () => {
            URL.revokeObjectURL(url);

            const ratio = Math.min(
                1,
                MAX_WIDTH / image.naturalWidth,
                MAX_HEIGHT / image.naturalHeight,
            );
            const largeur = Math.max(1, Math.round(image.naturalWidth * ratio));
            const hauteur = Math.max(1, Math.round(image.naturalHeight * ratio));

            const canvas = document.createElement("canvas");
            canvas.width = largeur;
            canvas.height = hauteur;
            const contexte = canvas.getContext("2d");

            if (!contexte) {
                reject(new Error("Impossible de préparer la couverture."));
                return;
            }

            contexte.drawImage(image, 0, 0, largeur, hauteur);

            const produire = (qualite) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Impossible de préparer la couverture."));
                        return;
                    }

                    if (blob.size <= MAX_UPLOAD_BYTES || qualite <= 0.55) {
                        resolve(new File(
                            [blob],
                            "couverture-profil.jpg",
                            { type: "image/jpeg", lastModified: Date.now() },
                        ));
                        return;
                    }

                    produire(Math.max(0.55, qualite - 0.08));
                }, "image/jpeg", qualite);
            };

            produire(0.86);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("L'image sélectionnée ne peut pas être lue."));
        };

        image.src = url;
    });
}

export default function CouvertureProfil({ user }) {
    const inputRef = useRef(null);
    const [apercu, setApercu] = useState(null);
    const [message, setMessage] = useState("");

    const form = useForm({ couverture: null });

    useEffect(() => () => {
        if (apercu) URL.revokeObjectURL(apercu);
    }, [apercu]);

    const choisir = () => {
        if (!form.processing) inputRef.current?.click();
    };

    const envoyer = async (event) => {
        const fichierOriginal = event.target.files?.[0];
        event.target.value = "";

        if (!fichierOriginal) return;
        setMessage("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(fichierOriginal.type)) {
            setMessage("Format accepté : JPG, PNG ou WebP.");
            return;
        }

        try {
            const couverture = await preparerCouverture(fichierOriginal);
            const url = URL.createObjectURL(couverture);

            setApercu((ancien) => {
                if (ancien) URL.revokeObjectURL(ancien);
                return url;
            });

            form.setData("couverture", couverture);
            form.post("/profil/couverture", {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setMessage("Couverture mise à jour.");
                    setApercu(null);
                    form.reset();
                },
                onError: (errors) => {
                    setMessage(errors?.couverture || "L'envoi de la couverture a échoué.");
                    setApercu(null);
                    form.reset();
                },
            });
        } catch (error) {
            setMessage(error?.message || "Impossible de préparer la couverture.");
        }
    };

    const source = apercu || user?.couverture_profil;

    return (
        <section className="relative -mx-4 overflow-hidden rounded-b-[34px] sm:-mx-6 lg:mx-0 lg:rounded-[34px]">
            <div className="relative h-[238px] overflow-hidden bg-[#123C32] sm:h-[270px]">
                {source ? (
                    <img
                        src={source}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(69,185,119,.38),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(242,140,40,.20),transparent_28%),linear-gradient(135deg,#123C32,#0B2520)]" />
                        <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10 bg-white/[0.035]" />
                        <div className="absolute -bottom-36 -left-16 size-80 rounded-full border border-jse-secondaire/15" />
                    </>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#123C32]/90" />

                <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                    <button
                        type="button"
                        onClick={choisir}
                        disabled={form.processing}
                        className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3.5 py-2.5 font-sans text-[10px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/40 active:scale-95"
                    >
                        {form.processing ? (
                            <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                            <Camera size={15} />
                        )}
                        {source ? "Modifier la couverture" : "Ajouter une couverture"}
                    </button>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4 sm:bottom-7 sm:left-8 sm:right-8">
                    <div className="relative">
                        <div className="rounded-full bg-[#123C32]/50 p-1.5 backdrop-blur-md">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-jse-accent/25 blur-xl" />
                                <div className="relative">
                                    <PhotoProfil user={user} size="size-[82px] sm:size-[92px]" className="border-white/30" dark />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="min-w-0 pb-1 text-white">
                        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
                            Profil JSE Express
                        </p>
                        <h1 className="mt-1 truncate font-against text-[1.8rem] leading-none sm:text-[2.1rem]">
                            {[user?.prenom, user?.nom].filter(Boolean).join(" ") || "Client JSE Express"}
                        </h1>
                        <p className="mt-1 font-sans text-[10px] text-white/70">
                            {user?.telephone || "Téléphone non renseigné"}
                        </p>
                    </div>
                </div>
            </div>

            {message && message !== "Couverture mise à jour." && (
                <p className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-red-300/20 bg-[#101719]/90 px-3 py-2 font-sans text-[9px] text-red-200 shadow-xl">
                    {message}
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={envoyer}
                className="hidden"
            />
        </section>
    );
}
