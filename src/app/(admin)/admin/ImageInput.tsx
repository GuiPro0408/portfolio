"use client";

import * as React from "react";
import { Stack, Button, Paper, Typography, Box, IconButton, Chip } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Props = {
    name: string; // file input name, e.g. "coverFile"
    value?: string; // current URL
    onChangeUrl: (url: string | "") => void;
};

export default function ImageInput({ name, value, onChangeUrl }: Props) {
    const [preview, setPreview] = React.useState<string | "">(value ?? "");
    const [error, setError] = React.useState<string>("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const objectUrlRef = React.useRef<string | null>(null);

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED = React.useMemo(() => new Set(["image/jpeg", "image/png", "image/webp"]), []);

    React.useEffect(() => { setPreview(value ?? ""); }, [value]);

    React.useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    function clearObjectUrl() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    }

    function onRemove() {
        onChangeUrl("");
        if (inputRef.current) inputRef.current.value = "";
        setPreview("");
        clearObjectUrl();
        setError("");
    }

    function setFileIntoInput(file: File) {
        // Place the dropped/selected file into the hidden input for form submission
        if (!inputRef.current) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
    }

    function handleFile(file: File) {
        setError("");
        if (!ALLOWED.has(file.type)) {
            setError("Only JPG, PNG, or WebP are allowed.");
            return;
        }
        if (file.size > MAX_SIZE) {
            setError("File too large. Max 5MB.");
            return;
        }
        clearObjectUrl();
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreview(url);
        setFileIntoInput(file);
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        handleFile(file);
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <Stack gap={1}>
            <Paper
                variant="outlined"
                sx={{ p: 2, borderStyle: "dashed", textAlign: "center", position: "relative" }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                onDrop={onDrop}
            >
                <Stack gap={1} alignItems="center">
                    <CloudUploadIcon fontSize="large" />
                    <Typography variant="body2" color="text.secondary">
                        Drag & drop an image here, or
                    </Typography>
                    <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} aria-label="Choose image file">
                        Choose image
                        <input ref={inputRef} hidden type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                    </Button>
                    <Typography variant="caption" color="text.secondary">JPG, PNG, WebP up to 5MB.</Typography>
                </Stack>
                {preview ? (
                    <Box sx={{ mt: 2, position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Image preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }} />
                        <IconButton aria-label="Remove image" onClick={onRemove} size="small" sx={{ position: "absolute", top: 8, right: 8, bgcolor: "background.paper" }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                        <Box sx={{ mt: 0.5 }}>
                            {value && preview === value ? (
                                <Chip size="small" label="Using existing image" sx={{ mr: 1 }} />
                            ) : (
                                <Chip size="small" color="primary" label="New image will upload on save" sx={{ mr: 1 }} />
                            )}
                            {error ? <Chip size="small" color="error" label={error} /> : null}
                        </Box>
                    </Box>
                ) : error ? (
                    <Box sx={{ mt: 1 }}>
                        <Chip size="small" color="error" label={error} />
                    </Box>
                ) : null}
            </Paper>
        </Stack>
    );
}


