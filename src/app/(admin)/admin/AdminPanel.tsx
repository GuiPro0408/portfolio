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
import { Box, Paper, List, ListItemButton, ListItemText, ListSubheader, Stack, Typography, TextField, Divider, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Switch, Chip, Tabs, Tab } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { twoColGridSx, fullSpanSx } from "./styles";
import { useDebouncedValue, formatDateTimeLocal } from "./utils";
import { SectionCard, FormSubmitButton, TitleSlugFields, SearchBar, DateTimeNowField, useProjectForm, useBlogPostForm } from "./components";
import { TechStackField, CoverImageField } from "./fields";
import { DeleteWithConfirm } from "./delete";
import { FormProvider } from "react-hook-form";

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

  // debounce keystrokes
  const dqProjects = useDebouncedValue(qProjects, 250);
  const dqPosts = useDebouncedValue(qPosts, 250);

  // build search index once per data change
  const projectsIdx = React.useMemo<(Project & { _hay: string })[]>(
    () =>
      projects.map((p) => ({
        ...p,
        _hay: `${p.title} ${p.slug} ${p.summary ?? ""} ${(p.techStack ?? []).join(" ")}`.toLowerCase(),
      })),
    [projects]
  );

  const postsIdx = React.useMemo<(BlogPost & { _hay: string })[]>(
    () =>
      posts.map((p) => ({
        ...p,
        _hay: `${p.title} ${p.slug} ${p.excerpt ?? ""}`.toLowerCase(),
      })),
    [posts]
  );

  const filteredProjects = React.useMemo(() => {
    const q = dqProjects.trim().toLowerCase();
    return projectsIdx.filter((p) => (!onlyFeatured || p.featured) && (!q || p._hay.includes(q)));
  }, [projectsIdx, dqProjects, onlyFeatured]);

  const filteredPosts = React.useMemo(() => {
    const q = dqPosts.trim().toLowerCase();
    return postsIdx.filter((p) => (!onlyPublished || p.publishedAt) && (!q || p._hay.includes(q)));
  }, [postsIdx, dqPosts, onlyPublished]);

  // -----------------------------
  // Subcomponents (hooks must be at top level)
  // -----------------------------

  function ProjectCreateForm() {
    const form = useProjectForm();
    return (
      <FormProvider {...form}>
        <Box component="form" action={async (fd: FormData) => {
          const values = form.getValues();
          fd.set("title", values.title);
          fd.set("slug", values.slug);
          fd.set("summary", values.summary ?? "");
          fd.set("content", values.content);
          fd.set("techStack", (values.techStack ?? []).join(", "));
          if (values.repoUrl) fd.set("repoUrl", values.repoUrl);
          if (values.demoUrl) fd.set("demoUrl", values.demoUrl);
          if (values.coverImage) fd.set("coverImage", values.coverImage);
          if (values.featured) fd.set("featured", "true");
          return createProject(fd);
        }} sx={twoColGridSx}>
          <TitleSlugFields />
          <TextField {...form.register("summary")} label="Summary" multiline minRows={2} fullWidth sx={fullSpanSx}
            error={!!form.formState.errors.summary} helperText={form.formState.errors.summary?.message} />
          <TextField {...form.register("content")} label="Content" multiline minRows={6} fullWidth sx={fullSpanSx}
            required error={!!form.formState.errors.content} helperText={form.formState.errors.content?.message} />
          <TechStackField name="techStack" />
          <TextField {...form.register("repoUrl")} label="Repository URL" placeholder="https://…" fullWidth
            error={!!form.formState.errors.repoUrl} helperText={form.formState.errors.repoUrl?.message} />
          <TextField {...form.register("demoUrl")} label="Demo URL" placeholder="https://…" fullWidth
            error={!!form.formState.errors.demoUrl} helperText={form.formState.errors.demoUrl?.message} />
          <CoverImageField name="coverImage" />
          <FormControlLabel control={<Switch checked={form.watch("featured") ?? false} onChange={(e) => form.setValue("featured", e.target.checked)} />} label="Featured" />
          <Box sx={fullSpanSx}>
            <FormSubmitButton label="Create" />
          </Box>
        </Box>
      </FormProvider>
    );
  }

  function ProjectEditForm({ p }: { p: Project }) {
    const form = useProjectForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary ?? "",
      content: p.content ?? "",
      techStack: p.techStack ?? [],
      repoUrl: p.repoUrl ?? "",
      demoUrl: p.demoUrl ?? "",
      coverImage: p.coverImage ?? "",
      featured: p.featured,
    });
    return (
      <FormProvider {...form}>
        <Box component="form" action={async (fd: FormData) => {
          const values = form.getValues();
          fd.set("id", String(p.id));
          fd.set("title", values.title);
          fd.set("slug", values.slug);
          fd.set("summary", values.summary ?? "");
          fd.set("content", values.content);
          fd.set("techStack", (values.techStack ?? []).join(", "));
          fd.set("repoUrl", values.repoUrl ?? "");
          fd.set("demoUrl", values.demoUrl ?? "");
          fd.set("coverImage", values.coverImage ?? "");
          if (values.featured) fd.set("featured", "true");
          return updateProject(fd);
        }} sx={twoColGridSx}>
          <TitleSlugFields defaultTitle={p.title} defaultSlug={p.slug} />
          <TextField {...form.register("summary")} label="Summary" multiline minRows={2} fullWidth sx={fullSpanSx}
            error={!!form.formState.errors.summary} helperText={form.formState.errors.summary?.message} />
          <TextField {...form.register("content")} label="Content" multiline minRows={6} fullWidth sx={fullSpanSx}
            required error={!!form.formState.errors.content} helperText={form.formState.errors.content?.message} />
          <TechStackField name="techStack" defaultValue={p.techStack ?? []} />
          <TextField {...form.register("repoUrl")} label="Repository URL" fullWidth
            error={!!form.formState.errors.repoUrl} helperText={form.formState.errors.repoUrl?.message} />
          <TextField {...form.register("demoUrl")} label="Demo URL" fullWidth
            error={!!form.formState.errors.demoUrl} helperText={form.formState.errors.demoUrl?.message} />
          <CoverImageField name="coverImage" defaultValue={p.coverImage ?? ""} />
          <FormControlLabel control={<Switch checked={form.watch("featured") ?? false} onChange={(e) => form.setValue("featured", e.target.checked)} />} label="Featured" />
          <Box sx={fullSpanSx}>
            <FormSubmitButton label="Save" />
          </Box>
        </Box>
      </FormProvider>
    );
  }

  function PostCreateForm() {
    const form = useBlogPostForm();
    return (
      <FormProvider {...form}>
        <Box component="form" action={async (fd: FormData) => {
          const values = form.getValues();
          fd.set("title", values.title);
          fd.set("slug", values.slug);
          fd.set("excerpt", values.excerpt);
          fd.set("content", values.content);
          if (values.coverImage) fd.set("coverImage", values.coverImage);
          const raw = (fd.get("publishedAt") as string) || new Date().toISOString();
          fd.set("publishedAt", raw);
          return createBlogPost(fd);
        }} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TitleSlugFields />
          <TextField {...form.register("excerpt")} label="Excerpt" multiline minRows={2} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }}
            required error={!!form.formState.errors.excerpt} helperText={form.formState.errors.excerpt?.message} />
          <TextField {...form.register("content")} label="Content" multiline minRows={6} fullWidth sx={{ gridColumn: { md: "1 / span 2" } }}
            required error={!!form.formState.errors.content} helperText={form.formState.errors.content?.message} />
          <CoverImageField name="coverImage" />
          <DateTimeNowField name="publishedAt" label="Published At" defaultNow />
          <Box sx={{ gridColumn: { md: "1 / span 2" } }}>
            <FormSubmitButton label="Create" />
          </Box>
        </Box>
      </FormProvider>
    );
  }

  function PostEditForm({ post }: { post: BlogPost }) {
    const form = useBlogPostForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      coverImage: post.coverImage ?? "",
      publishedAt: post.publishedAt ?? new Date(),
    });
    return (
      <FormProvider {...form}>
        <Box component="form" action={async (fd: FormData) => {
          const values = form.getValues();
          fd.set("id", String(post.id));
          fd.set("title", values.title);
          fd.set("slug", values.slug);
          fd.set("excerpt", values.excerpt);
          fd.set("content", values.content);
          fd.set("coverImage", values.coverImage ?? "");
          const raw = (fd.get("publishedAt") as string) || new Date().toISOString();
          fd.set("publishedAt", raw);
          return updateBlogPost(fd);
        }} sx={twoColGridSx}>
          <TitleSlugFields defaultTitle={post.title} defaultSlug={post.slug} />
          <TextField {...form.register("excerpt")} label="Excerpt" multiline minRows={2} fullWidth sx={fullSpanSx}
            required error={!!form.formState.errors.excerpt} helperText={form.formState.errors.excerpt?.message} />
          <TextField {...form.register("content")} label="Content" multiline minRows={6} fullWidth sx={fullSpanSx}
            required error={!!form.formState.errors.content} helperText={form.formState.errors.content?.message} />
          <CoverImageField name="coverImage" defaultValue={post.coverImage ?? ""} />
          <DateTimeNowField
            name="publishedAt"
            label="Published At"
            defaultValue={post.publishedAt ? formatDateTimeLocal(post.publishedAt) : ""}
          />
          <Box sx={fullSpanSx}>
            <FormSubmitButton label="Save" />
          </Box>
        </Box>
      </FormProvider>
    );
  }

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
            {/* Create Project (RHF + Zod) */}
            <SectionCard title="Create Project" subtitle="Add a new portfolio entry">
              <ProjectCreateForm />
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
                      <Accordion defaultExpanded={idx === 0} disableGutters TransitionProps={{ unmountOnExit: true }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 600 }}>{p.title}</Typography>
                          <Typography sx={{ ml: 1, color: "text.secondary", fontSize: 12 }}>/ {p.slug}</Typography>
                          {p.featured ? <Chip label="Featured" size="small" sx={{ ml: 1 }} /> : null}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <ProjectEditForm p={p} />

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
            {/* Create Post (RHF + Zod) */}
            <SectionCard title="Create Blog Post" subtitle="Publish a new article">
              <PostCreateForm />
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
                      <Accordion defaultExpanded={idx === 0} disableGutters TransitionProps={{ unmountOnExit: true }}>
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
                            <PostEditForm post={post} />

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
