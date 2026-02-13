export const menuItems = [
  {
    id: "reports",
    label: "Reports",
    type: "GROUP",
    icon: "chart",
    children: [
      { id: "headcount", label: "Headcount (Point in Time)", type: "LINK", route: "/reports/headcount" },
      { id: "onboarding-report", label: "Onboarding", type: "LINK", route: "/reports/onboarding" },
      { id: "offboarding-report", label: "Offboarding", type: "LINK", route: "/reports/offboarding" },
      { id: "timeoff-balance", label: "Time Off Balance", type: "LINK", route: "/reports/time-off-balance" },
      { id: "recruitment-pipeline", label: "Recruitment Pipeline", type: "LINK", route: "/reports/recruitment-pipeline" },
      { id: "employee-data", label: "Employee Data Reports", type: "LINK", route: "/reports/employee-data" },
      { id: "timeoff-schedule", label: "Time Off Schedule", type: "LINK", route: "/reports/time-off-schedule" },
      { id: "turnover-rate", label: "Employee Turnover Rate", type: "LINK", route: "/reports/turnover-rate" },
    ],
  },
  {
    id: "checklists",
    label: "Checklists",
    type: "GROUP",
    icon: "checklist",
    children: [
      {
        id: "onboarding-checklist",
        label: "Onboarding",
        type: "GROUP",
        children: [
          { id: "onboarding-todos", label: "To-Dos", type: "LINK", route: "/checklists/onboarding" },
        ],
      },
      {
        id: "offboarding-checklist",
        label: "Offboarding",
        type: "GROUP",
        children: [
          { id: "offboarding-todos", label: "To-Dos", type: "LINK", route: "/checklists/offboarding" },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    type: "GROUP",
    icon: "settings",
    children: [
      { id: "organization-settings", label: "Organization", type: "LINK", route: "/settings/organization" },
      { id: "checklist-settings", label: "Checklist Templates", type: "LINK", route: "/settings/checklists" },
      { id: "report-settings", label: "Report Templates", type: "LINK", route: "/settings/reports" },
    ],
  },
];
