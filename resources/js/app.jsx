import "../css/app.css";

import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ChargementPage } from "./Composants/Interface/EtatsChargement";

createInertiaApp({
    title: (title) => `${title} - JSE Express`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),

    setup({ el, App, props }) {
        createRoot(el).render(<Suspense fallback={<ChargementPage />}><App {...props} /></Suspense>);
    },

    progress: {
        color: "#45B977",
    },
});
