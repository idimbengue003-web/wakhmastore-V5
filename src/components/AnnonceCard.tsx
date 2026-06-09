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
    <Card className="annonce-card overflow-hidden border border-gray-100 rounded-lg">
      <CardContent className="p-0">
        {/* Emoji area */}
        <div className="relative">
          <div className="bg-gradient-to-br from-orange-bg to-blue-50 h-20 flex items-center justify-center transition-all duration-300">
            <span className="text-3xl transition-transform duration-300 hover:scale-110">{emoji}</span>
          </div>
          {/* Category badge */}
          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 bg-white/90 text-gray-700 text-[10px] font-medium backdrop-blur-sm px-1.5 py-0"
          >
            {category}
          </Badge>
          {/* VIP badge */}
          {isVip && (
            <Badge className="absolute top-1.5 right-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold border-0 px-1.5 py-0">
              ⭐ {vipType === 'vip_king' ? 'VIP KING' : 'DIAMBAR'}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-sm font-bold text-orange transition-colors duration-200">{formatPrice(price)}</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {location}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo(createdAt)}
            </span>
          </div>
          <Link href={`/annonces/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-orange hover:text-orange-dark hover:bg-orange-bg font-semibold text-[10px] rounded-md transition-all duration-200 h-7"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Voir l&apos;annonce
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
