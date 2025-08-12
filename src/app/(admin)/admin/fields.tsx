"use client";

import * as React from "react";
import { Box, Stack, TextField, Autocomplete } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Multi-tag free-solo tech stack field.
 * Stores a hidden CSV input to preserve the server action contract.
 */
export const TechStackField = React.memo(function TechStackFieldImpl({ name, defaultValue }: { name: "techStack"; defaultValue?: string[] | string | null }) {
    const { control } = useFormContext();
    const initial = Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === "string" && defaultValue.trim() !== ""
            ? defaultValue.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={initial}
            render={({ field }: { field: { value: string[]; onChange: (v: string[]) => void } }) => (
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={(_e, v) => field.onChange(v as string[])}
                    renderInput={(params) => (
                        <TextField {...params} label="Tech Stack" placeholder="Add tech and press Enter" />
                    )}
                />
            )}
        />
    );
});

/**
 * URL text input with live preview when a valid image URL is detected.
 */
export const CoverImageField = React.memo(function CoverImageFieldImpl({ name, defaultValue = "" }: { name: "coverImage"; defaultValue?: string | null }) {
    const { register, watch } = useFormContext();
    const val = watch(name, defaultValue ?? "");
    const isImg = React.useMemo(
        () => typeof val === "string" && /^https?:\/\//.test(val) && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(val),
        [val]
    );
    return (
        <Stack gap={1}>
            <TextField
                {...register(name)}
                label="Cover Image URL"
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


