export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="authentication">
            {children}
        </div>
    );
}