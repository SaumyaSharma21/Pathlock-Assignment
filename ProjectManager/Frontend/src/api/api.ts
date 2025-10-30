import axios from "axios";import axios from "axios";



const api = axios.create({const api = axios.create({

	baseURL: "http://localhost:5118",	baseURL: "http://localhost:5118",

	headers: {});

		'Content-Type': 'application/json',

	},export default api;

});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;