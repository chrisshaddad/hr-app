### Description
Updated the schema 

Added new models for Admin Dashboard functionality:
- Team & TeamMember: Manage teams (cross-department groups)
- Group & GroupMember: Manage groups (social/committees)
- Holiday: Manage company and branch-specific holidays
- StatusType: Manage employee statuses (WFH, On Leave, etc.)
- FeatureFlag: Enable/disable features per organization
- OrganizationSetting: Company settings and logo management
- ActivityLog: Audit trail for system actions

Updated existing models:
- User: Added teamMemberships, groupMemberships, activityLogs relations
- Organization: Added relations to all new models
- Branch: Added holidays relation

A few questions concerning the design:
- Regarding the activity logs, teams, groups and feature logs, I did not see any UI design concerning these features. I was wondering if I have to design them myself without any reference
- According to the figma design, I was checking the features im resposible of as the admin dashboard, ill list them below just to double check with you because there are alot of different features scattered:
 
What I am 100% sure about (design):
 - AUth and Onboarding
 - EMployees
 - Time Off( only from 40 -> 44 (SInce the holidays are one of my resposibilities))
 - Settings ( from 107 -> 116)

The confusing part is in the Settings there is Integration and Payments etc, am I responsible of these features as well or it does not matter.




### Link to issue or ticket

<!-- Include a link to the issue this pull request addresses, if applicable -->

### Steps to QA

<!-- Include steps to test and verify the changes made in this pull request -->

### Screenshots

<!-- Include screenshots to help explain the changes made if this is a UI change -->
