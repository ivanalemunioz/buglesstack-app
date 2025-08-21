import { useState, useEffect, ReactElement } from 'react';
import { AnimationBuilder, Mode } from '@ionic/core/components';

import StateStore from '@/libraries/StateStore';

interface ModalOptions {
    presentingElement?: HTMLElement;
    showBackdrop?: boolean;
    backdropDismiss?: boolean;
    cssClass?: string | string[];
    animated?: boolean;
    swipeToClose?: boolean;
    mode?: Mode;
    keyboardClose?: boolean;
    id?: string;
    enterAnimation?: AnimationBuilder;
    leaveAnimation?: AnimationBuilder;
}

interface Modal {
    id: string,
    options?: ModalOptions,
    content: ReactElement,
    dismiss: (value?: any) => void,
    onDidDismiss: Promise<any>
}

class ModalController extends StateStore {
	constructor () {
		super();

		this.setStateProperty('activeModals', []);
	}
    
	/**
     * Create modal
     * 
     * @param {ReactElement} content Content for the modal
     * @param {ModalOptions} options Options for the modal
     **/
	create (content: ReactElement, options?: ModalOptions): Modal {
		const modals = this.getStateProperty('activeModals') as Array<Modal>;

		// Id for the modal
		let id: string;

		do {
			id = String(Math.random() * 100000); 
			// eslint-disable-next-line no-loop-func 
		} while (typeof modals.find(modal => modal.id === id) !== 'undefined');

		// Function to resolve on did dismiss promise
		let resolveOnDidDismiss : (value: any) => void = () => {};
        
		// On did dismiss promise
		const onDidDismiss = new Promise<any>(resolve => {
			resolveOnDidDismiss = resolve; 
		});
        
		// Dismiss function
		const dismiss = (value?: any) => {
			// Actual active modals
			const modals = this.getStateProperty('activeModals') as Array<Modal>;
            
			// Find actual modal index
			const modalIndex = modals.findIndex(modal => modal.id === id);
            
			if (modalIndex !== -1) {
				// Resolve the promise
				resolveOnDidDismiss(value);
                
				// Copy modals to avoid modify the reference
				const newModals = [...modals];

				// Remove modal
				newModals.splice(modalIndex, 1);

				// Set new modals
				this.setStateProperty('activeModals', newModals);
			}
		};
        
		// Create the new modal
		const newModal: any = { id, content, options, dismiss, onDidDismiss };

		// Set new modals
		this.setStateProperty('activeModals', [...modals, newModal]);

		return newModal;
	}

	/**
     * Dismiss the top modal
     **/
	async dismiss (value?: any): Promise<void> {
		const modals = this.getStateProperty('activeModals') as Array<Modal>;
        
		if (modals.length > 0) {
			modals[modals.length - 1].dismiss(value);
		}
	}
}

const modalController = new ModalController();

export function useActiveModals () {
	const [activeModals, setActiveModals] = useState(modalController.getStateProperty('activeModals') as Array<Modal>);

	useEffect(() => {
		const id = modalController.on('activeModals', setActiveModals);

		return () => {
			modalController.removeListener('activeModals', id);
		};
	}, [activeModals]);

	return activeModals;
}

export default modalController;
