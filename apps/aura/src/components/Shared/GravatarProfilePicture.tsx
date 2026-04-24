import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

const GravatarProfilePicture = ({
  image,
  withoutHover = false,
  ...props
}: React.HTMLAttributes<HTMLImageElement> & {
  image: string | undefined
  withoutHover?: boolean
}) => {
  if (withoutHover)
    return (
      <img
        {...props}
        className={`${props.className ?? ""} object-cover`}
        src={image || "/placeholder.svg"}
      />
    )

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <img
          {...props}
          className={`${props.className ?? ""} object-cover transition-transform duration-200 hover:scale-105`}
          src={image || "/placeholder.svg"}
        />
      </HoverCardTrigger>
      <HoverCardContent className="">
        <img
          src={image}
          className="h-auto max-h-[300px] max-w-[300px] rounded-md object-cover"
        />
      </HoverCardContent>
    </HoverCard>
  )
}

export default GravatarProfilePicture
