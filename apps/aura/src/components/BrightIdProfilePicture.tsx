import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { hash } from '@/utils/crypto';

import { createBlockiesImage } from '@/utils/image';

import { selectAuthData } from '../store/profile/selectors';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetProfilePhotoQuery } from '@/store/api/backup';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

const DEFAULT_PROFILE_PICTURE = '/assets/images/avatar-thumb.jpg';
const BrightIdProfilePicture = ({
  subjectId,
  withoutHover = false,
  ...props
}: React.HTMLAttributes<HTMLImageElement> & {
  subjectId: string | undefined;
  withoutHover?: boolean;
}) => {
  const imgSrc = useMemo(
    () =>
      subjectId ? createBlockiesImage(subjectId) : DEFAULT_PROFILE_PICTURE,
    [subjectId],
  );
  const authData = useSelector(selectAuthData);
  const { data } = useGetProfilePhotoQuery(
    authData && subjectId
      ? {
          brightId: subjectId,
          key: hash(authData.brightId + authData.password),
          password: authData.password,
        }
      : skipToken,
  );

  const imageSource = data || imgSrc;

  if (withoutHover)
    return (
      <img
        data-testid={
          data ? `picture-${subjectId}` : `picture-${subjectId}-blocky`
        }
        {...props}
        alt={subjectId}
        className={`${props.className ?? ''} object-cover`}
        src={imageSource || '/placeholder.svg'}
      />
    );

  //TODO: use profile name in alt

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <img
          {...props}
          data-testid={`picture-${subjectId}`}
          alt={subjectId}
          className={`${props.className ?? ''} object-cover transition-transform duration-200 hover:scale-105`}
          src={imageSource || '/placeholder.svg'}
        />
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-1">
        <img
          data-testid={`picture-${subjectId}`}
          src={imageSource}
          alt={subjectId}
          className="h-auto max-h-[300px] w-auto max-w-[300px] rounded-md object-cover"
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default BrightIdProfilePicture;
