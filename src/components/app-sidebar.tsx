import * as React from 'react';
import {
	CreditCard,
	Bug
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { NavFooter } from '@/components/nav-footer';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar
} from '@/components/ui/sidebar';
import { ProjectSwitcher } from './project-switcher';

// This is sample data.
const pages = [
	{
		name: 'Crashes',
		url: '/crashes',
		icon: Bug
	},
	{
		name: 'Subscription',
		url: '/billing',
		icon: CreditCard
	}
];

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation();
	const { isMobile, toggleSidebar } = useSidebar();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<ProjectSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Dashboard</SidebarGroupLabel>
					<SidebarMenu>
						{pages.map((item) => (
							<SidebarMenuItem key={item.name} onClick={() => isMobile && toggleSidebar()}>
								<SidebarMenuButton asChild isActive={location.pathname.includes(item.url)}>
									<Link to={item.url} replace>
										<item.icon />
										<span>{item.name}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavFooter />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
