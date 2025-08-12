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
import { SectionCard, FormSubmitButton, TitleSlugFields, SearchBar, DateTimeNowField } from "./components";
import { TechStackField, CoverImageField } from "./fields";
import { DeleteWithConfirm } from "./delete";

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
                sx={twoColGridSx}
              >
                <TitleSlugFields />
                <TextField name="summary" label="Summary" multiline minRows={2} fullWidth sx={fullSpanSx} />
                <TextField name="content" label="Content" multiline minRows={6} fullWidth sx={fullSpanSx} />
                <TechStackField name="techStack" />

                <TextField name="repoUrl" label="Repository URL" placeholder="https://…" fullWidth />
                <TextField name="demoUrl" label="Demo URL" placeholder="https://…" fullWidth />
                <CoverImageField name="coverImage" />

                <FormControlLabel control={<Switch name="featured" />} label="Featured" />
                <Box sx={fullSpanSx}>
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
                      <Accordion defaultExpanded={idx === 0} disableGutters TransitionProps={{ unmountOnExit: true }}>
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
                              sx={twoColGridSx}
                            >
                              <input type="hidden" name="id" value={String(p.id)} />
                              <TitleSlugFields defaultTitle={p.title} defaultSlug={p.slug} />
                              <TextField name="summary" label="Summary" defaultValue={p.summary ?? ""} multiline minRows={2} fullWidth sx={fullSpanSx} />
                              <TextField name="content" label="Content" defaultValue={p.content ?? ""} multiline minRows={6} fullWidth sx={fullSpanSx} />
                              <TechStackField name="techStack" defaultValue={p.techStack ?? []} />
                              <TextField name="repoUrl" label="Repository URL" defaultValue={p.repoUrl ?? ""} fullWidth />
                              <TextField name="demoUrl" label="Demo URL" defaultValue={p.demoUrl ?? ""} fullWidth />
                              <CoverImageField name="coverImage" defaultValue={p.coverImage ?? ""} />
                              <FormControlLabel control={<Switch name="featured" defaultChecked={p.featured} />} label="Featured" />
                              <Box sx={fullSpanSx}>
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
                            <Box
                              component="form"
                              action={updateBlogPost}
                              sx={twoColGridSx}
                            >
                              <input type="hidden" name="id" value={String(post.id)} />
                              <TitleSlugFields defaultTitle={post.title} defaultSlug={post.slug} />
                              <TextField name="excerpt" label="Excerpt" defaultValue={post.excerpt ?? ""} multiline minRows={2} fullWidth sx={fullSpanSx} />
                              <TextField name="content" label="Content" defaultValue={post.content ?? ""} multiline minRows={6} fullWidth sx={fullSpanSx} />
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
