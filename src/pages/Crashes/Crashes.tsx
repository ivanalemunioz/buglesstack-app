import { IonContent, IonPage, IonRow, IonCol, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import React, { useState, useEffect, useCallback } from 'react';
import { Bug, Check, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import Mixpanel from '@/libraries/Mixpanel';
import InfoHelper from '@/libraries/InfoHelper';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/libraries/Authentication';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';

import './Crashes.scss';

import CrashService from '@/services/CrashService';

import { Crash } from '@/models/Crash';
import moment from 'moment';
import { useActiveUserProject } from '@/services/ProjectService';

const Crashes: React.FC = () => {
	const user = useUser();
	const activeUserProject = useActiveUserProject();

	const [crashes, setCrashes] = useState<Crash[] | undefined>();
	const [loadingCrashes, setLoadingCrashes] = useState(false);
	const [, setNoMoreCrashes] = useState(false);
	const [copied, setCopied] = React.useState(false);

	const getCrashes = useCallback(async (reset?: boolean) => {
		if (!activeUserProject) {
			return;
		}

		const noMoreCrashes = await (new Promise<boolean>(resolve => setNoMoreCrashes(t => {
			resolve(t); return t;
		})));

		const crashes = await (new Promise<Crash[] | undefined>(resolve => setCrashes(t => {
			resolve(t); return t; 
		})));

		if (reset) {
			setCrashes(undefined);
			setNoMoreCrashes(false);
		}
		else if (noMoreCrashes) {
			return;
		}

		setLoadingCrashes(true);
		
		try {
			const start = (!reset && crashes && crashes.length > 0 && crashes[crashes.length - 1].id) || undefined;
			
			const newCrashes = await CrashService.get(activeUserProject.project.id, start);

			if (newCrashes.length === 0) {
				setNoMoreCrashes(true);
			}

			if (crashes && !reset) {
				setCrashes([...crashes, ...newCrashes]);
			}
			else {
				setCrashes(newCrashes);
			}

			setLoadingCrashes(false);

			return newCrashes.length !== 0;
		}
		catch (error) {
			console.log(error);

			await InfoHelper.showErrorAlert();
		}

		setLoadingCrashes(false);
	}, [activeUserProject]);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);

			Mixpanel.track('CrashesPage.copy_access_token');

		  	setTimeout(() => setCopied(false), 2000);
		});
	};

	useEffect(() => {
		Mixpanel.track('CrashesPage');
	}, []);

	useEffect(() => {
		getCrashes(true);
	}, [getCrashes, activeUserProject?.id]);

	if (!user || !activeUserProject) {
		return <></>;
	}

	return (
		<IonPage className="crashes-page">
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
								<BreadcrumbPage>Crashes</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<IonContent>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="flex flex-wrap items-center justify-between gap-x-4 space-y-2">
						<div>
							<h2 className="text-2xl font-bold tracking-tight">Crashes</h2>
							<p className="text-muted-foreground">Here's the list of your crashes</p>
						</div>
					</div>

					<div className="flex gap-4 flex-col">
						{/* Two columns grid */}
						<div className="flex gap-4">
							{/* Access token */}
							<Card className="h-fit w-2/3">
								<CardHeader>
									<CardTitle>Your Access Token</CardTitle>
									<CardDescription>
										Use this access_token to log your crashes.
										&nbsp;
										<a className='text-sm underline underline-offset-4' href="https://buglesstack.com/docs/introduction" target="_blank" rel="noopener noreferrer" onClick={() => Mixpanel.track('CrashesPage_click_docs')}>
											Documentation
											<ExternalLink className='ml-1 inline size-4' />
										</a>
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<Input readOnly value={activeUserProject.project.accessToken} className="font-mono text-sm" />
											<Button size="icon" variant="outline" onClick={() => copyToClipboard(activeUserProject.project.accessToken)}>
												{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="h-full w-1/3">
								<div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
									<h3 className="font-bold tracking-tight text-sm">Crashes logged in the current period</h3>
									<Bug className="h-4 w-4 text-muted-foreground" />
								</div>
								<CardContent>
									<div className="text-2xl font-bold">
										{activeUserProject.project.currentPeriodCrashesUsage} of {activeUserProject.project.crashesLimit.toLocaleString()}
									</div>
									{
										(activeUserProject.project.isSubscriptionActive || activeUserProject.project.isSubscriptionPaused) &&
										<Link className="text-xs text-muted-foreground underline" to="/projects/edit">
											Increase limit
										</Link>
									}
								</CardContent>
							</Card>
						</div>

						{/* Crashes list */}
						<Card className='w-full h-fit'>
							<CardContent className='p-0'>
								{crashes && <Table className='overflow-hidden'>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Message</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody className='[&_tr:last-child_td]:border-0'>
										{crashes.map((crash) => (
											<TableRow 
												key={crash.id} 
												className='cursor-pointer' 
											>
												<TableCell>
													<Link to={`/crashes/${crash.id}`} className="-mx-5 -my-3 px-5 py-3 flex">
														{moment(crash.createdAt).format('DD MMM, YYYY HH:mm:ss Z')}
													</Link>
												</TableCell>
												<TableCell className="font-medium">
													<Link to={`/crashes/${crash.id}`} className="-mx-5 -my-3 px-5 py-3 flex">
														{crash.message}
													</Link>
												</TableCell>
											</TableRow>
										))}

										{/* Empty text */}
										{crashes.length === 0 && !loadingCrashes && <TableRow>
											<TableCell colSpan={2} className="text-center">
												Here will appear your crashes once you start logging them.
											</TableCell>
										</TableRow>}
									</TableBody>
								</Table>}

								{/* Loading */}
								{!crashes && <IonRow className="text-center py-3">
									<IonCol className='p-0'><IonSpinner className='align-middle' /></IonCol>
								</IonRow>}
							</CardContent>
						</Card>
					</div>
				</div>

				<IonInfiniteScroll
					onIonInfinite={async (ev) => {
						!loadingCrashes && await getCrashes();

						ev.target.complete();
					}}
				>
					<IonInfiniteScrollContent></IonInfiniteScrollContent>
				</IonInfiniteScroll>
			</IonContent>
		</IonPage>
	);
};

export default Crashes;
