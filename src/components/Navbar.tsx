'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, Menu, X, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
            <Link href="/deposer">
              <Button className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                Déposer une annonce
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-orange text-orange hover:bg-orange-bg rounded-lg font-semibold">
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            </Link>
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
                  <hr className="my-2 border-gray-100" />
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg">
                      <LogIn className="w-4 h-4 mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
