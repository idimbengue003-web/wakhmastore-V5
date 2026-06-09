'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Menu, X, LogIn, LogOut, User, Gift, Award, Coins, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, token, logout, loadFromStorage } = useAuth();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  function handleLogout() {
    logout();
  }

  function getPlanLabel(plan: string): string {
    switch (plan) {
      case 'diambar': return 'Diambar';
      case 'vip_king': return 'VIP KING';
      default: return '';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-orange rounded-lg flex items-center justify-center group-hover:bg-orange-dark transition-colors">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-orange heading-compact">Wakhma Store</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              href="/annonces"
              className="text-xs font-medium text-gray-600 hover:text-orange transition-colors px-2.5 py-1.5 rounded-md hover:bg-orange-bg"
            >
              Catégories
            </Link>

            {user && (
              <Link
                href="/parrainage"
                className="text-xs font-medium text-gray-600 hover:text-orange transition-colors px-2.5 py-1.5 rounded-md hover:bg-orange-bg flex items-center gap-1"
              >
                <Gift className="w-3.5 h-3.5" />
                Parrainage
              </Link>
            )}

            <Link href="/deposer">
              <Button size="sm" className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-md text-xs">
                Déposer une annonce
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-orange/30 text-orange hover:bg-orange-bg rounded-md font-semibold text-xs">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    {user.name || user.email.split('@')[0]}
                    {user.plan !== 'gratuit' && (
                      <span className="ml-1 text-[10px] bg-orange/10 px-1.5 py-0.5 rounded">
                        {getPlanLabel(user.plan)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-lg">
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Award className="w-3 h-3 text-orange" />
                      <span className="text-[10px] font-semibold text-orange">{user.points.toLocaleString('fr-FR')} points</span>
                    </div>
                    {user.plan !== 'gratuit' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="w-3 h-3 text-orange" />
                        <span className="text-[10px] font-medium text-orange">Abonnement {getPlanLabel(user.plan)}</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/acheter-points" className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-orange" />
                      Acheter des points
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/abonnements" className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-orange" />
                      Abonnements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/parrainage" className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-orange" />
                      Parrainage
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 text-xs">
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-orange text-orange hover:bg-orange-bg rounded-md font-semibold text-xs">
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Se connecter
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange rounded-lg flex items-center justify-center">
                      <Store className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-orange heading-compact">Wakhma Store</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="w-5 h-5" />
                    </Button>
                  </SheetClose>
                </div>

                {user && (
                  <div className="px-4 py-2.5 bg-orange-bg border-b border-orange/10">
                    <p className="font-semibold text-gray-900 text-xs">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Award className="w-3 h-3 text-orange" />
                      <span className="text-[10px] font-semibold text-orange">{user.points.toLocaleString('fr-FR')} points</span>
                    </div>
                    {user.plan !== 'gratuit' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="w-2.5 h-2.5 text-orange" />
                        <span className="text-[10px] font-medium text-orange">{getPlanLabel(user.plan)}</span>
                      </div>
                    )}
                  </div>
                )}

                <nav className="flex flex-col px-4 py-3 gap-1">
                  <Link
                    href="/annonces"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-orange px-3 py-2 rounded-md hover:bg-orange-bg transition-colors"
                  >
                    Catégories
                  </Link>
                  <Link
                    href="/deposer"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-orange px-3 py-2 rounded-md hover:bg-orange-bg transition-colors"
                  >
                    Déposer une annonce
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/acheter-points"
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-gray-700 hover:text-orange px-3 py-2 rounded-md hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Coins className="w-4 h-4 text-orange" />
                        Acheter des points
                      </Link>
                      <Link
                        href="/abonnements"
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-gray-700 hover:text-orange px-3 py-2 rounded-md hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4 text-orange" />
                        Abonnements
                      </Link>
                      <Link
                        href="/parrainage"
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-orange hover:text-orange-dark px-3 py-2 rounded-md hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Parrainage
                      </Link>
                    </>
                  )}

                  <hr className="my-1.5 border-gray-100" />

                  {user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-md text-xs"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      Se déconnecter
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-md text-xs">
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Se connecter
                      </Button>
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
