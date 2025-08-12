"use client";

import * as React from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Tooltip,
} from "@mui/material";
import { useForm, useFormContext } from "react-hook-form";
import { projectInputSchema, type ProjectInput, blogPostInputSchema, type BlogPostInput } from "@/lib/validation";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import { slugify, formatDateTimeLocal } from "./utils";
import { useFormStatus } from "react-dom";
import { ZodError } from "zod";

/**
 * Simple card wrapper with a header area for title, optional subtitle, and right-aligned actions.
 * Keeps consistent spacing and border styling across admin sections.
 */
export function SectionCard({ title, subtitle, actions, children }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                    {subtitle ? (
                        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
                    ) : null}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>
            </Stack>
            {children}
        </Paper>
    );
}

/**
 * Submit button that reflects React Server Actions `pending` state.
 * @param label Optional label (default: "Save").
 */
export function FormSubmitButton({ label = "Save" }: { label?: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="contained" disabled={pending} aria-live="polite">
            {pending ? "Saving…" : label}
        </Button>
    );
}

/**
 * Compound field for title + slug, with automatic slug generation and copy helper.
 * Memoized to avoid unnecessary re-renders in lists.
 */
export const TitleSlugFields = React.memo(function TitleSlugFieldsImpl({ defaultTitle = "", defaultSlug = "" }: {
    defaultTitle?: string;
    defaultSlug?: string;
}) {
    const form = useFormContext();
    const {
        formState: { errors },
        setValue,
        watch,
    } = form;
    const title = watch("title");
    const slug = watch("slug");
    const initialAuto = !defaultSlug || slugify(defaultTitle) === defaultSlug;
    const [auto, setAuto] = React.useState(initialAuto);

    React.useEffect(() => {
        if (!auto) return;
        const next = slugify(title || "");
        if (next && next !== slug) {
            setValue("slug", next, { shouldDirty: true });
        }
    }, [title, slug, auto, setValue]);

    const copySlug = React.useCallback(() => navigator.clipboard.writeText(slug), [slug]);

    return (
        <>
            <TextField
                {...form.register("title")}
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message as string | undefined}
                inputProps={{ "aria-invalid": !!errors.title }}
            />
            <TextField
                {...form.register("slug")}
                label="Slug"
                fullWidth
                error={!!errors.slug}
                helperText={(errors.slug?.message as string | undefined) ?? (auto ? "Auto-generated from title" : "Custom slug")}
                inputProps={{ "aria-invalid": !!errors.slug }}
                InputLabelProps={{
                    shrink: !!slug || auto
                }}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button
                                    size="small"
                                    onClick={() => setAuto(!auto)}
                                    sx={{ mr: 1 }}
                                >
                                    {auto ? "Manual" : "Auto"}
                                </Button>
                                <Tooltip title="Copy slug">
                                    <IconButton aria-label="Copy slug" onClick={copySlug}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </>
    );
});

// -----------------------------
// Custom resolver that catches ZodError and converts to field errors
// -----------------------------

function safeZodResolver<T>(schema: { parseAsync: (values: T) => Promise<T> }) {
    return async (values: T) => {
        try {
            const result = await schema.parseAsync(values);
            return { values: result, errors: {} };
        } catch (error) {
            if (error instanceof ZodError) {
                const fieldErrors: Record<string, { message: string }> = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    fieldErrors[path] = { message: issue.message };
                });
                return { values: {}, errors: fieldErrors };
            }
            throw error;
        }
    };
}

// -----------------------------
// RHF helpers for Admin forms
// -----------------------------

export function useProjectForm(defaultValues?: Partial<ProjectInput>) {
    const form = useForm<ProjectInput>({
        resolver: safeZodResolver(projectInputSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            summary: "",
            techStack: [],
            featured: false,
            ...defaultValues,
        },
    });
    return form;
}

export function useBlogPostForm(defaultValues?: Partial<BlogPostInput>) {
    const form = useForm<BlogPostInput>({
        resolver: safeZodResolver(blogPostInputSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            publishedAt: new Date(),
            ...defaultValues,
        },
    });
    return form;
}

/**
 * Lightweight search bar with optional right-aligned extra control(s).
 */
export function SearchBar({ value, onChange, placeholder, extra }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    extra?: React.ReactNode;
}) {
    return (
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems={{ sm: "center" }}>
            <TextField
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            {extra}
        </Stack>
    );
}

/**
 * Datetime-local input with handy "Set to now" and optional "Clear" actions.
 * Accepts default value or auto-fills with current time.
 */
export function DateTimeNowField({ name, label, defaultNow = false, defaultValue = "" }: {
    name: string;
    label: string;
    defaultNow?: boolean;
    defaultValue?: string;
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const init = React.useMemo(() => (defaultNow ? formatDateTimeLocal(new Date()) : defaultValue), [defaultNow, defaultValue]);

    const setToNow = React.useCallback(() => {
        if (inputRef.current) inputRef.current.value = formatDateTimeLocal(new Date());
    }, []);

    const clearValue = React.useCallback(() => {
        if (inputRef.current) inputRef.current.value = "";
    }, []);

    return (
        <Stack gap={1}>
            <TextField
                inputRef={inputRef}
                name={name}
                label={label}
                type="datetime-local"
                defaultValue={init}
                fullWidth
            />
            <Box>
                <Button size="small" onClick={setToNow}>
                    Set to now
                </Button>
                {defaultValue ? (
                    <Button size="small" onClick={clearValue}>
                        Clear
                    </Button>
                ) : null}
            </Box>
        </Stack>
    );
}


