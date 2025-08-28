import { ChevronsUpDown, Plus } from 'lucide-react';

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
import ProjectService, { useActiveUserProject, useUserProjects } from '@/services/ProjectService';
import { Link } from 'react-router-dom';

export function ProjectSwitcher () {
	const { isMobile } = useSidebar();
	const projects = useUserProjects();
	const activeUserProject = useActiveUserProject();

	if (!activeUserProject) {
		return <div className="flex items-center gap-2 text-left text-sm p-2 group-data-[collapsible=icon]:!p-0 transition-[width,height,padding]">
			<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
				<img className='size-6' src="/assets/icon/icon-white-x256.png" alt="SDK"/>
			</div>

			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">Buglesstack</span>
				<span className="truncate text-xs">Legacy plan</span>
			</div>
		</div>;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<img className='size-6' src="/assets/icon/icon-white-x256.png" alt="Buglesstack"/>
							</div>

							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeUserProject.project.name}
								</span>
								<span className="truncate text-xs">{activeUserProject.project.billingPlanFormatted}</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
                            Projects
						</DropdownMenuLabel>
						{projects.map((project) => (
							<DropdownMenuItem
								key={project.project.id}
								onClick={() => ProjectService.selectProject(project)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
    								<img className='hidden dark:block size-4 shrink-0' src="/assets/icon/icon-white-x256.png" alt="Buglesstack"/>
    								<img className='dark:hidden size-4 shrink-0' src="/assets/icon/icon-black-x256.png" alt="Buglesstack"/>
								</div>

								{project.project.name}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2" asChild>
							<Link to='/projects/new'>
								<div className="flex size-6 items-center justify-center rounded-md border bg-background">
									<Plus className="size-4" />
								</div>
								<div className="font-medium text-muted-foreground">New project</div>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
