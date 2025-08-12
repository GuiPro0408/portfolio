"use client";

import * as React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useDisclosure } from "./utils";

/**
 * Button that asks for confirmation before submitting a delete form.
 * Keeps form contract intact via hidden `id` field and programmatic submit.
 */
export function DeleteWithConfirm({ id, action, label = "Delete", color = "error" as const }: {
    id: string | number;
    action: (formData: FormData) => void;
    label?: string;
    color?: "error" | "warning" | "primary" | "secondary" | "info" | "success" | "inherit";
}) {
    const { open, on, off } = useDisclosure(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    return (
        <>
            <Box component="form" ref={formRef} action={action} sx={{ display: "inline" }}>
                <input type="hidden" name="id" value={String(id)} />
                <Button variant="outlined" color={color} onClick={(e) => { e.preventDefault(); on(); }}>
                    {label}
                </Button>
            </Box>

            {open ? (
                <Paper variant="outlined" sx={{ mt: 1.5, p: 2, borderColor: "warning.light", bgcolor: "warning.50" }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Confirm deletion?</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This action cannot be undone.
                    </Typography>
                    <Stack direction="row" gap={1}>
                        <Button onClick={off}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => { formRef.current?.requestSubmit(); off(); }}
                        >
                            Delete permanently
                        </Button>
                    </Stack>
                </Paper>
            ) : null}
        </>
    );
}


