import { useState, useEffect } from 'react';
import AlertController, { AlertOptions, Alert } from '@/libraries/AlertController';

class InfoHelper {
	/**
	 * Loading properties
	 **/
	public _isLoadingShown: boolean = false;
	
	public set isLoadingShown (v : boolean) {
	    this._isLoadingShown = v;

	    for (const i in this.isLoadingShownHandlers) {
	        this.isLoadingShownHandlers[i](v);
	    }
	}

	public get isLoadingShown () : boolean {
	    return this._isLoadingShown;
	}

	/**
	 * Here are the errors hadlers
	 **/
	private isLoadingShownHandlers: { [ name: string ]: (v: any) => void } = {}; 

	/**
	 * Add error handler
	 **/
	public addIsLoadingShownHandler (handler: (v: any) => void) {
	    let id: string;

	    do {
	        id = String(Math.random() * 100000);
	    }
	    while (typeof this.isLoadingShownHandlers[id] !== 'undefined');

	    this.isLoadingShownHandlers[id] = handler;

	    return id;
	}

	/**
	 * Remove error handler
	 **/
	public removeIsLoadingShownHandler (id: string) {
	    delete this.isLoadingShownHandlers[id];
	}

	/**
	 * Show the loading spinner
	 **/
	async showLoading (): Promise<void> {
	    if (!this.isLoadingShown) {
	        this.isLoadingShown = true;
	    }
	}

	/**
	 * Hide the loading spinner
	 **/
	async hideLoading (): Promise<void> {
	    if (this.isLoadingShown) {
	        this.isLoadingShown = false;
	    }
	}
	
	/**
	 * Error alert element
	 **/
	errorAlert: Alert | boolean = false;

	/**
	 * Show alert
	 *
	 * @param {AlertOptions} options Alert options
	 **/
	async showAlert (options: AlertOptions) {
	    const alert = AlertController.create(options);

	    return alert;
	}

	/**
	 * Show error alert
	 *
	 * @param {AlertOptions} options Alert options
	 **/
	async showErrorAlert (options?: AlertOptions) {
	    if (this.errorAlert) {
	        return;
	    }
		
	    this.errorAlert = true;

	    this.errorAlert = await this.showAlert(options || {
	        header: 'Oops...',
	        subHeader: 'An error has occurred. Please try again.',
			buttons: ['Got it'],
			cssClass: '!z-[50123]'
	    });

	    await this.errorAlert.onDidDismiss;

	    this.errorAlert = false;
	}
}

const infoHelper = new InfoHelper();

export function useIsLoadingShown () {
	const [isLoadingShown, setIsLoadingShown] = useState(infoHelper.isLoadingShown);
	
	useEffect(() => {
		const id = infoHelper.addIsLoadingShownHandler(setIsLoadingShown);

		return () => {
			infoHelper.removeIsLoadingShownHandler(id);
		};
	}, [isLoadingShown]);

	return isLoadingShown;
}

export default infoHelper;
