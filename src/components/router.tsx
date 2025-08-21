import { Redirect, Route, useLocation } from 'react-router-dom';
import React, { lazy } from 'react';
import { IonRouterOutlet } from '@ionic/react';

import { useIsAuthenticated, useUser } from '@/libraries/Authentication';

import { useUserProjects } from '@/services/ProjectService';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

const Bills = lazy(() => import('@/pages/Bills/Bills'));
const Login = lazy(() => import('@/pages/Login/Login'));
const ProjectsCreatePage = lazy(() => import('@/pages/Projects/ProjectsCreate'));
const Crashes = lazy(() => import('@/pages/Crashes/Crashes'));
const CrashDetails = lazy(() => import('@/pages/Crashes/CrashDetails'));

const Router: React.FC = () => {
	const isAuthenticated = useIsAuthenticated();
	const user = useUser();
	const userProjects = useUserProjects();
	const location = useLocation();

	const enableProjects = isAuthenticated && user/* && !user.billingPlan */;
	const enableSidebar = isAuthenticated && user && (!enableProjects || userProjects.length > 0) && location.pathname !== '/projects/new' && location.pathname !== '/projects/edit';
	
	return (
		<SidebarProvider>
			{enableSidebar && <AppSidebar />}

			<SidebarInset>
				<IonRouterOutlet animated={false}>
					{ 
						// Render when is authenticated
						isAuthenticated && user ? [
							// Render when has projects
							...(enableProjects ? [
								<Route path="/projects/new" key="/projects/new" component={ProjectsCreatePage} exact />,
								<Route path="/projects/edit" key="/projects/edit" component={ProjectsCreatePage} exact />
							] : []),

							// Render when has projects
							...(!enableProjects || userProjects.length > 0 ? [
								<Route path="/billing" key="/billing" component={Bills} exact />,
								<Route key="/crashes" path="/crashes" component={Crashes} exact />,
								<Route key="/crashes/:id" path="/crashes/:id" component={CrashDetails} exact />
							] : [])
						] : (

						// Render when isn't authenticated
							<Route path="/login" component={Login} exact />
						)
					}

					{/* Handle redirection */}
					<Redirect to={
						isAuthenticated && user 
							? (!enableProjects || userProjects.length > 0 ? '/crashes' : '/projects/new') 
							: '/login'
					} />
				</IonRouterOutlet>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default Router;
