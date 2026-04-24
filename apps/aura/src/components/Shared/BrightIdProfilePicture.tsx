import React, { useMemo } from "react"
import { useGetProfilePhotoQuery } from "@/hooks/queries/backup"
import { useProfileStore } from "@/store/profile.store"
import { hash } from "@/utils/crypto"
import { createBlockiesImage } from "@/utils/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

const DEFAULT_PROFILE_PICTURE = "/assets/images/avatar-thumb.jpg"
const BrightIdProfilePicture = ({
  subjectId,
  withoutHover = false,
  ...props
}: React.HTMLAttributes<HTMLImageElement> & {
  subjectId: string | undefined
  withoutHover?: boolean
}) => {
  const imgSrc = useMemo(
    () =>
      subjectId ? createBlockiesImage(subjectId) : DEFAULT_PROFILE_PICTURE,
    [subjectId],
  )
  const authData = useProfileStore((s) => s.authData)
  const key = authData ? hash(authData.brightId + authData.password) : ""
  const { data } = useGetProfilePhotoQuery(
    key,
    subjectId ?? "",
    authData?.password ?? "",
  )

  const imageSource = data || imgSrc

  if (withoutHover)
    return (
      <img
        data-testid={
          data ? `picture-${subjectId}` : `picture-${subjectId}-blocky`
        }
        {...props}
        alt={subjectId}
        className={`${props.className ?? ""} object-cover`}
        src={imageSource || "/placeholder.svg"}
      />
    )

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <img
          {...props}
          data-testid={`picture-${subjectId}`}
          alt={subjectId}
          className={`${props.className ?? ""} object-cover transition-transform duration-200 hover:scale-105`}
          src={imageSource || "/placeholder.svg"}
        />
      </HoverCardTrigger>
      <HoverCardContent className="p-1">
        <img
          data-testid={`picture-${subjectId}`}
          src={imageSource}
          alt={subjectId}
          className="h-auto max-h-[300px] max-w-[300px] rounded-md object-cover"
        />
      </HoverCardContent>
    </HoverCard>
  )
}

export default BrightIdProfilePicture
