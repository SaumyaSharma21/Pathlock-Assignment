import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5118/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = sessionStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Only redirect on 401 if it's not a login request (to allow proper error handling in login form)
		if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
			sessionStorage.removeItem("token");
			window.location.href = "/auth";
		}
		return Promise.reject(error);
	}
);

// Clean up any old localStorage tokens (migration to sessionStorage)
if (typeof window !== 'undefined') {
	localStorage.removeItem("token");
}

// Auth API
export const AuthAPI = {
	login: async (username: string, password: string) => {
		const response = await api.post("/auth/login", { username, password });
		const { token } = response.data;
		sessionStorage.setItem("token", token);
		return response.data;
	},

	register: async (username: string, email: string, password: string) => {
		const response = await api.post("/auth/register", {
			username,
			email,
			password,
		});
		return response.data;
	},

	logout: () => {
		sessionStorage.removeItem("token");
		// Also clear localStorage as a safety measure
		localStorage.removeItem("token");
	},

	isAuthenticated: () => {
		return !!sessionStorage.getItem("token");
	},
};

// Projects API
export const ProjectsAPI = {
	getAllProjects: async () => {
		const response = await api.get("/projects");
		return response.data;
	},

	getProject: async (id: string) => {
		const response = await api.get(`/projects/${id}`);
		return response.data;
	},

	createProject: async (data: { title: string; description: string }) => {
		const response = await api.post("/projects", data);
		return response.data;
	},

	deleteProject: async (id: string) => {
		await api.delete(`/projects/${id}`);
	},

	// Scheduler
	scheduleProject: async (projectId: string, data?: { 
		startDate?: string; 
		tasks?: Array<{ title: string; estimatedHours: number; dueDate?: string; dependencies?: string[] }> 
	}) => {
		const response = await api.post(`/v1/projects/${projectId}/schedule`, data || {});
		return response.data as { 
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
			}>
		};
	}
};

// Tasks API
export const TasksAPI = {
	getTasksForProject: async (projectId: string) => {
		const response = await api.get(`/projects/${projectId}/tasks`);
		// Convert status numbers from backend to strings for frontend
		const statusMap = { 0: "NotStarted", 1: "InProgress", 2: "Completed" };
		return response.data.map((task: any) => ({
			...task,
			status: statusMap[task.status as 0 | 1 | 2] || "NotStarted"
		}));
	},
	createTask: async (
		projectId: string,
		data: {
			title: string;
			description: string;
			dueDate: string;
			estimatedHours?: number;
			dependencies?: string[];
			assignedToUserId?: string;
		}
	) => {
		const response = await api.post(`/projects/${projectId}/tasks`, data);
		// Convert status number from backend to string for frontend
		const statusMap = { 0: "NotStarted", 1: "InProgress", 2: "Completed" };
		return {
			...response.data,
			status: statusMap[response.data.status as 0 | 1 | 2] || "NotStarted"
		};
	},

	updateTask: async (
		taskId: string,
		data: {
			title: string;
			description: string;
			status: "NotStarted" | "InProgress" | "Completed";
			dueDate: string;
			estimatedHours?: number;
			dependencies?: string[];
			assignedToUserId?: string;
		}
	) => {
		// Convert status string to number for backend enum
		const statusMap = { NotStarted: 0, InProgress: 1, Completed: 2 };
		const backendData = {
			title: data.title,
			description: data.description,
			status: statusMap[data.status],
			dueDate: data.dueDate,
			estimatedHours: data.estimatedHours || 8,
			dependencies: data.dependencies || [],
			assignedToUserId: data.assignedToUserId,
		};

		const response = await api.put(`/tasks/${taskId}`, backendData);
		return response.data;
	},

	deleteTask: async (taskId: string) => {
		await api.delete(`/tasks/${taskId}`);
	},
};
