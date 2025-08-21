import React from 'react';

import { IonText } from '@ionic/react';

import { useDataErrorsErrors } from '@/libraries/DataErrors';
import { cn } from '@/lib/utils';

interface DataErrorProps {
	name: string
}

const DataError: React.FC<React.ComponentPropsWithoutRef<typeof IonText> & DataErrorProps> = (props) => {
	const errors = useDataErrorsErrors();
	
	const value = props.name.split('.').reduce((curr, key) => curr ? curr[key] : undefined, errors);
	
	return (
		!value ? <></> : <IonText {...props} className={cn('ion-margin-bottom', props.className)} style={{ display: 'block' }} color="danger">
			<small>{value}</small>
		</IonText>
	);
};

export default DataError;
