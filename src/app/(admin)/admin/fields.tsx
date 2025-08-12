"use client";

import * as React from "react";
import { Box, Stack, TextField, Autocomplete } from "@mui/material";

/**
 * Multi-tag free-solo tech stack field.
 * Stores a hidden CSV input to preserve the server action contract.
 */
export const TechStackField = React.memo(function TechStackFieldImpl({ name, defaultValue }: { name: string; defaultValue?: string[] | string | null }) {
    const initial = Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === "string" && defaultValue.trim() !== ""
            ? defaultValue.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
    const [tags, setTags] = React.useState<string[]>(initial);
    const onChange = React.useCallback((
        _event: React.SyntheticEvent,
        newValue: string[]
    ) => setTags(newValue), []);

    return (
        <>
            <Autocomplete multiple freeSolo options={[]} value={tags} onChange={onChange}
                renderInput={(params) => (
                    <TextField {...params} label="Tech Stack" placeholder="Add tech and press Enter" />
                )}
            />
            {/* Hidden input to keep server action API unchanged */}
            <input type="hidden" name={name} value={tags.join(", ")} />
        </>
    );
});

/**
 * URL text input with live preview when a valid image URL is detected.
 */
export const CoverImageField = React.memo(function CoverImageFieldImpl({ name, defaultValue = "" }: { name: string; defaultValue?: string | null }) {
    const [val, setVal] = React.useState(defaultValue ?? "");
    const isImg = React.useMemo(
        () => /^https?:\/\//.test(val) && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(val),
        [val]
    );
    return (
        <Stack gap={1}>
            <TextField
                name={name}
                label="Cover Image URL"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                fullWidth
                placeholder="https://…/cover.jpg"
            />
            {isImg ? (
                <Box sx={{ display: "grid", placeItems: "center", border: "1px dashed", borderColor: "divider", p: 1, borderRadius: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={val} alt="Cover preview" style={{ maxWidth: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8 }} />
                </Box>
            ) : null}
        </Stack>
    );
});


