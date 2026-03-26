"use client";

export default function LoadingButton({
    loading,
    onClick,
    children,
}: {
    loading: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button 
            className="btn" 
            onClick={() => { if (!loading) onClick(); }}
            style={loading ? { opacity: 0.6, cursor: 'wait' } : {}}
        >
            {loading ? "Processing..." : children}
        </button>
    );
}
