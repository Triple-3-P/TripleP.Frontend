'use client';
import type { ComponentProps } from 'react';
import type { IWithClassName } from '@/shared/utils/props';
import { UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface IUserAvatarProps
  extends ComponentProps<typeof Avatar>, IWithClassName {
  displayName: string;
  imageUrl?: string | undefined;
}

export function UserAvatar({
  displayName,
  imageUrl,
  ...props
}: IUserAvatarProps) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase();
  return (
    <Avatar {...props}>
      {imageUrl && (
        <AvatarImage src={imageUrl} alt="" className="object-cover" />
      )}
      <AvatarFallback>
        {initials || <UserRound size={18} aria-hidden="true" />}
      </AvatarFallback>
    </Avatar>
  );
}
