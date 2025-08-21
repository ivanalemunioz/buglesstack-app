import React, { useCallback, useEffect, useState } from 'react';
import { 
	IonContent,
	IonPage
} from '@ionic/react';

import InfoHelper from '@/libraries/InfoHelper';
import ProjectService, { useActiveUserProject, useUserProjects } from '@/services/ProjectService';
import Authentication from '@/libraries/Authentication';

import DataError from '@/components/DataError';

import './ProjectsCreate.scss';
import Mixpanel from '@/libraries/Mixpanel';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { ExternalLink, LogOut, X } from 'lucide-react';

import { useHistory, useLocation, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const ProjectsCreatePage: React.FC = () => {
	const [name, setName] = useState('');
	const [confirmationRequired, setConfirmationRequired] = useState(false);
	const [editing, setEditing] = useState(false);
	const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
	const [billingPlan, _setBillingPlan] = useState<'dev' | 'pro'>('dev');
	const history = useHistory();
	const location = useLocation();
	const userProjects = useUserProjects();
	const activeUserProject = useActiveUserProject();
	
	async function create () {
		await InfoHelper.showLoading();

		try {
			// Prepare the data
			const data = { 
				name,
				billing_period: billingPeriod,
				billing_plan: billingPlan
			};
			
			// Create the project
			await ProjectService.create(data);
		
			// Track the event
			await Mixpanel.track('create_project');

			// Redirect to home
			history.replace('/crashes');

			// Hide the loading
			await InfoHelper.hideLoading();
		}
		catch (error) {
			console.log(error);

			await InfoHelper.hideLoading();
			
			// Show the error alert if it's not a validation error
			if (!error?.response?.data?.data_errors) {
				await InfoHelper.showErrorAlert();
			}
			// Show the form if it's a validation error
			else {
				setConfirmationRequired(false);
			}
		}
	}
	
	async function edit () {
		if (!activeUserProject) {
			return;
		}

		await InfoHelper.showLoading();

		try {
			// Prepare the data
			const data = { 
				name,
				billing_period: billingPeriod,
				billing_plan: billingPlan
			};
			
			// Create the project
			await ProjectService.edit(activeUserProject.id, data);
		
			// Track the event
			await Mixpanel.track('edit_project', {
				id: activeUserProject.project.id
			});

			// Redirect to billing
			history.replace('/billing');

			// Hide the loading
			await InfoHelper.hideLoading();
		}
		catch (error) {
			console.log(error);

			await InfoHelper.hideLoading();
			
			// Show the error alert if it's not a validation error
			if (!error?.response?.data?.data_errors) {
				await InfoHelper.showErrorAlert();
			}
			// Show the form if it's a validation error
			else {
				setConfirmationRequired(false);
			}
		}
	}

	function logout () {
		InfoHelper.showAlert({
			header: 'Cerrar sesión',
			subHeader: 'Seguro que quiere cerrar sesión?',
			buttons: ['Cancelar', {
				text: 'Cerrar sesión',
				handler: async () => {
					await InfoHelper.showLoading();

					try {
						await Authentication.logout();

						await Mixpanel.track('logout');

						// Redirect to login
						history.replace('/login');

						await InfoHelper.hideLoading();
					}
					catch (error) {
						console.log(error);

						await InfoHelper.hideLoading();
						await InfoHelper.showErrorAlert();
					}
				}
			}]
		});
	}

	// Calculate total price
	function calculateTotal () {
		let total = 0;

		if (billingPlan === 'pro') {
			total += billingPeriod === 'monthly' ? 5 : 50;
		}

		return total;
	}

	const setBillingPlan = useCallback((plan: typeof billingPlan) => {
		_setBillingPlan(plan);

		// Reset features based on the selected plan
		if (plan === 'dev') {
			setBillingPeriod('monthly');
		}
	}, [setBillingPeriod]);

	useEffect(() => {
		const editing = !!activeUserProject && location.pathname === '/projects/edit';
	
		Mixpanel.track(editing ? 'ProjectEditPage' : 'ProjectCreatePage');

		setEditing(editing);

		if (editing) {	
			setName(activeUserProject.project.name);
			setBillingPeriod(activeUserProject.project.billingPeriod as typeof billingPeriod);
			setBillingPlan(activeUserProject.project.billingPlan as typeof billingPlan);
		}
		else {	
			setName('');
			setBillingPeriod('monthly');
			setBillingPlan('dev');
		}
	}, [location.pathname, activeUserProject, setBillingPlan]);

	return (
		<IonPage className="login-page">
			<IonContent>
				<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
					{
						userProjects.length > 0 && 
						// Show the back button if the user has projects
						<Link to={editing ? '/billing' : '/'} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
							<X className="size-6" />
						</Link>
					}
					<div className="flex w-full max-w-md flex-col gap-6">
						<a href="/" className="flex items-center gap-2 self-center font-medium">
							<div className="flex p-0.5 h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<img className='hidden dark:block' src="/assets/icon/icon-black-x256.png" alt=""/>
								<img className='dark:hidden' src="/assets/icon/icon-white-x256.png" alt=""/>
							</div>
							Buglesstack
						</a>
						<div className='flex flex-col gap-6'>
							<Card>
								<CardHeader className="text-center">
									<CardTitle className="text-xl">
										{
											editing ? 'Change project details' : 'Create new project'
										}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{/* Project creation form */}
									{!confirmationRequired && <form onSubmit={(e) => {
										e.preventDefault();

										setConfirmationRequired(true);
									}}>
										<div className="grid gap-6">
											<div className="grid gap-6">
												{/* Email input */}
												<div className="grid gap-2">
													<Label htmlFor="name">Choose a name for your project</Label>
													<Input
														id="name"
														type="name"
														defaultValue={name}
														placeholder="Buglesstack Project"
														required
														maxLength={20}
														onChangeCapture={e => setName(e.currentTarget.value)}
													/>
													<DataError name="name" />
												</div>

												{/* Billing period */}
												{billingPlan !== 'dev' && <div className="grid gap-2">
													<Label htmlFor="billing_period">Choose the billing period</Label>
													<Select value={billingPeriod} onValueChange={value => setBillingPeriod(value as any)}>
														<SelectTrigger id="billing_period">
															<SelectValue placeholder="Choose an option" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="monthly">Monthly</SelectItem>
															<SelectItem value="yearly">Yearly</SelectItem>
														</SelectContent>
													</Select>
													<DataError name="billing_period" />
												</div>}

												{/* Billing plan */}
												<div className="grid gap-2">
													<Label htmlFor="billing_plan">Which plan do you want for your project?</Label>
													<Select value={billingPlan} onValueChange={value => setBillingPlan(value as any)}>
														<SelectTrigger id="billing_plan">
															<SelectValue placeholder="Choose an option" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="dev">Dev</SelectItem>
															<SelectItem value="pro">Pro - {billingPeriod === 'monthly' ? '5 USD /month' : <>50 USD /year <Badge variant={'secondary'}>2 free months</Badge></>}</SelectItem>
														</SelectContent>
													</Select>
													<DataError name="billing_plan" />
													<a 
														className='underline underline-offset-4 text-xs'
														href="https://buglesstack.com/pricing" 
														target="_blank"
														rel="noopener noreferrer"
														onClick={() => Mixpanel.track('ProjectsCreatePage_click_pricing')}
													>
														See differences between plans
														<ExternalLink className='ml-1 inline size-3' />
													</a>
												</div>

												<Button className="w-full" type='submit'>
													Continue
												</Button>
											</div>
										</div>
									</form>}

									{/* Project creation confirmation  */}
									{confirmationRequired && <div className='grid gap-2'>
										<div className="flex align-center justify-between border-b border-muted-foreground pb-2 border-dashed ">
											<span className='text-sm font-medium'>Project Name</span >
											<span className='text-sm'>{name}</span>
										</div>
										{calculateTotal() > 0 && <div className="flex align-center justify-between border-b border-muted-foreground pb-2 border-dashed ">
											<span className='text-sm font-medium'>Billing Period</span>
											<span className='text-sm'>
												{billingPeriod === 'monthly' && 'Monthly'}
												{billingPeriod === 'yearly' && 'Yearly'}
											</span>
										</div>}
										<div className="flex align-center justify-between">
											<span className='text-sm font-medium'>Plan</span>
											<span className='text-sm'>
												{billingPlan === 'dev' && 'Dev'}
												{billingPlan === 'pro' && 'Pro'}
											</span>
										</div>

										{billingPlan !== 'dev' && <div className='flex align-center justify-between text-sm font-medium border-dashed border-t border-muted-foreground py-2 mb-2'>
											<span>Total</span>  
											<span className='text-right '>
												{calculateTotal()} USD {billingPeriod === 'monthly' ? ' /month' : ' /year'}

												{!editing && calculateTotal() > 0 && <div className='text-xs font-medium text-muted-foreground'>
													No credit card is required to start.
													<br />
													You have 14 days of free trial.
												</div>}
											</span>
										</div>}
										
										<Button className="w-full" variant={'ghost'} onClick={() => setConfirmationRequired(false)}>
											Change Details
										</Button>

										{editing && <Button className="w-full" onClick={edit}>
											Save Project Details
										</Button>}

										{!editing && <Button className="w-full" onClick={create}>
											Create Project
										</Button>}
									</div>}
								</CardContent>
							</Card>

							{/* Logout button */}
							{userProjects.length === 0 && <Button variant={'link'} onClick={() => {
								logout();
							}} >
								<LogOut />
								Log Out
							</Button>}
						</div>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default ProjectsCreatePage;
