/**
 * Two-column responsive grid layout for forms in admin.
 * - `xs`: single column
 * - `md+`: two columns
 */
export const twoColGridSx = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
    gap: 2,
} as const;

/**
 * Utility to span full width across both columns in `twoColGridSx`.
 */
export const fullSpanSx = { gridColumn: { md: "1 / span 2" } } as const;


