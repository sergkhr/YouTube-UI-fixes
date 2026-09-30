# Different Tampermonkey scripts to try and fix my problems with YouTube's UI
There is some amount of scripts for tampermonkey to try and solve solve problems with youtube's new UI

## Sorting playlists
Sorts playlists in the window of adding a video to a playlist
(I couldn't make working automatic sorting variant, so I gave up)

Sorting via a hotkey requires you to open the window of adding a video before pressing the hotkey

### Hotkey
Default is MMB.
> Can be changed in script

## Preventing playlist popup closure after just one click
for now it's on hotkey

- Clicks inside does not close the popup
- Clicks outside close the popup

The popup window does not update after the click, but it does work
click outside the popup window to close it, then open again and you will see the change

Clicking the playlist (add or delete) multiple times does **the same** action multiple times
So yes, it'll add video 100500 times if you spam

### Hotkey
Default is MMB.
> Can be changed in script


## Jam playlist panel returner
I encountered a problem: list of tracks is no longer visible if it's a radio list (jam)

This script is automatically brings back the panel on radio playlists, and closes force-opened panels when they are not needed
