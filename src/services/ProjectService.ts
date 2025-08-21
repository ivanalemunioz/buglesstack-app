import Server from '@/libraries/Server';
import JsonConverter from '@/libraries/JsonConverter';

import { UserProject } from '@/models/Project';
import { useEffect, useState } from 'react';
import StateStore from '@/libraries/StateStore';

/**
 * Service to manage projects
 **/
class ProjectService extends StateStore {
	constructor () {
		super();
		this.initialize();
	}

	public storageKey: string = 'com.buglesstack.app';
	
	initialize (): void {
		// Initialize the state
		this.setStateProperty('userProjects', []);
		this.setStateProperty('activeUserProject', null);
	}

	/**
	 * Get all projects for the current user
	 **/
	async getAll (): Promise<UserProject[]> {
		// Get the projects
		const res = await Server.get('v1/projects');

		// Deserialize the projects
		const userProjects = JsonConverter.deserializeArray(res.data, UserProject);

		// Update the user projects
		this.setStateProperty('userProjects', userProjects);

		// Get the active project id
		const activeUserProjectId = localStorage.getItem(`${this.storageKey}:activeUserProjectId`);

		// Find the active project
		const activeUserProject = userProjects.find((project) => project.id === activeUserProjectId);

		// If a project is active, select it
		if (activeUserProjectId && activeUserProject) {
			this.selectProject(activeUserProject);
		}
		// If no project is active, select the first project
		else if (userProjects.length > 0) {
			this.selectProject(userProjects[0]);
		}

		// Return the projects
		return userProjects;
	}

	/**
	 * Create
	 **/
	async create (data: any): Promise<UserProject> {
		// Create the new project
	    const res = await Server.post('v1/projects', data);

		// Deserialize the new project
		let newProject = JsonConverter.deserializeObject(res.data, UserProject);

		// Update the user projects
		const userProjects = await this.getAll();

		// Find the new project in the user projects (to be sure it's the full object)
		newProject = userProjects.find((project) => project.id === newProject.id)!;

		// Select the new project
		this.selectProject(newProject);

		// Return the new project
		return newProject;
	}

	/**
	 * Edit project
	 **/
	async edit (userProjectId:string, data: any): Promise<UserProject> {
		// Edit the project
	    const res = await Server.post(`v1/projects/${userProjectId}`, data);

		// Deserialize the new project details
		let newProject = JsonConverter.deserializeObject(res.data, UserProject);

		// Update the user projects
		const userProjects = await this.getAll();

		// Find the new project in the user projects (to be sure it's the full object)
		newProject = userProjects.find((project) => project.id === newProject.id)!;

		// Select the new project
		this.selectProject(newProject);

		// Return the new project
		return newProject;
	}

	/**
	 * Change the active project
	 **/
	selectProject (project?: UserProject) {
		// If no project is provided, set the active project to null
		if (!project) {
			this.setStateProperty('activeUserProject', null);
			localStorage.removeItem(`${this.storageKey}:activeUserProjectId`);

			return;
		}

		// Update the active project
		this.setStateProperty('activeUserProject', project);

		// Save the active project id
		localStorage.setItem(`${this.storageKey}:activeUserProjectId`, project.id);
	}

	/**
	 * Get subscription management link
	 **/
	async getSubscriptionManagementLink (userProjectId: string, flow?: string): Promise<{ link: string }> {
		const res = await Server.get(`v1/projects/${userProjectId}/subscription-management-link${flow ? `?flow=${flow}` : ''}`);

		return res.data;
	}
}

const projectService = new ProjectService();

/**
 * Hook to get all user projects
 **/
export function useUserProjects () {
	const [userProjects, setUserProjects] = useState(projectService.getStateProperty('userProjects') as UserProject[]);

	useEffect(() => {
		const id = projectService.on('userProjects', setUserProjects);

		return () => {
			projectService.removeListener('userProjects', id);
		};
	}, [userProjects]);

	return userProjects;
}

/**
 * Hook to get the active user project
 **/
export function useActiveUserProject () {
	const [activeUserProject, setActiveUserProject] = useState(projectService.getStateProperty('activeUserProject') as UserProject | undefined);

	useEffect(() => {
		const id = projectService.on('activeUserProject', setActiveUserProject);

		return () => {
			projectService.removeListener('activeUserProject', id);
		};
	}, [activeUserProject]);

	return activeUserProject;
}

export default projectService;
