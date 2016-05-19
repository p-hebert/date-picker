## Current Known Issues

- Most components won't work if no max/min are specified.
- Max/Min cannot be changed on the fly yet
- Changing from one week to another through the PickerControls will result in
  the week calendar failing to update correctly if the week is completely in
  the following month from the one displayed but is displayed as a sixth row
  in the calendar view.
- Changing from one day to another through the PickerControls when in the day
  scale does not update the calendar view.
- It is suspected that the PickerControls could introduce a way to go beyond
  the boundaries (max/min) if an inconsistency is found.
- The French version is buggy at best.

## Other Notes

- Don't forget to upload dateutils and add entry to [this SO post](http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date)
