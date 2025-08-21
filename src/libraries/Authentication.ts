import { useState, useEffect } from 'react';

import Server from '@/libraries/Server';
import Mixpanel from '@/libraries/Mixpanel';
import EventEmitter from '@/libraries/EventEmitter';
import JsonConverter from './JsonConverter';

import { User } from '@/models//User';
import { SessionToken } from '@/models//SessionToken';

import UserService from '@/services//UserService';
import ProjectService from '@/services/ProjectService';

class Authentication extends EventEmitter {
	private _sessionToken: SessionToken | undefined = undefined;
	
	/**
	 * True when the user is authenticated
	 **/
	public _isAuthenticated: boolean = false;

	public set isAuthenticated (v : boolean) {
	    this._isAuthenticated = v;

	    this.emit('isAuthenticated', v);
	}

	public get isAuthenticated () : boolean {
	    return this._isAuthenticated;
	}

	private _user: User | undefined = undefined;

	public set user (v : User | undefined) {
	    this._user = v;

	    this.emit('user', v);
	}

	public get user () : User | undefined {
	    return this._user;
	}
	
	public initialized: boolean = false;
	
	public storageKey: string = 'com.buglesstack.app';

	/**
	 * Initialize the authentication library
	 **/
	public async initialize (): Promise<void> {
	    if (!this.initialized) {
	        this.initialized = true;
			
	        const sessionTokenJSON = localStorage.getItem(`${this.storageKey}:sessionToken`);

	        if (sessionTokenJSON) {
	            await this.setSessionToken(JsonConverter.deserializeObject(JSON.parse(sessionTokenJSON), SessionToken));
				
	            if (this.sessionToken?.isRefreshRequired) {
	                await this.refreshSession();
	            }
	        }
			else {
	            this.sessionToken = undefined;
	        }
	    }
	}

	/**
	 * Set session token
	 **/
	private async setSessionToken (sessionToken?: SessionToken): Promise<void> {
	    this.sessionToken = sessionToken;

	    if (sessionToken) {
	        this.handleInvalidCredentialsError();

	        this.user = await UserService.getMe();

	        await Mixpanel.identify(this.user.id, {
	            $email: this.user.email,
	            $created: this.user.createdAt
	        });

			// Load user projects
			await ProjectService.getAll();
	    }
		else {
	        this.user = undefined;
			ProjectService.setStateProperty('userProjects', []);

	        await Mixpanel.reset();
	    }
	}

	/**
	 * SessionToken getter
	 **/
	get sessionToken (): SessionToken | undefined {
	    if (!this.initialized) {
	        throw new Error('Authentication library not initialized');
	    }

	    return this._sessionToken;
	}

	/**
	 * SessionToken setter
	 **/
	private set sessionToken (sessionToken: SessionToken | undefined) {
	    this._sessionToken = sessionToken;

	    if (sessionToken) {
	        Server.defaults.headers.common.Authorization = `Bearer ${sessionToken.accessToken}`;

	        this.isAuthenticated = true;
	    }
		else {
	        delete Server.defaults.headers.common.Authorization;
			
	        this.isAuthenticated = false;
	    }

	    this.initialized = true;
	}

	/**
	 * Login user in to the dashboard
	 *
	 * @param {string} email: User email
	 * @param {string} password: User password
	 **/
	async login (email: string, verificationCode: string): Promise<void> {
	    const data = {
	        email, 
	        verification_code: verificationCode, 
	        type: 'verification_code'
	    };

	    const res = await Server.post('v1/users/auth', data);

	    await this.setSessionToken(JsonConverter.deserializeObject(res.data, SessionToken));
	
	    localStorage.setItem(`${this.storageKey}:sessionToken`, JSON.stringify(JsonConverter.serialize(this.sessionToken!)));
	}

	/**
	 * Create user verification code
	 *
	 * @param {string} email: User email
	 **/
	async createVerificationCode (email: string): Promise<{exists: boolean}> {
	    const data = {
	        email
	    };

	    const res = await Server.post('v1/users/verification-code', data);

	    return res.data;
	}

	/**
	 * Create user
	 *
	 * @param {string} email: User email
	 **/
	async createUser (email: string, verificationCode: string, metadata: any): Promise<void> {
	    const data = {
	        email, 
	        verification_code: verificationCode,
	        metadata
	    };

	    const res = await Server.post('v1/users', data);

	    await this.setSessionToken(JsonConverter.deserializeObject(res.data, SessionToken));

	    localStorage.setItem(`${this.storageKey}:sessionToken`, JSON.stringify(JsonConverter.serialize(this.sessionToken!)));
	}

	/**
	 * Logout user
	 **/
	async logout (): Promise<void> {
	    if (this.sessionToken) {
	        await Server.delete('v1/users/auth');

	        await this.setSessionToken(undefined);
	    }
		
	    localStorage.removeItem(`${this.storageKey}:sessionToken`);

		// Intialize the project service
		ProjectService.initialize();
	}

	/**
	 * Refresh session token
	 **/
	private async refreshSession (): Promise<void> {
	    if (this.sessionToken) {
	        const data = {
	            refresh_token: this.sessionToken.refreshToken,
	            type: 'refresh_token'
	        };

	        try {
	            const res = await Server.post('v2/users/auth', data);
				
	            await this.setSessionToken(JsonConverter.deserializeObject(res.data, SessionToken));
				
	            localStorage.setItem(`${this.storageKey}:sessionToken`, JSON.stringify(JsonConverter.serialize(this.sessionToken)));
	        }
			catch (error) {
	            await this.logout();
	        }
	    }
	}

	private handleInvalidCredentialsError () {
	    Server.interceptors.response.use(res => res, error => {
	        if (error?.response?.status === 401) {
	            this.logout();
	        }

	        return Promise.reject(error);
	    });
	}
}

const authentication = new Authentication();

export function useIsAuthenticated () {
	const [isAuthenticated, setIsAuthenticated] = useState(authentication.isAuthenticated);
	
	useEffect(() => {
		const id = authentication.on('isAuthenticated', setIsAuthenticated);

		return () => {
			authentication.removeListener('isAuthenticated', id);
		};
	}, [isAuthenticated]);

	return isAuthenticated;
}

export function useUser () {
	const [user, setUser] = useState(authentication.user);
	
	useEffect(() => {
		const id = authentication.on('user', setUser);

		return () => {
			authentication.removeListener('user', id);
		};
	}, [user]);

	return user;
}

export default authentication;
