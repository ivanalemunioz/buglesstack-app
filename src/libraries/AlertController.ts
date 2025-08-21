import { useState, useEffect } from 'react';
// import { AnimationBuilder, Mode } from '@ionic/core/components';

import StateStore from '@/libraries/StateStore';

// interface AlertOptions {
//     presentingElement?: HTMLElement;
//     showBackdrop?: boolean;
//     backdropDismiss?: boolean;
//     cssClass?: string | string[];
//     animated?: boolean;
//     swipeToClose?: boolean;
//     mode?: Mode;
//     keyboardClose?: boolean;
//     id?: string;
//     enterAnimation?: AnimationBuilder;
//     leaveAnimation?: AnimationBuilder;
// }

export interface AlertOptions {
	header?: string;
	subHeader?: string;
	buttons?: (AlertButton | string)[];
	backdropDismiss?: boolean;
    cssClass?: string | string[];
}

declare type AlertButtonOverlayHandler = boolean | void | {
	[key: string]: any;
};

interface AlertButton {
	text: string;
	role?: 'cancel' | 'destructive' | string;
	cssClass?: string | string[];
	id?: string;
	handler?: (value: any) => AlertButtonOverlayHandler | Promise<AlertButtonOverlayHandler>;
}

export interface Alert {
    id: string,
    options: AlertOptions,
    // content: ReactElement,
    dismiss: (value?: any) => void,
    onDidDismiss: Promise<any>
}

class AlertController extends StateStore {
	constructor () {
		super();

		this.setStateProperty('activeAlerts', []);
	}
    
	/**
     * Create alert
     * 
     * @param {ReactElement} content Content for the alert
     * @param {AlertOptions} options Options for the alert
     **/
	create (options: AlertOptions): Alert {
		const alerts = this.getStateProperty('activeAlerts') as Array<Alert>;

		// Id for the alert
		let id: string;

		do {
			id = String(Math.random() * 100000); 
			// eslint-disable-next-line no-loop-func 
		} while (typeof alerts.find(alert => alert.id === id) !== 'undefined');

		// Function to resolve on did dismiss promise
		let resolveOnDidDismiss : (value: any) => void = () => {};
        
		// On did dismiss promise
		const onDidDismiss = new Promise<any>(resolve => {
			resolveOnDidDismiss = resolve; 
		});
        
		// Dismiss function
		const dismiss = (value?: any) => {
			// Actual active alerts
			const alerts = this.getStateProperty('activeAlerts') as Array<Alert>;
            
			// Find actual alert index
			const alertIndex = alerts.findIndex(alert => alert.id === id);
            
			if (alertIndex !== -1) {
				// Resolve the promise
				resolveOnDidDismiss(value);
                
				// Copy alerts to avoid modify the reference
				const newAlerts = [...alerts];

				// Remove alert
				newAlerts.splice(alertIndex, 1);

				// Set new alerts
				this.setStateProperty('activeAlerts', newAlerts);
			}
		};
        
		// Create the new alert
		const newAlert: Alert = { id, options, dismiss, onDidDismiss };

		// Set new alerts
		this.setStateProperty('activeAlerts', [...alerts, newAlert]);

		return newAlert;
	}

	/**
     * Dismiss the top alert
     **/
	async dismiss (value?: any): Promise<void> {
		const alerts = this.getStateProperty('activeAlerts') as Array<Alert>;
        
		if (alerts.length > 0) {
			alerts[alerts.length - 1].dismiss(value);
		}
	}
}

const alertController = new AlertController();

export function useActiveAlerts () {
	const [activeAlerts, setActiveAlerts] = useState(alertController.getStateProperty('activeAlerts') as Array<Alert>);

	useEffect(() => {
		const id = alertController.on('activeAlerts', setActiveAlerts);

		return () => {
			alertController.removeListener('activeAlerts', id);
		};
	}, [activeAlerts]);

	return activeAlerts;
}

export default alertController;
