import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconBell,
  IconUser,
} from "@tabler/icons-react"

export const dashboardLinks = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      title: "Pricing",
      url: "/pricing",
      icon: IconListDetails,
    },
  ],
  navAccount: [
    {
      title: "Account",
      url: "/account",
      icon: IconUser,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: IconCreditCard,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: IconBell,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: IconSettings,
    // },
    {
      title: "Get Help",
      url: "https://discord.gg/pcWy6NqM",
      icon: IconHelp,
    },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}
