"use client";

import * as React from "react";

/**
 * Format a JS Date (or ISO string) to a value compatible with `input[type="datetime-local"]`.
 * @param date Date instance or ISO string.
 * @returns Formatted string in YYYY-MM-DDTHH:mm.
 */
export function formatDateTimeLocal(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/**
 * Create a URL-friendly slug from an arbitrary string.
 * - Lowercases, trims, removes quotes, replaces non-alphanumerics with dashes.
 * @param input Arbitrary string to slugify.
 * @returns Slugified string.
 */
export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Debounce any value; updates after `delay` ms without changes.
 * Useful to avoid filtering on every keystroke.
 * @param value Value to debounce.
 * @param delay Debounce delay in milliseconds (default 250ms).
 * @returns Debounced value that updates after inactivity.
 */
export function useDebouncedValue<T>(value: T, delay = 250) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

/**
 * Minimal disclosure state utility for simple confirm/expand UI.
 * @param initial Initial open state (default false).
 * @returns Stable handlers `{ open, on, off, toggle }`.
 */
export function useDisclosure(initial = false) {
    const [open, setOpen] = React.useState(initial);
    const on = React.useCallback(() => setOpen(true), []);
    const off = React.useCallback(() => setOpen(false), []);
    const toggle = React.useCallback(() => setOpen((v) => !v), []);
    return { open, on, off, toggle } as const;
}


