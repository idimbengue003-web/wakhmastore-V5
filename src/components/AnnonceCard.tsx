'use client';

import Link from 'next/link';
import { MessageCircle, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, timeAgo } from '@/lib/constants';

interface AnnonceCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  emoji: string;
  location: string;
  type?: string;
  isVip: boolean;
  vipType?: string | null;
  createdAt: string;
  description?: string | null;
  coverImageUrl?: string | null;
  imageCount?: number;
}

export default function AnnonceCard({
  id,
  title,
  price,
  category,
  emoji,
  location,
  type,
  isVip,
  vipType,
  createdAt,
  description,
  coverImageUrl,
  imageCount = 0,
}: AnnonceCardProps) {
  const isJeVends = type === 'je_vends';
  const hasPhoto = !!coverImageUrl;

  return (
    <Link href={`/annonces/${id}`} className="block">
      <Card className="annonce-card-v2 group overflow-hidden border border-gray-100 rounded-2xl cursor-pointer h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Photo / Emoji area - BIG */}
          <div className="relative">
            <div className={`relative h-44 sm:h-52 flex items-center justify-center transition-all duration-500 ease-out group-hover:bg-orange/5 ${
              isJeVends ? 'bg-green-50' : 'bg-orange-bg'
            }`}>
              {hasPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <span className="text-5xl sm:text-6xl transition-transform duration-300 ease-out group-hover:scale-110 drop-shadow-sm">{emoji}</span>
              )}
            </div>
            {/* Badge nombre de photos */}
            {hasPhoto && imageCount > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs font-medium backdrop-blur-sm rounded-full px-2 py-1">
                <span>📊</span>
                <span>{imageCount}</span>
              </div>
            )}
            {/* Category badge */}
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white/90 text-gray-700 text-xs font-medium backdrop-blur-sm shadow-sm"
            >
              {category}
            </Badge>
            {/* Type badge */}
            <Badge className={`absolute bottom-3 left-3 text-xs font-bold border-0 shadow-sm ${
              isJeVends
                ? 'bg-green-500 text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {isJeVends ? '💰 Je vends' : '🔍 Je cherche'}
            </Badge>
            {/* VIP badge */}
            {isVip && (
              <Badge className={`absolute bottom-3 right-3 text-xs font-bold border-0 text-white shadow-sm ${
                vipType === 'vip_king' ? 'bg-amber-500' : 'bg-green-500'
              }`}>
                {vipType === 'vip_king' ? '👑 VIP KING' : '💪🏽 DIAMBAR'}
              </Badge>
            )}

          </div>

          {/* Content - Description & Info visible before opening */}
          <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
              {title}
            </h3>

            {/* Description preview - visible before opening */}
            {description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}

            <p className="text-xl font-extrabold text-orange mt-auto">
              {formatPrice(price)}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange/70" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange/70" />
                {timeAgo(createdAt)}
              </span>
            </div>

            {/* CTA Button - more prominent */}
            <div className="pt-1">
              <span className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-orange/10 text-orange font-semibold text-sm group-hover:bg-orange group-hover:text-white transition-all duration-400 ease-out">
                <MessageCircle className="w-4 h-4" />
                Voir l&apos;annonce
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
