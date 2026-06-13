'use client';

import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl?: string;
  backgroundColor: string;
  borderColor: string;
}

interface BannerStripProps {
  onBannerClose?: (bannerId: string) => void;
  onBannerClick?: (bannerId: string) => void;
}

const defaultBanners: Banner[] = [
  {
    id: 'amis',
    title: 'AMIS System',
    description: 'Hệ thống quản lý kế toán hiện đại',
    ctaText: 'Tìm hiểu thêm',
    ctaUrl: '#',
    backgroundColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'banking',
    title: 'Banking Integration',
    description: 'Kết nối ngân hàng trực tiếp với hệ thống',
    ctaText: 'Khám phá',
    ctaUrl: '#',
    backgroundColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
];

export function BannerStrip({ onBannerClose, onBannerClick }: BannerStripProps) {
  const [visibleBanners, setVisibleBanners] = useState<string[]>(
    defaultBanners.map((b) => b.id),
  );

  const handleClose = (bannerId: string) => {
    setVisibleBanners(visibleBanners.filter((id) => id !== bannerId));
    onBannerClose?.(bannerId);
  };

  const handleClick = (banner: Banner) => {
    if (banner.ctaUrl) {
      window.location.href = banner.ctaUrl;
    }
    onBannerClick?.(banner.id);
  };

  const visibleBannerItems = defaultBanners.filter((b) =>
    visibleBanners.includes(b.id),
  );

  if (visibleBannerItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 py-4">
      {visibleBannerItems.map((banner) => (
        <div
          key={banner.id}
          className={`flex items-center justify-between rounded-lg border ${banner.borderColor} ${banner.backgroundColor} px-4 py-3`}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{banner.title}</h4>
            <p className="text-sm text-gray-600">{banner.description}</p>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={() => handleClick(banner)}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {banner.ctaText}
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => handleClose(banner.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
