import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectsAPI, TasksAPI } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Project {
	id: string;
	title: string;
	description: string | null;
}

interface Task {
	id: string;
	title: string;
	description: string | null;
	status: "Todo" | "InProgress" | "Done";
	dueDate?: string;
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
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");

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
		try {
			await TasksAPI.createTask(id!, {
				title: newTaskTitle,
				description: newTaskDescription || "",
				dueDate: new Date().toISOString(),
			});
			toast.success("Task created successfully!");
			setNewTaskTitle("");
			setNewTaskDescription("");
			setDialogOpen(false);
			fetchProjectAndTasks();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to create task"
			);
		}
	};

	const handleToggleTask = async (taskId: string, status: string) => {
		try {
			const originalTask = tasks.find((t) => t.id === taskId);
			if (!originalTask) {
				toast.error("Task not found");
				return;
			}
			const newStatus = status === "Done" ? "Todo" : "Done";
			await TasksAPI.updateTask(taskId, {
				title: originalTask.title,
				description: originalTask.description || "",
				status: newStatus,
				dueDate: originalTask.dueDate || new Date().toISOString(),
				assignedToUserId: originalTask.assignedToUserId || undefined,
			});
			setTasks(
				tasks.map((task) =>
					task.id === taskId ? { ...task, status: newStatus } : task
				)
			);
			toast.success(
				newStatus === "Done" ? "Task completed!" : "Task marked as incomplete"
			);
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to update task"
			);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		if (!confirm("Are you sure you want to delete this task?")) return;
		try {
			await TasksAPI.deleteTask(taskId);
			toast.success("Task deleted successfully!");
			fetchProjectAndTasks();
		} catch (error: any) {
			toast.error(
				error.response?.data?.error || error.message || "Failed to delete task"
			);
		}
	};

	const handleStartEdit = (task: Task) => {
		setEditingTaskId(task.id);
		setEditTitle(task.title);
		setEditDescription(task.description || "");
	};

	const handleSaveEdit = async (taskId: string) => {
		if (!editTitle.trim()) {
			toast.error("Task title cannot be empty");
			return;
		}
		try {
			// Find the original task to get its status, dueDate, assignedToUserId
			const originalTask = tasks.find((t) => t.id === taskId);
			await TasksAPI.updateTask(taskId, {
				title: editTitle,
				description: editDescription,
				status: originalTask?.status || "Todo",
				dueDate: originalTask?.dueDate || new Date().toISOString(),
				assignedToUserId: originalTask?.assignedToUserId || undefined,
			});
			toast.success("Task updated successfully!");
			setEditingTaskId(null);
			fetchProjectAndTasks();
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
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
			</div>
		);
	}

	if (!project) return null;

	const completedTasks = tasks.filter((t) => t.status === "Done").length;
	const totalTasks = tasks.length;

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card">
				<div className="container mx-auto px-4 py-4">
					<Button
						variant="ghost"
						onClick={() => navigate("/dashboard")}
						className="mb-2"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Dashboard
					</Button>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								{project.title}
							</h1>
							{project.description && (
								<p className="mt-2 text-muted-foreground">
									{project.description}
								</p>
							)}
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<p className="text-muted-foreground">
							{completedTasks} of {totalTasks} tasks completed
						</p>
						{totalTasks > 0 && (
							<div className="mt-2 h-2 w-64 rounded-full bg-secondary">
								<div
									className="h-full rounded-full bg-primary transition-all"
									style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
								/>
							</div>
						)}
					</div>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Task
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
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit">Create Task</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{tasks.length === 0 ? (
					<Card className="text-center py-12">
						<CardHeader>
							<CardTitle>No tasks yet</CardTitle>
							<CardDescription>
								Create your first task to get started
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<div className="space-y-3">
						{tasks.map((task) => (
							<Card key={task.id} className="transition-all hover:shadow-md">
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
												checked={task.status === "Done"}
												onCheckedChange={() =>
													handleToggleTask(task.id, task.status)
												}
												className="mt-1"
											/>
											<div className="flex-1">
												<h3
													className={`text-lg font-semibold ${
														task.status === "Done"
															? "line-through text-muted-foreground"
															: ""
													}`}
												>
													{task.title}
												</h3>
												{task.description && (
													<p className="mt-1 text-sm text-muted-foreground">
														{task.description}
													</p>
												)}
												<p className="mt-2 text-xs text-muted-foreground">
													{task.createdAt &&
														"Created " +
															new Date(task.createdAt).toLocaleDateString()}
												</p>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleStartEdit(task)}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDeleteTask(task.id)}
													className="text-destructive hover:bg-destructive/10"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
};

export default ProjectDetail;
