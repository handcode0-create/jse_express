import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Camera, Check, LoaderCircle } from "lucide-react";

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

    const envoyer = (event) => {
        const photo = event.target.files?.[0];
        event.target.value = "";

        if (!photo) return;

        setMessage("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
            setMessage("Format non accepté.");
            return;
        }

        if (photo.size > 5 * 1024 * 1024) {
            setMessage("La photo dépasse 5 Mo.");
            return;
        }

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
                form.reset();
            },
            onError: (errors) => {
                setMessage(errors?.photo || "Impossible d'enregistrer la photo.");
                setApercu(null);
                form.reset();
            },
        });
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
                {form.processing ? <LoaderCircle size={12} className="animate-spin" /> : message === "Photo mise à jour." ? <Check size={12} /> : <Camera size={12} />}
            </span>

            {message && message !== "Photo mise à jour." && (
                <span className="absolute left-1/2 top-full z-20 mt-2 w-max max-w-48 -translate-x-1/2 rounded-lg border border-red-400/20 bg-[#101215] px-2.5 py-1.5 text-[8px] font-medium text-red-300 shadow-xl">
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
