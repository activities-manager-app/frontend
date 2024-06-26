"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {


    return (
        <div className="error">
            <h2>Something went wrong!</h2>
            <p>{ String(error) }</p>
        </div>
    );
}