import { initial } from "./chatUtils";

export default function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string; size?: number }) {
    const style = { width: size, height: size } as React.CSSProperties;
    if (!src) {
        return (
            <div
                className="rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold select-none"
                style={style}
            >
                {initial(name)}
            </div>
        );
    }
    return (
        <>
            <img
                src={src}
                alt={name || "avatar"}
                className="rounded-full object-cover"
                style={style}
                onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    const sib = el.nextElementSibling as HTMLDivElement | null;
                    if (sib) sib.style.display = "flex";
                }}
            />
            <div
                className="rounded-full bg-gray-200 text-gray-700 items-center justify-center font-semibold select-none"
                style={{ ...style, display: "none" }}
            >
                {initial(name)}
            </div>
        </>
    );
}
