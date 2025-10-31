import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
	LogOut,
	Plus,
	Trash2,
	MoreHorizontal,
	Star,
	StarOff,
	ChevronRight,
	Search,
	X,
} from "lucide-react";
import { ProjectsAPI, AuthAPI, TasksAPI } from "@/lib/api";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Project {
	id: string;
	title: string;
	description: string | null;
	createdAt: string;
	updatedAt?: string;
}

const Dashboard = () => {
	const navigate = useNavigate();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newProjectTitle, setNewProjectTitle] = useState("");
	const [newProjectDescription, setNewProjectDescription] = useState("");
	const [projectMetrics, setProjectMetrics] = useState<
		Record<string, { total: number; completed: number }>
	>({});
	const [pinned, setPinned] = useState<Record<string, boolean>>({});
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			setLoading(true);
			const data = await ProjectsAPI.getAllProjects();
			setProjects(data);
		} catch (error: any) {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					"Failed to fetch projects"
			);
		} finally {
			setLoading(false);
		}
	};

	// After projects load, fetch lightweight metrics per project (total and completed tasks)
	useEffect(() => {
		// load pinned map once when projects change (first time page loads)
		try {
			const raw = localStorage.getItem("pinnedProjects");
			if (raw) setPinned(JSON.parse(raw));
		} catch {}

		const fetchMetrics = async () => {
			if (projects.length === 0) {
				setProjectMetrics({});
				return;
			}

			try {
				const entries = await Promise.all(
					projects.map(async (p) => {
						try {
							const tasks = await TasksAPI.getTasksForProject(p.id);
							const total = tasks.length;
							const completed = tasks.filter(
								(t: any) => t.status === "Completed"
							).length;
							return [p.id, { total, completed }] as const;
						} catch {
							return [p.id, { total: 0, completed: 0 }] as const;
						}
					})
				);
				setProjectMetrics(Object.fromEntries(entries));
			} catch {
				// Non-blocking: keep metrics empty on failure
			}
		};

		fetchMetrics();
	}, [projects]);

	useEffect(() => {
		try {
			localStorage.setItem("pinnedProjects", JSON.stringify(pinned));
		} catch {}
	}, [pinned]);

	const togglePin = (id: string) => {
		setPinned((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	// Derived filtered list (kept simple and fast client-side)
	const q = searchQuery.trim().toLowerCase();
	const filteredProjects = q
		? projects.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					(p.description || "").toLowerCase().includes(q)
		  )
		: projects;

	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate project title (3-100 characters, required)
		if (!newProjectTitle.trim()) {
			toast.error("Please enter a project title");
			return;
		}
		if (newProjectTitle.trim().length < 3) {
			toast.error("Project title must be at least 3 characters long");
			return;
		}
		if (newProjectTitle.trim().length > 100) {
			toast.error("Project title cannot exceed 100 characters");
			return;
		}

		// Validate description (optional, up to 500 characters)
		if (newProjectDescription && newProjectDescription.length > 500) {
			toast.error("Project description cannot exceed 500 characters");
			return;
		}

		try {
			await ProjectsAPI.createProject({
				title: newProjectTitle,
				description: newProjectDescription || "",
			});
			toast.success("Project created successfully!");
			setNewProjectTitle("");
			setNewProjectDescription("");
			setDialogOpen(false);
			fetchProjects();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					"Failed to create project"
			);
		}
	};

	const handleDeleteProject = async (id: string) => {
		if (!confirm("Are you sure you want to delete this project?")) return;
		try {
			await ProjectsAPI.deleteProject(id);
			toast.success("Project deleted successfully!");
			fetchProjects();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					"Failed to delete project"
			);
		}
	};

	const handleLogout = async () => {
		AuthAPI.logout();
		navigate("/auth");
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-pathlock-primary/5 to-pathlock-secondary/10">
			<header className="bg-gradient-to-r from-white/95 via-pathlock-primary/5 to-white/95 backdrop-blur-md border-b border-pathlock-primary/20 shadow-sm sticky top-0 z-50">
				<div className="container mx-auto flex items-center justify-between px-4 py-6">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-md">
							<div className="w-4 h-4 bg-white rounded-sm"></div>
						</div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
							My Projects
						</h1>
					</div>
					<Button
						variant="outline"
						onClick={handleLogout}
						className="border-2 hover:bg-red-50 transition-colors border-red-600 text-red-600"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
					<div className="flex items-center gap-3">
						<div className="rounded-lg px-3 py-2 h-10 shadow-sm border border-slate-200 bg-white/70">
							<p className="text-sm text-slate-700">
								{projects.length}{" "}
								{projects.length === 1 ? "Project" : "Projects"}
							</p>
						</div>
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search projects..."
								className="h-10 w-56 sm:w-64 md:w-72 pl-9 text-sm rounded-lg bg-white/70 border border-slate-200 placeholder-slate-400 focus:border-pathlock-primary focus:ring-2 focus:ring-pathlock-primary/20"
							/>
							{searchQuery && (
								<button
									type="button"
									className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									onClick={() => setSearchQuery("")}
									aria-label="Clear search"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button className="h-10 px-4 text-sm text-white bg-pathlock-accent hover:bg-pathlock-accentLight shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
								<Plus className="mr-2 h-4 w-4" />
								New Project
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-gradient-to-br from-white via-slate-50/50 to-pathlock-primary/5 border-pathlock-primary/20">
							<DialogHeader className="border-b border-pathlock-primary/20 pb-4">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-sm">
										<Plus className="h-3 w-3 text-white" />
									</div>
									<DialogTitle className="bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
										Create New Project
									</DialogTitle>
								</div>
								<DialogDescription className="text-pathlock-primary/80">
									Add a new project to track your tasks
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleCreateProject} className="space-y-6 pt-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<Label
											htmlFor="title"
											className="text-pathlock-primary font-medium"
										>
											Project Title
										</Label>
										<span
											className={`text-xs ${
												newProjectTitle.length < 3
													? "text-red-500"
													: newProjectTitle.length > 100
													? "text-red-500"
													: "text-pathlock-primary/60"
											}`}
										>
											{newProjectTitle.length}/100
										</span>
									</div>
									<Input
										id="title"
										placeholder="My awesome project"
										value={newProjectTitle}
										onChange={(e) => setNewProjectTitle(e.target.value)}
										required
										maxLength={100}
										className={`border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20 bg-white/80 ${
											newProjectTitle.length > 0 && newProjectTitle.length < 3
												? "border-red-300 focus:border-red-500"
												: newProjectTitle.length > 100
												? "border-red-300 focus:border-red-500"
												: ""
										}`}
									/>
									{newProjectTitle.length > 0 && newProjectTitle.length < 3 && (
										<p className="text-xs text-red-500">
											Title must be at least 3 characters
										</p>
									)}
								</div>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<Label
											htmlFor="description"
											className="text-pathlock-primary font-medium"
										>
											Description (optional)
										</Label>
										<span
											className={`text-xs ${
												newProjectDescription.length > 500
													? "text-red-500"
													: "text-pathlock-primary/60"
											}`}
										>
											{newProjectDescription.length}/500
										</span>
									</div>
									<Textarea
										id="description"
										placeholder="What is this project about?"
										value={newProjectDescription}
										onChange={(e) => setNewProjectDescription(e.target.value)}
										rows={3}
										maxLength={500}
										className={`border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-2 focus:ring-pathlock-primary/20 bg-white/80 transition-colors ${
											newProjectDescription.length > 500
												? "border-red-300 focus:border-red-500"
												: ""
										}`}
									/>
									{newProjectDescription.length > 500 && (
										<p className="text-xs text-red-500">
											Description cannot exceed 500 characters
										</p>
									)}
								</div>
								<div className="flex justify-end gap-3 pt-4 border-t border-pathlock-primary/20">
									<Button
										type="button"
										variant="outline"
										onClick={() => setDialogOpen(false)}
										className="border-pathlock-primary/30 text-pathlock-primary hover:bg-pathlock-primary/5 hover:text-pathlock-primary/80 transition-colors"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="bg-pathlock-accent hover:bg-pathlock-accentLight text-white shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02]"
									>
										Create Project
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{projects.length === 0 ? (
					<Card className="text-center py-12 bg-gradient-to-br from-white/95 via-pathlock-primary/5 to-pathlock-secondary/5 border-pathlock-primary/20">
						<CardHeader>
							<CardTitle className="text-pathlock-primary">
								No projects yet
							</CardTitle>
							<CardDescription className="text-pathlock-primary/80">
								Create your first project to get started
							</CardDescription>
						</CardHeader>
					</Card>
				) : filteredProjects.length === 0 ? (
					<Card className="text-center py-10 bg-gradient-to-br from-white/95 via-pathlock-primary/5 to-pathlock-secondary/5 border-pathlock-primary/20">
						<CardHeader>
							<CardTitle className="text-pathlock-primary">
								No matching projects
							</CardTitle>
							<CardDescription className="text-pathlock-primary/80">
								Try a different search or clear the filter
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...filteredProjects]
							.sort((a, b) => (pinned[b.id] ? 1 : 0) - (pinned[a.id] ? 1 : 0))
							.map((project) => (
								<Card
									key={project.id}
									tabIndex={0}
									className="group relative cursor-pointer transition-all hover:shadow-md bg-gradient-to-br from-white/95 via-pathlock-primary/5 to-pathlock-secondary/5 border border-pathlock-primary/20 hover:border-pathlock-primary/40 hover:shadow-pathlock-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pathlock-primary/30"
									onClick={() => navigate(`/project/${project.id}`)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											navigate(`/project/${project.id}`);
										}
									}}
								>
									<CardHeader>
										{/* Row 1: avatar + title, overflow menu */}
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3 min-w-0">
												<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary text-white flex items-center justify-center text-sm font-semibold shadow-sm">
													{project.title?.[0]?.toUpperCase() || "P"}
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<CardTitle className="text-lg sm:text-xl truncate">
															{project.title}
														</CardTitle>
														{pinned[project.id] && (
															<Star
																className="h-4 w-4 text-amber-400"
																aria-label="Pinned"
															/>
														)}
													</div>
													{/* Row 2: description */}
													{project.description && (
														<CardDescription className="mt-1 line-clamp-2 text-slate-600">
															{project.description}
														</CardDescription>
													)}
												</div>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={(e) => e.stopPropagation()}
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													onClick={(e) => e.stopPropagation()}
												>
													<DropdownMenuLabel>Project</DropdownMenuLabel>
													<DropdownMenuItem
														onClick={() => togglePin(project.id)}
													>
														{pinned[project.id] ? (
															<StarOff className="mr-2 h-4 w-4" />
														) : (
															<Star className="mr-2 h-4 w-4" />
														)}
														<span>
															{pinned[project.id] ? "Unpin" : "Pin"} project
														</span>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() => handleDeleteProject(project.id)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														<span>Delete project</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</CardHeader>
									<CardContent>
										{/* Row 3: metrics strip + micro bar */}
										<div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
											<span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
												{projectMetrics[project.id]?.total ?? 0}{" "}
												{projectMetrics[project.id]?.total === 1
													? "task"
													: "tasks"}
											</span>
											<span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
												{(() => {
													const m = projectMetrics[project.id];
													if (!m) return "0% complete";
													const pct =
														m.total > 0
															? Math.round((m.completed / m.total) * 100)
															: 0;
													return `${pct}% complete`;
												})()}
											</span>
										</div>
										{(() => {
											const m = projectMetrics[project.id];
											const pct =
												m && m.total > 0
													? Math.round((m.completed / m.total) * 100)
													: 0;
											return (
												<div className="h-[3px] w-full rounded-full bg-slate-100 overflow-hidden">
													<div
														className="h-full bg-green-500"
														style={{ width: `${pct}%` }}
													/>
												</div>
											);
										})()}
										<p className="mt-2 text-xs text-muted-foreground">
											Created {new Date(project.createdAt).toLocaleDateString()}
											{project.updatedAt && (
												<>
													{" • Updated "}
													{new Date(project.updatedAt).toLocaleDateString()}
												</>
											)}
										</p>
										{/* Hover chevron indicator */}
										<ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
									</CardContent>
								</Card>
							))}
					</div>
				)}
			</main>
		</div>
	);
};

export default Dashboard;
