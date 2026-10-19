'use client';
import type { ComponentProps } from 'react';
import { UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

type UserAvatarProps = ComponentProps<typeof Avatar> & {
  displayName: string;
  imageUrl?: string | undefined;
};

export function UserAvatar({
  displayName,
  imageUrl,
  ...props
}: UserAvatarProps) {
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
