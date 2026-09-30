// ==UserScript==
// @name         YouTube Playlist Sorter (hotkey trigger)
// @namespace    https://github.com/sergkhr/YouTube-UI-fixes
// @version      1.3
// @description  Sort playlists alphabetically (A–Z → А–Я) when middle mouse button is clicked on YouTube
// @author       sergkhr
// @homepageURL  https://github.com/sergkhr/YouTube-UI-fixes
// @supportURL   https://github.com/sergkhr/YouTube-UI-fixes/issues
// @updateURL    https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Sort%20on%20hotkey/Youtube_sort_playlists_on_hotkey.js
// @downloadURL  https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Sort%20on%20hotkey/Youtube_sort_playlists_on_hotkey.js
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* ---------- Sorting function ---------- */

    function getPlaylistName(el) {
        const label =
            el.querySelector('[role="menuitem"]')
                ?.getAttribute('aria-label') || '';

        return label
            .split(',')[0]
            .trim()
            .toLowerCase();
    }

    async function sortPlaylist() {
        console.log('sorting started');

        await new Promise(resolve => setTimeout(resolve, 300));

        const lists = [
            ...document.querySelectorAll('[role="menu"]')
        ];

        console.log('lists are: ', lists);

        if (lists.length === 0) {
            console.warn('⚠️ Playlist lists not found');
            return;
        }

        lists.forEach((list, index) => {
            if (list.offsetParent === null) {
                console.log(
                    `list ${index} is hidden, skipping`
                );
                return;
            }

            const items = [...list.children];

            if (items.length === 0) {
                console.log(
                    `list ${index} is empty`
                );
                return;
            }

            items.sort((a, b) =>
                getPlaylistName(a) >
                getPlaylistName(b)
                    ? 1
                    : -1
            );

            items.forEach(el => el.remove());
            items.forEach(el => list.appendChild(el));

            console.log(
                `✅ List ${index} sorted:`,
                items.length
            );
        });
    }

    /* ---------- Hotkey / mouse trigger ---------- */

    document.addEventListener(
        'mousedown',
        event => {
            // Middle mouse button is usually event.button === 1.
            if (event.button === 1) {
                console.log(
                    '🖱 Middle mouse clicked → sorting playlists'
                );

                sortPlaylist();
            }
        }
    );

    console.log(
        '🚀 YouTube Playlist Sorter (hotkey version) loaded'
    );
})();