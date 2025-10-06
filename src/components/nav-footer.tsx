'use client';

import {
	BookText,
	ChevronsUpDown,
	LifeBuoy,
	LogOut
} from 'lucide-react';

import {
	Avatar,
	AvatarFallback,
	AvatarImage
} from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from '@/components/ui/sidebar';

import InfoHelper from '@/libraries/InfoHelper';
import Authentication, { useUser } from '@/libraries/Authentication';
import Mixpanel from '@/libraries/Mixpanel';
import { useHistory } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';

export function NavFooter () {
	const { isMobile, toggleSidebar } = useSidebar();
	const user = useUser();
	const history = useHistory();

	function logout () {
		InfoHelper.showAlert({
			header: 'Log out',
			subHeader: 'Are you sure you want to log out?',
			buttons: ['Cancel', {
				text: 'Log out',
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

	if (!user) return <></>;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton>
							<LifeBuoy />
							<span>Help</span>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className={`w-[--radix-dropdown-menu-trigger-width] ${!isMobile ? 'min-w-72' : ''} rounded-lg`}
						side={isMobile ? 'bottom' : 'right'}
						align="end"
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src='/assets/images/ivan.jpg' alt='Ivan' />
									<AvatarFallback className="rounded-lg">IV</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">Hi, I'm Ivan 👋🏼</span>
									<span className="text-xs">For any questions or inquiries, you can write to me at <u>ivan@buglesstack.com</u></span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<a
								href="https://buglesstack.com/docs/introduction/" 
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => Mixpanel.track('SideBar_click_docs')}
							>
								<BookText />
								<span>Documentation</span>
							</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg">{user.avatarFallback}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.username}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback className="rounded-lg">{user.avatarFallback}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.username}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<ModeToggle/>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => {
							isMobile && toggleSidebar();
							logout();
						}} >
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
