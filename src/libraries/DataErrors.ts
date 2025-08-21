import { useState, useEffect } from 'react';

import Server from '@/libraries/Server';

class DataErrors {
	/**
	 * Data errors
	 **/
	public _errors: any = {};
	
	public set errors (v : any) {
	    this._errors = v;

	    for (const i in this.handlers) {
	        this.handlers[i](v);
	    }
	}

	public get errors () : any {
	    return this._errors;
	}

	/**
	 * Here are the errors hadlers
	 **/
	private handlers: { [ name: string ]: (v: any) => void } = {}; 

	/**
	 * Add error handler
	 **/
	public addHandler (handler: (v: any) => void) {
	    let id: string;

	    do {
	        id = String(Math.random() * 100000);
	    }
	    while (typeof this.handlers[id] !== 'undefined');

	    this.handlers[id] = handler;

	    return id;
	}

	/**
	 * Remove error handler
	 **/
	public removeHandler (id: string) {
	    delete this.handlers[id];
	}

	constructor () {
	    this.handleDataErrors();
	}

	private handleDataErrors () {
		Server.interceptors.request.use(config => {
	        this.errors = {};
			
			return config;
		});

	    Server.interceptors.response.use(res => {
	        this.errors = {};
			
	        return res;
	    }, error => {
	        if (error?.response?.data?.data_errors) {
	            this.errors = error?.response?.data?.data_errors;
	        }
			else {
	            this.errors = {};
	        }

	        return Promise.reject(error);
	    });
	}
}

const dataErrors = new DataErrors();

export function useDataErrorsErrors () {
	const [errors, setErrors] = useState(dataErrors.errors);
	
	useEffect(() => {
		const id = dataErrors.addHandler(setErrors);

		return () => {
			dataErrors.removeHandler(id);
		};
	}, [errors]);

	return errors;
}

export default dataErrors;
