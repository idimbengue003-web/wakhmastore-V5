'use client';

import Link from 'next/link';
import { MessageCircle, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnnonceCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  emoji: string;
  location: string;
  isVip: boolean;
  vipType?: string | null;
  createdAt: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString('fr-FR');
}

export default function AnnonceCard({
  id,
  title,
  price,
  category,
  emoji,
  location,
  isVip,
  vipType,
  createdAt,
}: AnnonceCardProps) {
  return (
    <Card className="annonce-card group overflow-hidden border border-gray-100 rounded-xl cursor-pointer">
      <CardContent className="p-0">
        {/* Emoji area */}
        <div className="relative">
          <div className="bg-orange-bg h-28 flex items-center justify-center transition-all duration-500 ease-out group-hover:bg-orange/10">
            <span className="text-4xl transition-transform duration-300 ease-out group-hover:scale-110">{emoji}</span>
          </div>
          {/* Category badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-white/90 text-gray-700 text-xs font-medium backdrop-blur-sm"
          >
            {category}
          </Badge>
          {/* VIP badge */}
          {isVip && (
            <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold border-0">
              ⭐ {vipType === 'vip_king' ? 'VIP KING' : 'DIAMBAR'}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-lg font-bold text-orange">{formatPrice(price)}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(createdAt)}
            </span>
          </div>
          <Link href={`/annonces/${id}`}>
            <Button
              variant="ghost"
              className="btn-press w-full mt-2 text-orange hover:text-orange-dark hover:bg-orange-bg font-semibold text-sm rounded-lg transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Voir l&apos;annonce
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
