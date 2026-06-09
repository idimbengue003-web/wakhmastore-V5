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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center group-hover:bg-orange-dark transition-colors">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-orange">Wakhma Store</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/annonces"
              className="text-sm font-medium text-gray-600 hover:text-orange transition-colors px-3 py-2 rounded-lg hover:bg-orange-bg"
            >
              Catégories
            </Link>

            {user && (
              <Link
                href="/parrainage"
                className="text-sm font-medium text-gray-600 hover:text-orange transition-colors px-3 py-2 rounded-lg hover:bg-orange-bg flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                Parrainage
              </Link>
            )}

            <Link href="/deposer">
              <Button className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                Déposer une annonce
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-orange/30 text-orange hover:bg-orange-bg rounded-lg font-semibold">
                    <User className="w-4 h-4 mr-2" />
                    {user.name || user.email.split('@')[0]}
                    {user.plan !== 'gratuit' && (
                      <span className="ml-1.5 text-xs bg-orange/10 px-1.5 py-0.5 rounded">
                        {getPlanLabel(user.plan)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Award className="w-3.5 h-3.5 text-orange" />
                      <span className="text-xs font-semibold text-orange">{user.points.toLocaleString('fr-FR')} points</span>
                    </div>
                    {user.plan !== 'gratuit' && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-3.5 h-3.5 text-orange" />
                        <span className="text-xs font-medium text-orange">Abonnement {getPlanLabel(user.plan)}</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/acheter-points" className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-orange" />
                      Acheter des points
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/abonnements" className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-orange" />
                      Abonnements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/parrainage" className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-orange" />
                      Parrainage
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-orange text-orange hover:bg-orange-bg rounded-lg font-semibold">
                  <LogIn className="w-4 h-4 mr-2" />
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
            <SheetContent side="right" className="w-80 bg-white p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange rounded-xl flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-orange">Wakhma Store</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="w-5 h-5" />
                    </Button>
                  </SheetClose>
                </div>

                {user && (
                  <div className="px-4 py-3 bg-orange-bg border-b border-orange/10">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Award className="w-3.5 h-3.5 text-orange" />
                      <span className="text-xs font-semibold text-orange">{user.points.toLocaleString('fr-FR')} points</span>
                    </div>
                    {user.plan !== 'gratuit' && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Crown className="w-3 h-3 text-orange" />
                        <span className="text-xs font-medium text-orange">{getPlanLabel(user.plan)}</span>
                      </div>
                    )}
                  </div>
                )}

                <nav className="flex flex-col p-4 gap-2">
                  <Link
                    href="/annonces"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-orange px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors"
                  >
                    Catégories
                  </Link>
                  <Link
                    href="/deposer"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-orange px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors"
                  >
                    Déposer une annonce
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/acheter-points"
                        onClick={() => setOpen(false)}
                        className="text-base font-medium text-gray-700 hover:text-orange px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Coins className="w-5 h-5 text-orange" />
                        Acheter des points
                      </Link>
                      <Link
                        href="/abonnements"
                        onClick={() => setOpen(false)}
                        className="text-base font-medium text-gray-700 hover:text-orange px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Crown className="w-5 h-5 text-orange" />
                        Abonnements
                      </Link>
                      <Link
                        href="/parrainage"
                        onClick={() => setOpen(false)}
                        className="text-base font-medium text-orange hover:text-orange-dark px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors flex items-center gap-2"
                      >
                        <Gift className="w-5 h-5" />
                        Parrainage
                      </Link>
                    </>
                  )}

                  <hr className="my-2 border-gray-100" />

                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                        <LogIn className="w-4 h-4 mr-2" />
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
