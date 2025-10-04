"use client";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { ModeToggle } from "../ui/mode-toggle";
import { useAuthActions } from "@/hooks/use-auth";
import { SheetTrigger, SheetContent, SheetTitle, Sheet, SheetFooter } from "../ui/sheet";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const Navbar = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthActions();
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4">
        <nav className="h-16 bg-muted border shadow rounded-full">
          <div className="h-full flex items-center justify-between mx-auto px-4">
            <Logo />

            {/* Desktop Menu */}
            {isAuthenticated && <NavMenu className="hidden md:block" />}

            <div className="flex items-center gap-3">
              <ModeToggle />
              <div className="hidden md:flex items-center gap-3">
                <UserAvatar />
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="px-6 py-3">
                    <SheetTitle><Logo /></SheetTitle>
                    {isAuthenticated && <NavMenu orientation="vertical" className="mt-6 [&>div]:h-full" />}
                    <SheetFooter>
                      <UserAvatar />
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

function UserAvatar() {
  const { isAuthenticated, user, logout, isLoading } = useAuthActions();
  if (!isAuthenticated) {
    return (
      <>
        <Link href="/auth/login" className="rounded-full border px-4 py-2 text-sm font-medium">
          Sign In
        </Link>
        <Link href="/auth/register" className="rounded-full border bg-foreground text-background px-4 py-2 text-sm font-medium">Get Started</Link>
      </>
    )
  }
  return (
    <div className="flex items-center space-x-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer border-2 px-3 py-1 rounded-full ">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.fullName[0]}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">{user?.fullName.split(" ")[0].toLocaleUpperCase()}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent  >
          <DropdownMenuGroup>
            <Button className="w-full" variant={"destructive"} onClick={logout} disabled={isLoading}><LogOut /> Logout</Button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

  )
}
