export default function Card({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card">
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
            <div style={{ marginTop: 10 }}>{children}</div>
        </div>
    );
}
