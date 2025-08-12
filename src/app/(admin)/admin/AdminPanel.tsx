"use client";

import * as React from "react";
import type { BlogPost, Project } from "@prisma/client";
import {
  createProject,
  updateProject,
  deleteProject,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./actions";
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete } from "@mui/material";
import { useFormStatus } from "react-dom";

// -----------------------------
// Utilities
// -----------------------------

function formatDateTimeLocal(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function useDisclosure(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const on = React.useCallback(() => setOpen(true), []);
  const off = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  return { open, on, off, toggle } as const;
}

// -----------------------------
// Reusable UI primitives
// -----------------------------

function SectionCard({ title, subtitle, actions, children }: {
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

function FormSubmitButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" disabled={pending} aria-live="polite">
      {pending ? "Saving…" : label}
    </Button>
  );
}

function DeleteWithConfirm({ id, action, label = "Delete", color = "error" as const }: {
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

function TitleSlugFields({ defaultTitle = "", defaultSlug = "" }: {
  defaultTitle?: string;
  defaultSlug?: string;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const initialAuto = !defaultSlug || slugify(defaultTitle) === defaultSlug;
  const [slug, setSlug] = React.useState(defaultSlug || slugify(defaultTitle));
  const [auto, setAuto] = React.useState(initialAuto);

  React.useEffect(() => {
    if (auto) setSlug(slugify(title));
  }, [title, auto]);

  return (
    <>
      <TextField
        name="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <TextField
        name="slug"
        label="Slug"
        value={slug}
        onChange={(e) => { setSlug(e.target.value); setAuto(false); }}
        required
        fullWidth
        helperText={auto ? "Auto-generated from title" : "Custom slug"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Copy slug">
                <IconButton aria-label="Copy slug" onClick={() => navigator.clipboard.writeText(slug)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    </>
  );
}

function TechStackField({ name, defaultValue }: { name: string; defaultValue?: string[] | string | null }) {
  const initial = Array.isArray(defaultValue)
    ? defaultValue
    : typeof defaultValue === "string" && defaultValue.trim() !== ""
      ? defaultValue.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const [tags, setTags] = React.useState<string[]>(initial);

  const onChange = (
    _event: React.SyntheticEvent,
    newValue: string[]
  ) => setTags(newValue);

  return (
    <>
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={tags}
        onChange={onChange}
        renderInput={(params) => (
          <TextField {...params} label="Tech Stack" placeholder="Add tech and press Enter" />
        )}
      />
      {/* Hidden input to keep server action API unchanged */}
      <input type="hidden" name={name} value={tags.join(", ")} />
    </>
  );
}

function CoverImageField({ name, defaultValue = "" }: { name: string; defaultValue?: string | null }) {
  const [val, setVal] = React.useState(defaultValue ?? "");
  const isImg = /^https?:\/\//.test(val) && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(val);
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
}

function SearchBar({ value, onChange, placeholder, extra }: {
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      {extra}
    </Stack>
  );
}

// -----------------------------
// Main Component
// -----------------------------

type Props = {
  projects: Project[];
  posts: BlogPost[];
};

type TabKey = "projects" | "blog";

export default function AdminPanel({ projects, posts }: Props) {
  const [tab, setTab] = React.useState<TabKey>("projects");

  // --- local filters/search
  const [qProjects, setQProjects] = React.useState("");
  const [onlyFeatured, setOnlyFeatured] = React.useState(false);
  const [qPosts, setQPosts] = React.useState("");
  const [onlyPublished, setOnlyPublished] = React.useState(false);

  const filteredProjects = React.useMemo(() => {
    const q = qProjects.trim().toLowerCase();
    return projects.filter((p) => {
      if (onlyFeatured && !p.featured) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.slug} ${p.summary ?? ""} ${(p.techStack ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, qProjects, onlyFeatured]);

  const filteredPosts = React.useMemo(() => {
    const q = qPosts.trim().toLowerCase();
    return posts.filter((p) => {
      if (onlyPublished && !p.publishedAt) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.slug} ${p.excerpt ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, qPosts, onlyPublished]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { md: "260px 1fr" }, gap: 3 }}>
      {/* Sidebar (desktop) / Top tabs (mobile) */}
      <Box>
        <Paper elevation={0} variant="outlined" sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 16 }}>
          <List subheader={<ListSubheader component="div">Resources</ListSubheader>}>
            <ListItemButton selected={tab === "projects"} onClick={() => setTab("projects")} sx={{ borderRadius: 1, mx: 1 }}>
              <ListItemText primary="Projects" />
              <Chip label={projects.length} size="small" sx={{ ml: 1 }} />
            </ListItemButton>
            <ListItemButton selected={tab === "blog"} onClick={() => setTab("blog")} sx={{ borderRadius: 1, mx: 1 }}>
              <ListItemText primary="Blog Posts" />
              <Chip label={posts.length} size="small" sx={{ ml: 1 }} />
            </ListItemButton>
          </List>
        </Paper>
        <Paper elevation={0} variant="outlined" sx={{ display: { xs: "block", md: "none" } }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab value="projects" label={`Projects (${projects.length})`} />
            <Tab value="blog" label={`Blog Posts (${posts.length})`} />
          </Tabs>
        </Paper>
      </Box>

      <Stack spacing={4} component="section">
        {tab === "projects" ? (
          <Stack spacing={4}>
            {/* Create Project */}
            <SectionCard title="Create Project" subtitle="Add a new portfolio entry">
              <Box
                component="form"
                action={createProject}
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
              >
                <TitleSlugFields />
                <TextField name="summary" label="Summary" multiline minRows={2} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                <TextField name="content" label="Content" multiline minRows={6} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                <TechStackField name="techStack" />

                <TextField name="repoUrl" label="Repository URL" placeholder="https://…" fullWidth />
                <TextField name="demoUrl" label="Demo URL" placeholder="https://…" fullWidth />
                <CoverImageField name="coverImage" />

                <FormControlLabel control={<Switch name="featured" />} label="Featured" />
                <Box sx={{ gridColumn: { md: "1 / span 2" } }}>
                  <FormSubmitButton label="Create" />
                </Box>
              </Box>
            </SectionCard>

            {/* Projects list */}
            <SectionCard
              title="All Projects"
              subtitle={`${filteredProjects.length} shown / ${projects.length} total`}
              actions={
                <FormControlLabel
                  control={<Switch checked={onlyFeatured} onChange={(e) => setOnlyFeatured(e.target.checked)} />}
                  label="Only featured"
                />
              }
            >
              <Stack gap={2}>
                <SearchBar value={qProjects} onChange={setQProjects} placeholder="Search projects (title, slug, tech)" />
                <Paper variant="outlined">
                  {filteredProjects.map((p, idx) => (
                    <Box key={p.id}>
                      <Accordion defaultExpanded={idx === 0} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 600 }}>{p.title}</Typography>
                          <Typography sx={{ ml: 1, color: "text.secondary", fontSize: 12 }}>/ {p.slug}</Typography>
                          {p.featured ? <Chip label="Featured" size="small" sx={{ ml: 1 }} /> : null}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Box
                              component="form"
                              action={updateProject}
                              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
                            >
                              <input type="hidden" name="id" value={p.id} />
                              <TitleSlugFields defaultTitle={p.title} defaultSlug={p.slug} />
                              <TextField name="summary" label="Summary" defaultValue={p.summary ?? ""} multiline minRows={2} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                              <TextField name="content" label="Content" defaultValue={p.content ?? ""} multiline minRows={6} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                              <TechStackField name="techStack" defaultValue={p.techStack ?? []} />
                              <TextField name="repoUrl" label="Repository URL" defaultValue={p.repoUrl ?? ""} fullWidth />
                              <TextField name="demoUrl" label="Demo URL" defaultValue={p.demoUrl ?? ""} fullWidth />
                              <CoverImageField name="coverImage" defaultValue={p.coverImage ?? ""} />
                              <FormControlLabel control={<Switch name="featured" defaultChecked={p.featured} />} label="Featured" />
                              <Box sx={{ gridColumn: { md: "1 / span 2" } }}>
                                <FormSubmitButton label="Save" />
                              </Box>
                            </Box>

                            <Divider />

                            <DeleteWithConfirm id={p.id} action={deleteProject} />
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                      {idx < filteredProjects.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                  {filteredProjects.length === 0 ? (
                    <Typography sx={{ p: 2 }} color="text.secondary">No projects match your filters.</Typography>
                  ) : null}
                </Paper>
              </Stack>
            </SectionCard>
          </Stack>
        ) : (
          <Stack spacing={4}>
            {/* Create Post */}
            <SectionCard title="Create Blog Post" subtitle="Publish a new article">
              <Box
                component="form"
                action={createBlogPost}
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
              >
                <TitleSlugFields />
                <TextField name="excerpt" label="Excerpt" required multiline minRows={2} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                <TextField name="content" label="Content" required multiline minRows={6} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                <CoverImageField name="coverImage" />
                <DateTimeNowField name="publishedAt" label="Published At" defaultNow />
                <Box sx={{ gridColumn: { md: "1 / span 2" } }}>
                  <FormSubmitButton label="Create" />
                </Box>
              </Box>
            </SectionCard>

            {/* Posts list */}
            <SectionCard
              title="All Posts"
              subtitle={`${filteredPosts.length} shown / ${posts.length} total`}
              actions={
                <FormControlLabel
                  control={<Switch checked={onlyPublished} onChange={(e) => setOnlyPublished(e.target.checked)} />}
                  label="Only published"
                />
              }
            >
              <Stack gap={2}>
                <SearchBar value={qPosts} onChange={setQPosts} placeholder="Search posts (title, slug, excerpt)" />
                <Paper variant="outlined">
                  {filteredPosts.map((post, idx) => (
                    <Box key={post.id}>
                      <Accordion defaultExpanded={idx === 0} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 600 }}>{post.title}</Typography>
                          <Typography sx={{ ml: 1, color: "text.secondary", fontSize: 12 }}>/ {post.slug}</Typography>
                          {post.publishedAt ? (
                            <Chip label="Published" size="small" sx={{ ml: 1 }} />
                          ) : (
                            <Chip label="Draft" size="small" color="warning" sx={{ ml: 1 }} />
                          )}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Box
                              component="form"
                              action={updateBlogPost}
                              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
                            >
                              <input type="hidden" name="id" value={post.id} />
                              <TitleSlugFields defaultTitle={post.title} defaultSlug={post.slug} />
                              <TextField name="excerpt" label="Excerpt" defaultValue={post.excerpt ?? ""} multiline minRows={2} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                              <TextField name="content" label="Content" defaultValue={post.content ?? ""} multiline minRows={6} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }} />
                              <CoverImageField name="coverImage" defaultValue={post.coverImage ?? ""} />
                              <DateTimeNowField
                                name="publishedAt"
                                label="Published At"
                                defaultValue={post.publishedAt ? formatDateTimeLocal(post.publishedAt) : ""}
                              />
                              <Box sx={{ gridColumn: { md: "1 / span 2" } }}>
                                <FormSubmitButton label="Save" />
                              </Box>
                            </Box>

                            <Divider />

                            <DeleteWithConfirm id={post.id} action={deleteBlogPost} />
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                      {idx < filteredPosts.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                  {filteredPosts.length === 0 ? (
                    <Typography sx={{ p: 2 }} color="text.secondary">No posts match your filters.</Typography>
                  ) : null}
                </Paper>
              </Stack>
            </SectionCard>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

// -----------------------------
// Small field helpers
// -----------------------------

function DateTimeNowField({ name, label, defaultNow = false, defaultValue = "" }: {
  name: string;
  label: string;
  defaultNow?: boolean;
  defaultValue?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const init = React.useMemo(() => (defaultNow ? formatDateTimeLocal(new Date()) : defaultValue), [defaultNow, defaultValue]);

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
        <Button size="small" onClick={() => { if (inputRef.current) inputRef.current.value = formatDateTimeLocal(new Date()); }}>
          Set to now
        </Button>
        {defaultValue ? (
          <Button size="small" onClick={() => { if (inputRef.current) inputRef.current.value = ""; }}>
            Clear
          </Button>
        ) : null}
      </Box>
    </Stack>
  );
}
