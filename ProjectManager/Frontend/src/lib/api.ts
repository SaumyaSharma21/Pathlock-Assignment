import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5118/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
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
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/auth";
		}
		return Promise.reject(error);
	}
);

// Auth API
export const AuthAPI = {
	login: async (username: string, password: string) => {
		const response = await api.post("/auth/login", { username, password });
		const { token } = response.data;
		localStorage.setItem("token", token);
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
		localStorage.removeItem("token");
	},

	isAuthenticated: () => {
		return !!localStorage.getItem("token");
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
};

// Tasks API
export const TasksAPI = {
	getTasksForProject: async (projectId: string) => {
		const response = await api.get(`/projects/${projectId}/tasks`);
		return response.data;
	},
	createTask: async (
		projectId: string,
		data: {
			title: string;
			description: string;
			dueDate: string;
			assignedToUserId?: string;
		}
	) => {
		const response = await api.post(`/projects/${projectId}/tasks`, data);
		return response.data;
	},

	updateTask: async (
		taskId: string,
		data: {
			title: string;
			description: string;
			status: "Todo" | "InProgress" | "Done";
			dueDate: string;
			assignedToUserId?: string;
		}
	) => {
		console.log("Updating task with data:", { taskId, data });

		// Convert status string to number and transform to backend format
		const statusMap = { Todo: 0, InProgress: 1, Done: 2 };
		const backendData = {
			Title: data.title,
			Description: data.description,
			Status: statusMap[data.status],
			DueDate: data.dueDate,
			AssignedToUserId: data.assignedToUserId,
		};

		try {
			const response = await api.put(`/tasks/${taskId}`, backendData);
			return response.data;
		} catch (error: any) {
			console.error("Error updating task:", {
				error,
				response: error.response?.data,
				status: error.response?.status,
				headers: error.response?.headers,
				config: error.config,
			});
			throw error;
		}
	},

	deleteTask: async (taskId: string) => {
		await api.delete(`/tasks/${taskId}`);
	},
};
