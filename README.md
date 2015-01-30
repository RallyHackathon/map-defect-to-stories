Map Defects to Stories
=========================

## Overview
This app allows the user to save a list of User Story FormattedIDs
to a defect. This workarounds the current limitation of only allowing one parent story per defect.

!['screenshot'](mapDefectToStories.png)

This was a project worked on during the January 2015 hackathon with Patrick Pham of Cisco and Ben Ridge of Rally.

##Setup
* Add a custom field of type 'String' to type 'Defect' in your workspace. The code assumes the field name is 'Associated User Stories' but that can be modified in the config of the app.
* Add the app to a dashboard. It requires a lot of vertical space to see it all.

## License

AppTemplate is released under the MIT license.  See the file [LICENSE](./LICENSE) for the full text.

##Documentation for SDK

You can find the documentation on our help [site.](https://help.rallydev.com/apps/2.0/doc/)
