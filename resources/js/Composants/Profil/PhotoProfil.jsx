import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { Camera, LoaderCircle } from "lucide-react";

export default function PhotoProfil({ user, size = "size-20", className = "", dark = false }) {
    const inputRef = useRef(null);
    const [chargement, setChargement] = useState(false);

    const nom = [user?.prenom, user?.nom].filter(Boolean).join(" ") || "JSE";
    const initiales = nom
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0]?.toUpperCase())
        .join("") || "J";

    const choisir = () => inputRef.current?.click();

    const envoyer = (event) => {
        const photo = event.target.files?.[0];
        event.target.value = "";
        if (!photo) return;

        setChargement(true);
        router.post(
            "/profil/photo",
            { photo },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    return (
        <div className={"relative shrink-0 " + size + " " + className}>
            <button
                type="button"
                onClick={choisir}
                disabled={chargement}
                aria-label="Modifier la photo de profil"
                className={"group relative size-full overflow-hidden rounded-full border-2 shadow-lg " + (dark ? "border-white/15 bg-jse-accent text-jse-principal" : "border-white bg-jse-secondaire text-white")}
            >
                {user?.photo_profil ? (
                    <img src={user.photo_profil} alt={nom} className="size-full object-cover" />
                ) : (
                    <span className="flex size-full items-center justify-center text-xl font-bold">
                        {initiales}
                    </span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition group-hover:bg-black/45">
                    {chargement ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <Camera size={18} className="opacity-0 transition group-hover:opacity-100" />
                    )}
                </span>
            </button>

            <span className="pointer-events-none absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-[#101719] bg-jse-accent text-jse-principal shadow-md">
                <Camera size={12} />
            </span>

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
