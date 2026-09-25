import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Camera, Check, LoaderCircle } from "lucide-react";

const MAX_UPLOAD_BYTES = 800 * 1024;
const MAX_DIMENSION = 1400;

function compresserPhoto(fichier) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(fichier);

        image.onload = () => {
            URL.revokeObjectURL(url);

            const ratio = Math.min(
                1,
                MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
            );

            const largeur = Math.max(1, Math.round(image.naturalWidth * ratio));
            const hauteur = Math.max(1, Math.round(image.naturalHeight * ratio));

            const canvas = document.createElement("canvas");
            canvas.width = largeur;
            canvas.height = hauteur;

            const contexte = canvas.getContext("2d");
            if (!contexte) {
                reject(new Error("Impossible de préparer la photo."));
                return;
            }

            contexte.drawImage(image, 0, 0, largeur, hauteur);

            const produire = (qualite) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Impossible de préparer la photo."));
                            return;
                        }

                        if (blob.size <= MAX_UPLOAD_BYTES || qualite <= 0.55) {
                            const nom = (fichier.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
                            resolve(new File([blob], nom, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            }));
                            return;
                        }

                        produire(Math.max(0.55, qualite - 0.08));
                    },
                    "image/jpeg",
                    qualite,
                );
            };

            produire(0.86);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("La photo sélectionnée ne peut pas être lue."));
        };

        image.src = url;
    });
}

export default function PhotoProfil({ user, size = "size-20", className = "", dark = false }) {
    const inputRef = useRef(null);
    const [apercu, setApercu] = useState(null);
    const [message, setMessage] = useState("");

    const form = useForm({
        photo: null,
    });

    const nom = [user?.prenom, user?.nom].filter(Boolean).join(" ") || "JSE";
    const initiales =
        nom
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((partie) => partie[0]?.toUpperCase())
            .join("") || "J";

    useEffect(() => {
        return () => {
            if (apercu) URL.revokeObjectURL(apercu);
        };
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
            const photo = await compresserPhoto(fichierOriginal);
            const url = URL.createObjectURL(photo);

            setApercu((ancien) => {
                if (ancien) URL.revokeObjectURL(ancien);
                return url;
            });

            form.setData("photo", photo);
            form.post("/profil/photo", {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setMessage("Photo mise à jour.");
                    setApercu(null);
                    form.reset();
                },
                onError: (errors) => {
                    setMessage(
                        errors?.photo ||
                        "L'envoi de la photo a échoué. Vérifiez la taille du fichier.",
                    );
                    setApercu(null);
                    form.reset();
                },
            });
        } catch (error) {
            setMessage(error?.message || "Impossible de préparer la photo.");
        }
    };

    const source = apercu || user?.photo_profil;

    return (
        <div className={"relative shrink-0 " + size + " " + className}>
            <button
                type="button"
                onClick={choisir}
                disabled={form.processing}
                aria-label="Modifier la photo de profil"
                className={
                    "group relative size-full overflow-hidden rounded-full border-2 shadow-lg " +
                    (dark
                        ? "border-white/15 bg-jse-accent text-jse-principal"
                        : "border-white bg-jse-secondaire text-white")
                }
            >
                {source ? (
                    <img src={source} alt={nom} className="size-full object-cover" />
                ) : (
                    <span className="flex size-full items-center justify-center text-xl font-bold">
                        {initiales}
                    </span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition group-hover:bg-black/45">
                    {form.processing ? (
                        <div className="flex flex-col items-center gap-1">
                            <LoaderCircle size={18} className="animate-spin" />
                            {form.progress?.percentage ? (
                                <span className="text-[8px] font-semibold">
                                    {Math.round(form.progress.percentage)}%
                                </span>
                            ) : null}
                        </div>
                    ) : (
                        <Camera size={18} className="opacity-0 transition group-hover:opacity-100" />
                    )}
                </span>
            </button>

            <span className="pointer-events-none absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-[#101719] bg-jse-accent text-jse-principal shadow-md">
                {form.processing ? (
                    <LoaderCircle size={12} className="animate-spin" />
                ) : message === "Photo mise à jour." ? (
                    <Check size={12} />
                ) : (
                    <Camera size={12} />
                )}
            </span>

            {message && message !== "Photo mise à jour." && (
                <span className="absolute left-1/2 top-full z-20 mt-2 w-max max-w-52 -translate-x-1/2 rounded-lg border border-red-400/20 bg-[#101215] px-2.5 py-1.5 text-[8px] font-medium text-red-300 shadow-xl">
                    {message}
                </span>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={envoyer}
                className="hidden"
            />
        </div>
    );
}
