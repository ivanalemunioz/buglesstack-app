import Axios from 'axios';
import moment from 'moment';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { IonContent, IonPage, IonRow, IonCol, IonSpinner } from '@ionic/react';
import { Copy, Download, Expand, Fullscreen, GlobeLock, Shrink } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Mixpanel from '@/libraries/Mixpanel';
import InfoHelper from '@/libraries/InfoHelper';

import { Crash } from '@/models/Crash';

import CrashService from '@/services/CrashService';

import ReactPrismjs from '@uiw/react-prismjs';

import './prism-theme.scss';
import 'prismjs/components/prism-markup-templating';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CrashDetailsPage = () => {
	const [crash, setCrash] = useState<Crash>();
	const [crashHtml, setCrashHtml] = useState<string>();
	const [expandedPreview, setExpandedPreview] = useState(false);
	const [currentTab, setCurrentTab] = useState<string>('screenshot');
	const location = useLocation();
	const [jsEnabled, setJsEnabled] = useState(false);
	const [iframeKey, setIframeKey] = useState(0);

	const crashId = location.pathname.split('/')[2] || null;
	
	// Function to get the crash details
	const getCrash = useCallback(async () => {
		if (!crashId) {
			return;
		}

		try {
			// Get the crash details
			const newCrash = await CrashService.getById(crashId);

			setCrash(newCrash);
			getCrashHtml(newCrash);
		}
		catch (error) {
			console.log(error);

			await InfoHelper.showErrorAlert();
		}
	}, [crashId]);

	// Function to get the crash html
	const getCrashHtml = async (crash: Crash) => {
		try {
			// Download the crash html
			const { data } = await Axios.get(crash.html);

			setCrashHtml(data);
		}
		catch (error) {
			console.log(error);

			// await InfoHelper.showErrorAlert();
		}
	};

	function download (url: string) {
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = '';

		anchor.click();
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			// setCopied(true);

		  	// setTimeout(() => setCopied(true), 2000);
		});
	};

	useEffect(() => {		
		setCrash(undefined);
		setCrashHtml(undefined);
		setCurrentTab('screenshot');
		
		// Redirect to crashes page
		if (!crashId && location.pathname.match(/\/crashes\/.+/)) {
			window.location.href = '/crashes';
		}
		else {
			getCrash();
		}
		
		Mixpanel.track('CrashDetailsPage');
	}, [getCrash, crashId, location.pathname]);

	useEffect(() => {
		const originalTitle = document.title;

		if (crash) {
			document.title = `${crash.message} - Buglesstack`;
		}

		return () => {
			document.title = originalTitle;
		};
	}, [crash]);

	return (
		<IonPage className="crash-details-page">
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
								<BreadcrumbLink asChild>
									<Link to='/crashes'>
										Crashes
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Details</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<IonContent>
				{/* Crash details */}
				{crash && <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="flex flex-col gap-x-4 space-y-2">
						<h2 className="text-2xl font-bold tracking-tight">{crash.message}</h2>
						<p className="text-sm text-muted-foreground">
							{moment(crash.createdAt).format('DD MMM, YYYY HH:mm:ss Z')}
						</p>
						<div className='flex mt-8 gap-4 items-start'>
							<p className="w-full text-muted-foreground whitespace-pre overflow-x-auto">{crash.stack}</p>
						</div>
					</div>

					<div className="flex gap-4 flex-row">
						<Card className='w-full'>
							<CardHeader className='pb-2 space-y-2'>
								<div className="flex items-center space-x-2">
									<div className='flex grow relative'>
										<GlobeLock className='size-3 absolute left-3 top-3' />
										<Input readOnly value={crash.url} className="font-mono text-sm pl-8" />
									</div>
									<Button size="icon" variant="outline" onClick={() => {
										Mixpanel.track('CrashDetailsPage.url_copy');

										// Copy the crash url to clipboard
										copyToClipboard(crash.url);
									}}>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<Tabs value={currentTab} onValueChange={(value) => {
									Mixpanel.track('CrashDetailsPage.tab_change', {
										tab: value
									});

									setCurrentTab(value);
								}} className='flex flex-wrap gap-2'>
									<TabsList>
										<TabsTrigger value="screenshot">Screenshot</TabsTrigger>
										<TabsTrigger value="html">HTML</TabsTrigger>
										<TabsTrigger value="preview">Preview</TabsTrigger>
										<TabsTrigger value="metadata">Metadata</TabsTrigger>
									</TabsList>

									{/* Screenshot actions */}
									{currentTab === 'screenshot' && <>
										<Button variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.screenshot_copy');

											download(crash.screenshot);
										}}>
											<Download />
											Download screenshot
										</Button>
									</>}
									
									<TabsContent value="screenshot" className='w-full flex text-center justify-start'>
										<img src={crash.screenshot} alt='📸' className='max-w-full w-auto' />
									</TabsContent>

									{/* HTML actions */}
									{crashHtml && currentTab === 'html' && <>
										<Button variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.html_copy');

											copyToClipboard(crashHtml);
										}}>
											<Copy />
											Copy HTML to clipboard
										</Button>
										<Button variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.html_download');

											download(crash.html);
										}}>
											<Download />
											Download HTML
										</Button>
									</>}
									<TabsContent value="html" className='w-full mt-0'>
										{/* Crash HTML */}
										{crashHtml && <ReactPrismjs 
											language="html" 
											className='-mx-2 p-0'
											source={crashHtml}
										/>}

										{/* Loading crash html */}
										{!crashHtml && <IonRow className="text-center p-4">
											<IonCol className='p-0'><IonSpinner className='align-middle' /></IonCol>
										</IonRow>}
									</TabsContent>

									{/* Preview actions */}
									{currentTab === 'preview' && <>
										<Button className='hidden md:flex' variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.preview_fullscreen');

											// Request fullscreen on the iframe
											document.getElementById('preview-iframe')?.requestFullscreen();
										}}>
											<Fullscreen />
											Fullscreen
										</Button>
										<Button variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.preview_expand');
											
											// Expand the preview
											setExpandedPreview(true);
										}}>
											<Expand />
											Expand
										</Button>
										<div className="flex items-center space-x-2">
											<Switch id="enable-javascript" checked={jsEnabled} onCheckedChange={() => {
												setJsEnabled(!jsEnabled);
												Mixpanel.track('CrashDetailsPage.preview_js_toggle', {
													enabled: !jsEnabled
												});
												setIframeKey(iframeKey + 1); // Force re-render of the iframe
											}} />
											<Label htmlFor="enable-javascript">Enable JavaScript</Label>
										</div>
									</>}
									<TabsContent value="preview" className='w-full'>
										{crashHtml && <div className={`z-50 w-full ${(expandedPreview ? 'fixed top-0 left-0 h-[100dvh] bg-background' : 'h-[70dvh]')}`}>
											{expandedPreview && <Button variant='outline' className='absolute top-2 right-2' onClick={() => {
												Mixpanel.track('CrashDetailsPage.preview_shrink');
												
												// Shrink the preview
												setExpandedPreview(false);
											}}>
												<Shrink />
												Shrink
											</Button>}
											<iframe 
												id='preview-iframe' 
												key={iframeKey}
												srcDoc={`<base href="${crash.url}">` + crashHtml}
												title='Crash preview' 
												className='w-full h-full'
												{...(jsEnabled ? {} : { sandbox: '' })}
											/>
										</div>
										}
									</TabsContent>

									{/* Metadata actions */}
									{currentTab === 'metadata' && <>
										<Button variant='outline' onClick={() => {
											Mixpanel.track('CrashDetailsPage.metadata_copy');

											copyToClipboard(JSON.stringify(crash.metadata, undefined, 4));
										}}>
											<Copy />
											Copy metadata to clipboard
										</Button>
									</>}
									<TabsContent value="metadata" className='w-full'>
										<pre className='text-xs w-full whitespace-pre overflow-x-auto'>
											{
												JSON.stringify(crash.metadata, undefined, 4)
											}
										</pre>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</div>
				</div>}

				{/* Loading crash */}
				{!crash && <IonRow className="flex h-full items-center p-4 text-center">
					<IonCol className='p-0'><IonSpinner /></IonCol>
				</IonRow>}
			</IonContent>
		</IonPage>
	);
};

export default CrashDetailsPage;
