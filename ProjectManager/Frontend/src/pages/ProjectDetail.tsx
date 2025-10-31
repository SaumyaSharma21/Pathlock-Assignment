import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectsAPI, TasksAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import {
	ArrowLeft,
	Plus,
	Trash2,
	Edit2,
	Check,
	X,
	Calendar,
	Clock,
	Link2,
	Zap,
	Target,
	TrendingUp,
} from "lucide-react";

interface Project {
	id: string;
	title: string;
	description: string | null;
}

interface Task {
	id: string;
	title: string;
	description: string | null;
	status: "NotStarted" | "InProgress" | "Completed";
	dueDate?: string;
	estimatedHours?: number;
	dependencies?: string[];
	assignedToUserId?: string;
	createdAt?: string;
}

const ProjectDetail = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [newTaskDescription, setNewTaskDescription] = useState("");
	const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState(8);
	const [newTaskDueDate, setNewTaskDueDate] = useState("");
	const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editEstimatedHours, setEditEstimatedHours] = useState(8);
	const [editDueDate, setEditDueDate] = useState("");
	const [editDependencies, setEditDependencies] = useState<string[]>([]);
	const [scheduling, setScheduling] = useState(false);
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
	const [taskOperations, setTaskOperations] = useState<{
		[key: string]: boolean;
	}>({});
	const [creatingTask, setCreatingTask] = useState(false);
	const [deletingTask, setDeletingTask] = useState<string | null>(null);
	const [scheduleResults, setScheduleResults] = useState<{
		recommendedOrder: string[];
		detailedSchedule: Array<{
			taskId?: string;
			title: string;
			scheduledStartDate: string;
			scheduledEndDate: string;
			estimatedHours: number;
			dependencies?: string[];
			assignedToUserId?: string;
			originalDueDate?: string;
		}>;
	}>({ recommendedOrder: [], detailedSchedule: [] });
	const [appliedScheduleOrder, setAppliedScheduleOrder] = useState<string[]>(
		[]
	);
	const [depPickerOpen, setDepPickerOpen] = useState(false);
	const [editDepPickerOpen, setEditDepPickerOpen] = useState<string | null>(
		null
	);

	useEffect(() => {
		if (id) {
			fetchProjectAndTasks();
		}
	}, [id]);

	const fetchProjectAndTasks = async () => {
		try {
			setLoading(true);
			const projectData = await ProjectsAPI.getProject(id!);
			setProject(projectData);
			// Fetch tasks for this project using the correct endpoint
			try {
				const tasksData = await TasksAPI.getTasksForProject(id!);
				setTasks(tasksData);
			} catch {
				setTasks([]);
			}
		} catch (error: any) {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					"Failed to fetch project"
			);
			navigate("/dashboard");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTaskTitle.trim()) {
			toast.error("Please enter a task title");
			return;
		}

		setCreatingTask(true);
		try {
			const dueDate = newTaskDueDate
				? new Date(newTaskDueDate).toISOString()
				: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 1 week from now
			await TasksAPI.createTask(id!, {
				title: newTaskTitle,
				description: newTaskDescription || "",
				dueDate,
				estimatedHours: newTaskEstimatedHours,
				dependencies: newTaskDependencies,
			});
			toast.success("Task created successfully!");
			setNewTaskTitle("");
			setNewTaskDescription("");
			setNewTaskEstimatedHours(8);
			setNewTaskDueDate("");
			setNewTaskDependencies([]);
			setDialogOpen(false);
			// Clear schedule results since a new task was added
			setScheduleResults({ recommendedOrder: [], detailedSchedule: [] });
			setAppliedScheduleOrder([]);
			await fetchProjectAndTasks();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to create task"
			);
		} finally {
			setCreatingTask(false);
		}
	};

	const handleToggleTask = async (taskId: string, status: string) => {
		setTaskOperations({ ...taskOperations, [taskId]: true });
		try {
			const originalTask = tasks.find((t) => t.id === taskId);
			if (!originalTask) {
				toast.error("Task not found");
				return;
			}
			const newStatus = status === "Completed" ? "NotStarted" : "Completed";
			await TasksAPI.updateTask(taskId, {
				title: originalTask.title,
				description: originalTask.description || "",
				status: newStatus,
				dueDate: originalTask.dueDate || new Date().toISOString(),
				estimatedHours: originalTask.estimatedHours || 8,
				dependencies: originalTask.dependencies || [],
				assignedToUserId: originalTask.assignedToUserId || undefined,
			});
			setTasks(
				tasks.map((task) =>
					task.id === taskId ? { ...task, status: newStatus } : task
				)
			);
			// Clear schedule results since task status changed
			setScheduleResults({ recommendedOrder: [], detailedSchedule: [] });
			setAppliedScheduleOrder([]);
			toast.success(
				newStatus === "Completed"
					? "Task completed!"
					: "Task marked as incomplete",
				{ duration: 2000 }
			);
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to update task"
			);
		} finally {
			setTaskOperations({ ...taskOperations, [taskId]: false });
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		if (!confirm("Are you sure you want to delete this task?")) return;

		setDeletingTask(taskId);
		try {
			await TasksAPI.deleteTask(taskId);
			toast.success("Task deleted successfully!");
			// Clear schedule results since a task was deleted
			setScheduleResults({ recommendedOrder: [], detailedSchedule: [] });
			setAppliedScheduleOrder([]);
			await fetchProjectAndTasks();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to delete task"
			);
		} finally {
			setDeletingTask(null);
		}
	};

	const handleStartEdit = (task: Task) => {
		setEditingTaskId(task.id);
		setEditTitle(task.title);
		setEditDescription(task.description || "");
		setEditEstimatedHours(task.estimatedHours || 8);
		// Format the due date properly for the date input field (YYYY-MM-DD)
		const formattedDate = task.dueDate
			? new Date(task.dueDate).toISOString().split("T")[0]
			: "";
		setEditDueDate(formattedDate);
		setEditDependencies(task.dependencies || []);
	};

	const handleSaveEdit = async (taskId: string) => {
		if (!editTitle.trim()) {
			toast.error("Task title cannot be empty");
			return;
		}
		try {
			// Find the original task to get its status and assignedToUserId
			const originalTask = tasks.find((t) => t.id === taskId);
			await TasksAPI.updateTask(taskId, {
				title: editTitle,
				description: editDescription,
				status: originalTask?.status || "NotStarted",
				dueDate: editDueDate
					? new Date(editDueDate).toISOString()
					: originalTask?.dueDate || new Date().toISOString(),
				estimatedHours: editEstimatedHours,
				dependencies: editDependencies,
				assignedToUserId: originalTask?.assignedToUserId || undefined,
			});
			// First update the local state immediately for better UX
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId
						? {
								...task,
								title: editTitle,
								description: editDescription,
								dueDate: editDueDate
									? new Date(editDueDate).toISOString()
									: task.dueDate,
								estimatedHours: editEstimatedHours,
								dependencies: editDependencies,
						  }
						: task
				)
			);

			toast.success("Task updated successfully!");
			setEditingTaskId(null);
			// Clear schedule results since task data has changed
			setScheduleResults({ recommendedOrder: [], detailedSchedule: [] });
			setAppliedScheduleOrder([]);
			// Show feedback that schedule needs to be refreshed
			if (scheduleResults.detailedSchedule.length > 0) {
				toast.info(
					"Task updated! Please re-run auto-schedule to see updated recommendations.",
					{
						duration: 4000,
					}
				);
			}
			// Also fetch fresh data from backend to ensure consistency
			await fetchProjectAndTasks();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to update task"
			);
		}
	};

	const handleCancelEdit = () => {
		setEditingTaskId(null);
		setEditTitle("");
		setEditDescription("");
		setEditEstimatedHours(8);
		setEditDueDate("");
		setEditDependencies([]);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<Skeleton className="h-8 w-32 mb-4" />
						<Skeleton className="h-12 w-96 mb-2" />
						<Skeleton className="h-4 w-64" />
					</div>

					<div className="mb-6">
						<Skeleton className="h-6 w-48 mb-4" />
						<Skeleton className="h-2 w-80" />
					</div>

					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<Skeleton className="h-5 w-5 rounded" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-1/2" />
											<div className="flex gap-4">
												<Skeleton className="h-3 w-16" />
												<Skeleton className="h-3 w-20" />
											</div>
										</div>
										<div className="flex gap-1">
											<Skeleton className="h-8 w-8" />
											<Skeleton className="h-8 w-8" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!project) return null;

	const completedTasks = tasks.filter((t) => t.status === "Completed").length;
	const totalTasks = tasks.length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-pathlock-primary/5 to-pathlock-secondary/10">
			<header className="bg-gradient-to-r from-white/95 via-pathlock-primary/5 to-white/95 backdrop-blur-md border-b border-pathlock-primary/20 shadow-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 sm:py-6">
					<Button
						variant="outline"
						onClick={() => navigate("/dashboard")}
						className="mb-4 border-2 hover:bg-pathlock-primary/5 transition-colors border-pathlock-primary text-pathlock-primary"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">Back to Dashboard</span>
						<span className="sm:hidden">Back</span>
					</Button>
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: "#101859" }}
								></div>
								<h1
									className="text-2xl sm:text-3xl lg:text-4xl font-bold"
									style={{ color: "#101859" }}
								>
									{project.title}
								</h1>
							</div>
							{project.description && (
								<p className="text-gray-600 text-sm sm:text-base max-w-3xl">
									{project.description}
								</p>
							)}
						</div>

						{/* Project Stats - Mobile Hidden, Desktop Visible */}
						<div className="hidden lg:flex items-center gap-4 mt-2">
							<div className="text-center bg-gradient-to-br from-pathlock-primary/8 to-pathlock-secondary/12 rounded-xl px-4 py-3 shadow-sm border border-pathlock-primary/30">
								<div className="text-2xl font-bold bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
									{totalTasks}
								</div>
								<div className="text-xs text-pathlock-primary/80 font-medium">
									Total Tasks
								</div>
							</div>
							<div className="text-center bg-gradient-to-br from-pathlock-accent/10 to-pathlock-accent/15 rounded-xl px-4 py-3 shadow-sm border border-pathlock-accent/30">
								<div className="text-2xl font-bold text-pathlock-accent">
									{completedTasks}
								</div>
								<div className="text-xs text-pathlock-accent/80 font-medium">
									Completed
								</div>
							</div>
							<div className="text-center bg-gradient-to-br from-pathlock-secondary/8 to-pathlock-primary/8 rounded-xl px-4 py-3 shadow-sm border border-pathlock-secondary/30">
								<div className="text-2xl font-bold bg-gradient-to-r from-pathlock-secondary to-pathlock-primary bg-clip-text text-transparent">
									{Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}
									%
								</div>
								<div className="text-xs text-pathlock-secondary/80 font-medium">
									Progress
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6 sm:py-8">
				{/* Mobile Progress Card */}
				<div className="lg:hidden mb-6">
					<Card className="bg-gradient-to-br from-white/90 via-pathlock-primary/5 to-pathlock-secondary/10 backdrop-blur-sm border-pathlock-primary/20 shadow-lg">
						<CardContent className="pt-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-sm">
										<Target className="h-4 w-4 text-white" />
									</div>
									<span className="font-semibold bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
										Progress
									</span>
								</div>
								<Badge className="bg-gradient-to-r from-pathlock-primary/10 to-pathlock-secondary/10 text-pathlock-primary border-pathlock-primary/30">
									{completedTasks}/{totalTasks} tasks
								</Badge>
							</div>
							<Progress
								value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
								className="h-3 bg-gray-200"
							/>
							<div className="flex justify-between mt-2 text-sm text-gray-600">
								<span>
									{Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}
									% complete
								</span>
								<span>{totalTasks - completedTasks} remaining</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Desktop Progress Section */}
				<div className="hidden lg:block mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-green-600" />
									<span
										className="text-lg font-semibold"
										style={{ color: "#101859" }}
									>
										Project Progress
									</span>
								</div>
							</div>
							<div className="flex items-center gap-8">
								<div className="text-center">
									<div className="text-sm text-gray-500">Completion Rate</div>
									<div className="text-2xl font-bold text-green-600">
										{Math.round(
											(completedTasks / Math.max(totalTasks, 1)) * 100
										)}
										%
									</div>
								</div>
								<div className="w-64">
									<Progress
										value={
											totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
										}
										className="h-3 bg-slate-200 dark:bg-slate-700"
									/>
									<div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
										<span>{completedTasks} completed</span>
										<span>{totalTasks - completedTasks} remaining</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mb-8 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogTrigger asChild>
								<Button
									className="text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
									style={{ backgroundColor: "#101859" }}
								>
									<Plus className="mr-2 h-4 w-4" />
									<span className="hidden sm:inline">New Task</span>
									<span className="sm:hidden">Add</span>
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create New Task</DialogTitle>
									<DialogDescription>
										Add a new task to this project
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleCreateTask} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="task-title">Task Title</Label>
										<Input
											id="task-title"
											placeholder="What needs to be done?"
											value={newTaskTitle}
											onChange={(e) => setNewTaskTitle(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="task-description">
											Description (optional)
										</Label>
										<Textarea
											id="task-description"
											placeholder="Add more details..."
											value={newTaskDescription}
											onChange={(e) => setNewTaskDescription(e.target.value)}
											rows={3}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="task-hours">Estimated Hours</Label>
											<Input
												id="task-hours"
												type="number"
												min="1"
												max="200"
												placeholder="8"
												value={newTaskEstimatedHours}
												onChange={(e) =>
													setNewTaskEstimatedHours(
														parseInt(e.target.value) || 8
													)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="task-due-date">Due Date (optional)</Label>
											<Input
												id="task-due-date"
												type="date"
												value={newTaskDueDate}
												onChange={(e) => setNewTaskDueDate(e.target.value)}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="task-dependencies">
											Dependencies (optional)
										</Label>
										<div
											className="flex flex-wrap gap-2"
											id="task-dependencies"
										>
											{newTaskDependencies.map((dep) => (
												<Badge key={dep} variant="secondary" className="pr-1">
													<span className="mr-1">{dep}</span>
													<button
														type="button"
														className="inline-flex items-center justify-center rounded hover:bg-muted px-0.5"
														onClick={() =>
															setNewTaskDependencies((prev) =>
																prev.filter((d) => d !== dep)
															)
														}
														aria-label={`Remove ${dep}`}
													>
														<X className="h-3 w-3" />
													</button>
												</Badge>
											))}
											{newTaskDependencies.length === 0 && (
												<p className="text-xs text-muted-foreground">
													No dependencies selected
												</p>
											)}
										</div>
										<Popover
											open={depPickerOpen}
											onOpenChange={setDepPickerOpen}
										>
											<PopoverTrigger asChild>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="mt-1"
												>
													<Plus className="mr-1 h-4 w-4" /> Add dependency
												</Button>
											</PopoverTrigger>
											<PopoverContent className="p-0 w-80" align="start">
												<Command>
													<CommandInput placeholder="Search tasks..." />
													<CommandEmpty>No tasks found.</CommandEmpty>
													<CommandList>
														<CommandGroup heading="Project tasks">
															{tasks
																.filter(
																	(t) => !newTaskDependencies.includes(t.title)
																)
																.sort((a, b) => a.title.localeCompare(b.title))
																.map((t) => (
																	<CommandItem
																		key={t.id}
																		value={t.title}
																		onSelect={(val) => {
																			const title = val.trim();
																			if (!title) return;
																			setNewTaskDependencies((prev) =>
																				prev.includes(title)
																					? prev
																					: [...prev, title]
																			);
																		}}
																	>
																		<div className="flex flex-col">
																			<span className="text-sm font-medium">
																				{t.title}
																			</span>
																			<span className="text-xs text-muted-foreground">
																				{t.estimatedHours
																					? `${t.estimatedHours}h`
																					: ""}
																				{t.dueDate
																					? ` • Due ${new Date(
																							t.dueDate
																					  ).toLocaleDateString()}`
																					: ""}
																			</span>
																		</div>
																	</CommandItem>
																))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<p className="text-xs text-muted-foreground">
											Select existing tasks from this project. We’ll send their
											titles to the scheduler.
										</p>
									</div>
									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setDialogOpen(false)}
											disabled={creatingTask}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={creatingTask}
											className="text-white"
											style={{ backgroundColor: "#101859" }}
										>
											{creatingTask ? (
												<>
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
													Creating...
												</>
											) : (
												<>
													<Check className="mr-2 h-4 w-4" />
													Create Task
												</>
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
						<Button
							variant="outline"
							className="border-2"
							style={{
								borderColor: "#046FA9",
								color: "#046FA9",
							}}
							onClick={async () => {
								if (!id) return;
								try {
									setScheduling(true);
									// Small delay to ensure all database transactions are committed
									await new Promise((resolve) => setTimeout(resolve, 300));
									const res = await ProjectsAPI.scheduleProject(id);
									setScheduleResults(
										res || { recommendedOrder: [], detailedSchedule: [] }
									);
									setScheduleDialogOpen(true);
								} catch (err: any) {
									toast.error(
										err.response?.data?.error ||
											err.message ||
											"Scheduling failed"
									);
								} finally {
									setScheduling(false);
								}
							}}
							disabled={scheduling}
						>
							{scheduling ? (
								<span className="flex items-center gap-2">
									<div
										className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
										style={{
											borderColor: "#046FA9",
											borderTopColor: "transparent",
										}}
									/>
									<span className="hidden sm:inline">Analyzing tasks...</span>
									<span className="sm:hidden">Analyzing...</span>
								</span>
							) : (
								<span className="flex items-center gap-2">
									<Zap className="h-4 w-4" style={{ color: "#046FA9" }} />
									<span className="hidden sm:inline">Auto-schedule</span>
									<span className="sm:hidden">Schedule</span>
								</span>
							)}
						</Button>
						{appliedScheduleOrder.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setAppliedScheduleOrder([]);
									toast.success("Schedule order cleared");
								}}
								className="ml-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
							>
								<X className="h-4 w-4 mr-1" />
								Clear Order
							</Button>
						)}
					</div>
				</div>

				{tasks.length === 0 ? (
					<Card className="bg-gradient-to-br from-white/95 via-blue-50/60 to-indigo-100/40 border-dashed border-2 border-blue-300/50 shadow-lg">
						<CardContent className="py-16 text-center">
							<div className="mx-auto w-24 h-24 bg-gradient-to-br from-pathlock-primary to-pathlock-secondary rounded-full flex items-center justify-center mb-6 shadow-lg">
								<Target className="h-12 w-12 text-white" />
							</div>
							<CardTitle className="text-2xl mb-3 bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
								Ready to get started?
							</CardTitle>
							<CardDescription className="text-lg mb-6 max-w-md mx-auto text-pathlock-primary/80">
								Create your first task to begin organizing your project and
								tracking progress
							</CardDescription>
							<Button
								onClick={() => setDialogOpen(true)}
								size="lg"
								className="text-white bg-pathlock-accent hover:bg-pathlock-accentLight shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
							>
								<Plus className="mr-2 h-5 w-5" />
								Create First Task
							</Button>
						</CardContent>
					</Card>
				) : (
					<>
						<div className="space-y-3">
							{tasks.map((task) => (
								<Card
									key={task.id}
									className="group bg-gradient-to-br from-white/95 via-slate-50/60 to-pathlock-primary/5 backdrop-blur-sm border-pathlock-primary/20 shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-pathlock-primary/20 hover:border-pathlock-primary/40 hover:-translate-y-2 hover:from-white hover:via-pathlock-primary/5 hover:to-pathlock-secondary/10"
								>
									<CardContent className="pt-6">
										{editingTaskId === task.id ? (
											<div className="space-y-3">
												<Input
													value={editTitle}
													onChange={(e) => setEditTitle(e.target.value)}
													placeholder="Task title"
												/>
												<Textarea
													value={editDescription}
													onChange={(e) => setEditDescription(e.target.value)}
													placeholder="Task description"
													rows={2}
												/>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-1">
														<Label className="text-xs">Estimated Hours</Label>
														<Input
															type="number"
															min="1"
															max="200"
															value={editEstimatedHours}
															onChange={(e) =>
																setEditEstimatedHours(
																	parseInt(e.target.value) || 8
																)
															}
														/>
													</div>
													<div className="space-y-1">
														<Label className="text-xs">Due Date</Label>
														<Input
															type="date"
															value={editDueDate}
															onChange={(e) => setEditDueDate(e.target.value)}
														/>
													</div>
												</div>
												<div className="space-y-1">
													<Label className="text-xs">Dependencies</Label>
													<div className="flex flex-wrap gap-2">
														{editDependencies.map((dep) => (
															<Badge
																key={dep}
																variant="secondary"
																className="pr-1"
															>
																<span className="mr-1">{dep}</span>
																<button
																	type="button"
																	className="inline-flex items-center justify-center rounded hover:bg-muted px-0.5"
																	onClick={() =>
																		setEditDependencies((prev) =>
																			prev.filter((d) => d !== dep)
																		)
																	}
																	aria-label={`Remove ${dep}`}
																>
																	<X className="h-3 w-3" />
																</button>
															</Badge>
														))}
														{editDependencies.length === 0 && (
															<p className="text-xs text-muted-foreground">
																No dependencies selected
															</p>
														)}
													</div>
													<Popover
														open={editDepPickerOpen === task.id}
														onOpenChange={(o) =>
															setEditDepPickerOpen(o ? task.id : null)
														}
													>
														<PopoverTrigger asChild>
															<Button
																type="button"
																variant="outline"
																size="sm"
																className="mt-1"
															>
																<Plus className="mr-1 h-4 w-4" /> Add dependency
															</Button>
														</PopoverTrigger>
														<PopoverContent className="p-0 w-80" align="start">
															<Command>
																<CommandInput placeholder="Search tasks..." />
																<CommandEmpty>No tasks found.</CommandEmpty>
																<CommandList>
																	<CommandGroup heading="Project tasks">
																		{tasks
																			.filter(
																				(t) =>
																					t.title !== task.title &&
																					!editDependencies.includes(t.title)
																			)
																			.sort((a, b) =>
																				a.title.localeCompare(b.title)
																			)
																			.map((t) => (
																				<CommandItem
																					key={t.id}
																					value={t.title}
																					onSelect={(val) => {
																						const title = val.trim();
																						if (!title) return;
																						setEditDependencies((prev) =>
																							prev.includes(title)
																								? prev
																								: [...prev, title]
																						);
																					}}
																				>
																					<div className="flex flex-col">
																						<span className="text-sm font-medium">
																							{t.title}
																						</span>
																						<span className="text-xs text-muted-foreground">
																							{t.estimatedHours
																								? `${t.estimatedHours}h`
																								: ""}
																							{t.dueDate
																								? ` • Due ${new Date(
																										t.dueDate
																								  ).toLocaleDateString()}`
																								: ""}
																						</span>
																					</div>
																				</CommandItem>
																			))}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
												</div>
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={handleCancelEdit}
													>
														<X className="mr-1 h-4 w-4" />
														Cancel
													</Button>
													<Button
														size="sm"
														onClick={() => handleSaveEdit(task.id)}
													>
														<Check className="mr-1 h-4 w-4" />
														Save
													</Button>
												</div>
											</div>
										) : (
											<div className="flex items-start gap-4">
												<Checkbox
													checked={task.status === "Completed"}
													onCheckedChange={() =>
														handleToggleTask(task.id, task.status)
													}
													className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
												/>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2 mb-2">
														<div className="flex items-center gap-3 flex-1 min-w-0">
															<h3
																className={`text-lg font-semibold transition-all flex-1 ${
																	task.status === "Completed"
																		? "line-through text-slate-500 dark:text-slate-400"
																		: "text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400"
																}`}
															>
																{task.title}
															</h3>
															{appliedScheduleOrder.length > 0 &&
																appliedScheduleOrder.includes(task.title) && (
																	<div className="relative flex-shrink-0 group">
																		<div className="relative">
																			<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pathlock-accent via-pathlock-accentLight to-pathlock-accent/90 flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-white/60">
																				<span className="text-white text-xs font-bold tracking-tight">
																					{appliedScheduleOrder.indexOf(
																						task.title
																					) + 1}
																				</span>
																			</div>
																			<div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-pathlock-primary to-pathlock-secondary rounded-full shadow-sm">
																				<div className="absolute inset-0.5 bg-white/40 rounded-full"></div>
																			</div>
																			{/* Tooltip */}
																			<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
																				Schedule #
																				{appliedScheduleOrder.indexOf(
																					task.title
																				) + 1}
																			</div>
																		</div>
																	</div>
																)}
														</div>
														<Badge
															variant={
																task.status === "Completed"
																	? "default"
																	: task.status === "InProgress"
																	? "secondary"
																	: "outline"
															}
															className={`flex-shrink-0 text-xs ${
																task.status === "Completed"
																	? "bg-green-100 text-green-700 border-green-300"
																	: task.status === "InProgress"
																	? "bg-blue-100 text-blue-700 border-blue-300"
																	: "bg-slate-100 text-slate-600 border-slate-300"
															}`}
														>
															{task.status === "Completed"
																? "Done"
																: task.status === "InProgress"
																? "In Progress"
																: "To Do"}
														</Badge>
													</div>
													{task.description && (
														<p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
															{task.description}
														</p>
													)}
													<div className="flex flex-wrap gap-3 text-xs">
														{task.estimatedHours && (
															<div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
																<Clock className="h-3 w-3" />
																<span>{task.estimatedHours}h</span>
															</div>
														)}
														{task.dueDate && (
															<div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
																<Calendar className="h-3 w-3" />
																<span className="hidden sm:inline">Due: </span>
																<span>
																	{new Date(task.dueDate).toLocaleDateString()}
																</span>
															</div>
														)}
														{task.dependencies &&
															task.dependencies.length > 0 && (
																<div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
																	<Link2 className="h-3 w-3" />
																	<span className="hidden sm:inline">
																		Depends on:{" "}
																	</span>
																	<span className="truncate max-w-24 sm:max-w-none">
																		{task.dependencies.join(", ")}
																	</span>
																</div>
															)}
													</div>
													{task.createdAt && (
														<div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
															Created{" "}
															{new Date(task.createdAt).toLocaleDateString()}
														</div>
													)}
												</div>
												<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleStartEdit(task)}
														className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDeleteTask(task.id)}
														className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
														disabled={deletingTask === task.id}
													>
														{deletingTask === task.id ? (
															<div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
														) : (
															<Trash2 className="h-4 w-4" />
														)}
													</Button>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>

						<Dialog
							open={scheduleDialogOpen}
							onOpenChange={setScheduleDialogOpen}
						>
							<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 border-blue-200/50">
								<DialogHeader className="border-b border-blue-200/50 pb-4">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-md">
											<Zap className="h-4 w-4 text-white" />
										</div>
										<div>
											<DialogTitle className="text-xl bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">
												Smart Schedule Suggestions
											</DialogTitle>
											<DialogDescription className="text-pathlock-primary/80 mb-3">
												AI-powered task ordering based on dependencies and
												estimates
											</DialogDescription>
											<div className="bg-gradient-to-r from-pathlock-primary/5 to-pathlock-secondary/5 border border-pathlock-primary/20 rounded-lg p-3 text-sm shadow-sm">
												<div className="flex items-start gap-2">
													<div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mt-0.5 shadow-sm">
														i
													</div>
													<div>
														<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
															Schedule vs. Deadlines
														</p>
														<p className="text-blue-800 dark:text-blue-200 text-xs">
															<strong>Scheduled dates</strong> show optimal work
															timing based on dependencies.
															<strong> Original deadlines</strong> remain your
															target completion dates and can be edited
															independently.
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</DialogHeader>

								<div className="flex-1 overflow-auto py-4 pb-8">
									{scheduleResults.detailedSchedule.length === 0 ? (
										<div className="text-center py-12">
											<div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
												<Calendar className="h-8 w-8 text-slate-400" />
											</div>
											<p className="text-slate-500 dark:text-slate-400 mb-2">
												No tasks to schedule
											</p>
											<p className="text-sm text-slate-400 dark:text-slate-500">
												Create some tasks first to see scheduling suggestions
											</p>
										</div>
									) : (
										<div className="space-y-6">
											<div className="bg-gray-50 rounded-lg p-4">
												<h4
													className="font-semibold mb-2 flex items-center gap-2"
													style={{ color: "#101859" }}
												>
													<TrendingUp
														className="h-4 w-4"
														style={{ color: "#046FA9" }}
													/>
													Recommended Execution Order
												</h4>
												<div className="flex flex-wrap gap-2">
													{scheduleResults.recommendedOrder.map(
														(taskTitle, index) => (
															<div
																key={index}
																className="flex items-center gap-2"
															>
																<Badge variant="outline" className="bg-white">
																	{index + 1}. {taskTitle}
																</Badge>
																{index <
																	scheduleResults.recommendedOrder.length -
																		1 && (
																	<span className="text-slate-400">→</span>
																)}
															</div>
														)
													)}
												</div>
											</div>

											<div>
												<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
													<Calendar className="h-4 w-4 text-blue-600" />
													Detailed Schedule
												</h4>
												<div className="space-y-3 pb-4">
													{scheduleResults.detailedSchedule.map((s, index) => (
														<div
															key={s.taskId || index}
															className="bg-gradient-to-br from-white/95 via-slate-50/40 to-blue-50/30 border border-blue-200/50 rounded-lg p-4 shadow-md transition-all hover:shadow-lg hover:shadow-blue-200/30 hover:border-blue-300/60"
														>
															<div className="flex items-start justify-between gap-4">
																<div className="flex-1 min-w-0">
																	<div className="flex items-center gap-3 mb-2">
																		<h5 className="font-medium text-gray-900 truncate flex-1">
																			{s.title}
																		</h5>
																		<div className="relative flex-shrink-0">
																			<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pathlock-accent via-pathlock-accentLight to-pathlock-accent/90 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white/50">
																				{index + 1}
																			</div>
																			<div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-pathlock-primary to-pathlock-secondary rounded-full"></div>
																		</div>
																	</div>
																	<div className="flex flex-wrap gap-3 text-sm">
																		<div className="flex items-center gap-1 text-amber-600">
																			<Clock className="h-3 w-3" />
																			{s.estimatedHours}h estimated
																		</div>
																		{s.dependencies &&
																			s.dependencies.length > 0 && (
																				<div
																					className="flex items-center gap-1"
																					style={{ color: "#046FA9" }}
																				>
																					<Link2 className="h-3 w-3" />
																					Depends on:{" "}
																					{s.dependencies.join(", ")}
																				</div>
																			)}
																	</div>
																</div>
																<div className="text-right flex-shrink-0">
																	<div
																		className="text-sm font-medium"
																		style={{ color: "#101859" }}
																	>
																		<div className="flex items-center gap-1 justify-end">
																			<Calendar className="h-3 w-3" />
																			Optimal Schedule
																		</div>
																		<div className="text-xs mt-1 text-right">
																			{new Date(
																				s.scheduledStartDate
																			).toLocaleDateString()}{" "}
																			-{" "}
																			{new Date(
																				s.scheduledEndDate
																			).toLocaleDateString()}
																		</div>
																	</div>
																	<div
																		className="text-xs mt-2 text-right"
																		style={{ color: "#046FA9" }}
																	>
																		<div className="flex items-center gap-1 justify-end">
																			<div
																				className="w-2 h-2 rounded-full"
																				style={{ backgroundColor: "#046FA9" }}
																			></div>
																			Target Deadline
																		</div>
																		<div className="mt-1 text-right min-h-[20px]">
																			{s.originalDueDate ? (
																				<span className="text-blue-700 font-medium bg-blue-50 px-1 rounded">
																					{new Date(
																						s.originalDueDate
																					).toLocaleDateString()}
																				</span>
																			) : (
																				<span className="text-gray-400 text-xs italic bg-gray-50 px-1 rounded">
																					None set
																				</span>
																			)}
																		</div>
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										</div>
									)}
								</div>

								<div className="flex justify-end gap-3 pt-4 border-t">
									<Button
										variant="outline"
										onClick={() => setScheduleDialogOpen(false)}
									>
										Close
									</Button>
									<Button
										className="text-white bg-pathlock-accent hover:bg-pathlock-accentLight shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
										onClick={() => {
											setAppliedScheduleOrder(scheduleResults.recommendedOrder);
											toast.success(
												"Schedule order applied! Task numbers show recommended execution order.",
												{ duration: 4000 }
											);
											setScheduleDialogOpen(false);
										}}
									>
										<Check className="mr-2 h-4 w-4" />
										Use This Schedule
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</>
				)}
			</main>
		</div>
	);
};

export default ProjectDetail;
