import moment from 'moment';
import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronDown, ExternalLink, Sparkles } from 'lucide-react';

import Mixpanel from '@/libraries/Mixpanel';
import InfoHelper from '@/libraries/InfoHelper';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ProjectService, { useActiveUserProject } from '@/services/ProjectService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import './Bills.scss';

const Bills: React.FC = () => {
	const activeUserProject = useActiveUserProject();

	async function getSubscriptionManagementLink (flow?: 'subscription_reactivate' | 'subscription_cancel' |'payment_method_update') {
		if (!activeUserProject) {
			return;
		}

		await InfoHelper.showLoading();

		try {
			Mixpanel.track('get_subscription_management_link', {
				flow
			});

			const data = await ProjectService.getSubscriptionManagementLink(activeUserProject.id, flow);

			// Reload project if is a subscription_reactivate
			if (flow === 'subscription_reactivate') {
				await ProjectService.getAll();
			}
			else {
				window.open(data.link, '_self');
			}

			await InfoHelper.hideLoading();
		}
		catch (error) {
			console.log(error);

			await InfoHelper.hideLoading();
			await InfoHelper.showErrorAlert();
		}
	}

	useEffect(() => {
		Mixpanel.track('BillsPage');
	}, []);

	return (
		<IonPage className="bills-page">
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
							Dashboard
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Subscription</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<IonContent>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="flex gap-4 flex-col md:flex-row">
						{activeUserProject && <div className='flex-1 flex flex-col gap-6 py-4'>
							{/* Trial text */}
							{activeUserProject.project.subscriptionStatus === 'trialing' && (activeUserProject.project.billingPlan !== 'dev') && <p className='text-2xl text-center'>
								<b>
									{
										moment(activeUserProject.project.subscriptionTrialEnd).isAfter(moment())
											? `Trial period ends on ${moment(activeUserProject.project.subscriptionTrialEnd).format('DD/MM/YY')}` 
											: `Trial period ended on ${moment(activeUserProject.project.subscriptionTrialEnd).format('DD/MM/YY')}`
									}
								</b>
		
								<br />
								<a className='text-sm text-muted-foreground underline underline-offset-4' href="https://buglesstack.com/pricing/" target="_blank" rel="noopener noreferrer" onClick={() => Mixpanel.track('BillsPage_click_pricing')}>
									What does the subscription include?
									<ExternalLink className='ml-1 inline size-4' />
								</a>
							</p>}

							{/* Subscription info */}
							<div className="flex w-full justify-center">
								<Card className='w-full md:w-7/12 lg:w-6/12 '>
									<CardHeader className='border-b'>
										<CardTitle className='flex items-center justify-between'>
											<span>
												<div className='text-lg font-semibold'>{activeUserProject.project.name}</div>
												<div className='text-sm font-normal text-muted-foreground'>
													{/* Subscription canceled */}
													{
														activeUserProject.project.isSubscriptionCanceled && 
														'Your subscription is canceled.'
													}

													{/* Subscription paused */}
													{
														activeUserProject.project.isSubscriptionPaused && 
														'Your subscription is paused due to non-payment.'
													}

													{/* Subscription paused */}
													{
														activeUserProject.project.isSubscriptionPastDue && 
														'Your subscription is past due.'
													}

													{/* Subscription cancelation scheduled */}
													{
														!activeUserProject.project.isSubscriptionCanceled && activeUserProject.project.subscriptionCancelAt && moment(activeUserProject.project.subscriptionCancelAt).isAfter(moment()) &&
														`Your subscription is active until ${moment(activeUserProject.project.subscriptionCancelAt).format('DD/MM/YY')}.`
													}

													{/* Auto renew notice text */}
													{
														!activeUserProject.project.isSubscriptionCanceled && activeUserProject.project.isSubscriptionActive && !activeUserProject.project.subscriptionCancelAt && activeUserProject.project.subscriptionStatus !== 'trialing' && 
														`Your subscription will auto-renew on ${moment(activeUserProject.project.subscriptionCurrentPeriodEnd).format('DD/MM/YY')}.`
													}
												</div>
											</span>
											{/* Actions availables if the subscription is active */}
											{	(
												activeUserProject.project.isSubscriptionActive ||
													activeUserProject.project.isSubscriptionPaused
											) && <DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='outline'>
															Manage
														<ChevronDown />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<DropdownMenuItem asChild>
														<Link to="/projects/edit">
															<Sparkles />
															Change plan
														</Link>
													</DropdownMenuItem>
													<DropdownMenuSeparator />

													{/* Reactivate subscription button if is paused payment_method_update */}
													{ 
														activeUserProject.project.isSubscriptionPaused &&

															<DropdownMenuItem 
																onClick={() => getSubscriptionManagementLink()}
															>
																Reactivate subscription
															</DropdownMenuItem>
													}

													<DropdownMenuItem 
														className='text-destructive focus:text-destructive focus:bg-destructive-foreground'
														onClick={() => getSubscriptionManagementLink('subscription_cancel')}
													>
														Cancel subscription
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>}

											{/* Reactivate subscription button (if was not deactivated yet) */}
											{ 
												!activeUserProject.project.isSubscriptionCanceled && activeUserProject.project.subscriptionCancelAt && moment(activeUserProject.project.subscriptionCancelAt).isAfter(moment()) && 
												<Button variant='outline' onClick={() => getSubscriptionManagementLink('subscription_reactivate')}>
													Reactivate subscription
												</Button>
											}

											{/* Reactivate subscription button */}
											{ 
												(
													// activeUserProject.project.isSubscriptionPaused || 
													activeUserProject.project.isSubscriptionPastDue
												) &&
												<Button variant='outline' onClick={() => getSubscriptionManagementLink()}>
													Reactivate subscription
												</Button>
											}
										</CardTitle>
									</CardHeader>
									<CardContent className='grid gap-2 pt-6'>
										<div className="flex items-center justify-between">
											<span className='text-lg font-semibold'>Plan</span>
											<span className='text-sm'>
												{activeUserProject.project.billingPlan === 'dev' && <>
													Dev
												</>}
												{activeUserProject.project.billingPlan === 'pro' && <>
													Pro - {activeUserProject.project.billingPeriod === 'monthly' ? '5 USD /month' : <>50 USD /year<Badge className='ml-2' variant={'secondary'}>2 months free</Badge></>}
												</>}
											</span>
										</div>

									</CardContent>
									<CardFooter className='justify-between border-t pt-6'>
										<span className='text-lg font-semibold'>Payment and Billing</span>
										<Button onClick={() => getSubscriptionManagementLink()}>
											Manage
										</Button>
									</CardFooter>
								</Card>
							</div>
						</div>}
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default Bills;
