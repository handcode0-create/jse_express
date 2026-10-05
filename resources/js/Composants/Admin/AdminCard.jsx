/** Surface standard de l'administration (bordure, fond et ombre issus des tokens de thème). */
export default function AdminCard({ as: Balise = "section", className = "", children, ...props }) {
    return (
        <Balise
            className={[
                "jse-admin-card min-w-0 rounded-3xl border border-jse-theme-border bg-jse-theme-surface shadow-jse-carte",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </Balise>
    );
}
