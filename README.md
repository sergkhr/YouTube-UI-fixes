# A bunch of scripts to work with youtube playlists on new UI
There is some amount of scripts for tampermonkey to try and solve solve problems with youtube's new UI

## Sorting playlists
Sorts playlists in the window of adding a video to a playlist

BEWARE!!! Automatic variant is an undead monstrosity and can break stuff
but updating the page helps

Or maybe the sorting is breaking stuff, but under some really specific conditions


Sorting via a hotkey requires you to open the window of adding a video before pressing the hotkey

## Preventing playlist popup closure after just one click
for now it's on hotkey

- Clicks inside does not close the popup
- Clicks outside close the popup

The popup window does not update after the click, but it does work
click outside the popup window to close it, then open again and you will see the change

Clicking the playlist (add or delete) multiple times does **the same** action multiple times
So yes, it'll add video 100500 times if you spam

## Hotkey
I've put MMB, change it in the script if you want

Did not put a prevent deffault, so it will still open links in new tab if clicked on link
click on an empty space
