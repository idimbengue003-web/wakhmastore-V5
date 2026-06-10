'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Menu, X, LogIn, LogOut, User, Gift, Award, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    logout();
    setShowLogoutConfirm(false);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
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
              <Button className="btn-press bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg transition-all duration-300">
                Déposer une annonce
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-orange/30 text-orange hover:bg-orange-bg rounded-lg font-semibold">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || ''}
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    {user.name || user.email.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ''}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-orange" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 ml-10">
                      <Award className="w-3.5 h-3.5 text-orange" />
                      <span className="text-xs font-semibold text-orange">{user.points} points</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profil" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-orange" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/parrainage" className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-orange" />
                      Parrainage
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/recharge" className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange" />
                      Recharger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="btn-press border-orange text-orange hover:bg-orange-bg rounded-lg font-semibold transition-all duration-300">
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
              </Link>
            )}

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous vraiment vous déconnecter de votre compte Wakhma Store ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                      <span className="text-xs font-semibold text-orange">{user.points} points</span>
                    </div>
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
                  <Link
                    href="/recharge"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-orange px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors"
                  >
                    Recharger
                  </Link>

                  {user && (
                    <Link
                      href="/profil"
                      onClick={() => setOpen(false)}
                      className="text-base font-medium text-orange hover:text-orange-dark px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors flex items-center gap-2"
                    >
                      <UserCircle className="w-5 h-5" />
                      Mon Profil
                    </Link>
                  )}

                  {user && (
                    <Link
                      href="/parrainage"
                      onClick={() => setOpen(false)}
                      className="text-base font-medium text-orange hover:text-orange-dark px-4 py-3 rounded-lg hover:bg-orange-bg transition-colors flex items-center gap-2"
                    >
                      <Gift className="w-5 h-5" />
                      Parrainage
                    </Link>
                  )}

                  <hr className="my-2 border-gray-100" />

                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg"
                      onClick={() => {
                        setOpen(false);
                        setShowLogoutConfirm(true);
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
