"use client";

import * as React from "react";

type Props = {
    name: string; // file input name, e.g. "coverFile"
    value?: string; // current URL
    onChangeUrl: (url: string | "") => void;
};

export default function ImageInput({ name, value, onChangeUrl }: Props) {
    const [preview, setPreview] = React.useState<string | "">(value ?? "");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { setPreview(value ?? ""); }, [value]);

    function onRemove() {
        onChangeUrl("");
        if (inputRef.current) inputRef.current.value = "";
        setPreview("");
    }

    return (
        <div className="space-y-2">
            <input ref={inputRef} type="file" name={name} accept="image/jpeg,image/png,image/webp" />
            {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Cover preview" className="max-h-36 rounded border" />
            ) : null}
            <div className="flex gap-2 text-sm">
                <button type="button" onClick={onRemove} className="underline">Remove</button>
            </div>
        </div>
    );
}


