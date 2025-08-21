import { Moon, Sun, SunMoon } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

export function ModeToggle () {
	const { setTheme } = useTheme();

	return (
        
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton>
						<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
	                	<span>Switch theme</span>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setTheme('light')}>
						<Sun className="h-[1.2rem] w-[1.2rem]" />
                        Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('dark')}>
						<Moon className="h-[1.2rem] w-[1.2rem]" />
                        Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('system')}>
						<SunMoon className="h-[1.2rem] w-[1.2rem]" />
                        System
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}
