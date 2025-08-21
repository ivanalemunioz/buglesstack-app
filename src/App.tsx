import { IonReactRouter } from '@ionic/react-router';
import React, { Suspense, useEffect, useState } from 'react';
import { IonApp, IonLoading, IonModal, IonAlert } from '@ionic/react';

import Authentication from '@/libraries/Authentication';
import InfoHelper, { useIsLoadingShown } from '@/libraries/InfoHelper';
import { useActiveModals } from '@/libraries/ModalController';
import { useActiveAlerts } from '@/libraries/AlertController';
import Mixpanel from '@/libraries/Mixpanel';

import { ThemeProvider } from '@/components/theme-provider';
import Router from './components/router';

const App: React.FC = () => {
	const showLoading = useIsLoadingShown();
	const [appInitialized, setAppInitialized] = useState(false);
	const [appError, setAppError] = useState(false);
	const activeModals = useActiveModals();
	const activeAlerts = useActiveAlerts();

	// Initialize app
	useEffect(() => {
		(async () => {
			try {
				await Authentication.initialize();
				await Mixpanel.init();

				Mixpanel.track('InitApp');

				setAppInitialized(true);
			}
			catch (error) {
				console.log(error);

				InfoHelper.showErrorAlert({ 
					header: 'An error has occurred.',
					subHeader: 'Try reloading the page.',
					backdropDismiss: false
				});

				setAppError(true);
			}
		})(); 
	}, []);

	return (
		<ThemeProvider defaultTheme="light" storageKey="com.buglesstack.app:ui-theme">
			<IonApp>
				<IonLoading isOpen={showLoading || (!appInitialized && !appError)} />
				
				{appInitialized && <IonReactRouter>
					<Suspense fallback={ <IonLoading isOpen={!showLoading} /> }>
						<Router />
					</Suspense>
				</IonReactRouter>}

				{activeModals.map(modal => <IonModal {...modal.options} key={modal.id} isOpen onDidDismiss={() => modal.dismiss()}>
					{modal.content}
				</IonModal>)}

				{/* Show active alerts */}
				{activeAlerts.map(alert => <IonAlert 
					{...alert.options}
					isOpen 
					key={alert.id} 
					onDidDismiss={() => alert.dismiss()}
				/>)}
			</IonApp>
		</ThemeProvider>
	);
};

export default App;
