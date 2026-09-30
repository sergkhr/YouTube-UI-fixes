// ==UserScript==
// @name         YouTube Playlist Popup Protector (hotkey trigger)
// @namespace    https://github.com/sergkhr/YouTube-UI-fixes
// @version      1.6
// @description  Prevent YouTube playlist popups from closing when clicking inside them, but close them on outside click
// @author       sergkhr
// @homepageURL  https://github.com/sergkhr/YouTube-UI-fixes
// @supportURL   https://github.com/sergkhr/YouTube-UI-fixes/issues
// @updateURL    https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Prevent%20playlist%20popup%20closing%20after%20clicks%20inside%20on%20hotkey/Playlist_popup_protector.js
// @downloadURL  https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Prevent%20playlist%20popup%20closing%20after%20clicks%20inside%20on%20hotkey/Playlist_popup_protector.js
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PROTECTOR_CLASS = 'my-ytd--playlist-popup-protector';

    // Create the custom <style> element.
    const style = document.createElement('style');

    style.textContent = `
        .${PROTECTOR_CLASS} {
            display: unset !important;
            z-index: 2202 !important;
        }
    `;

    document.head.appendChild(style);

    console.log('🎨 Custom style for playlist popups added');

    /**
     * Finds all unique tp-yt-iron-dropdown elements
     * that contain an element with role="menu".
     */
    function findPlaylistDropdowns() {
        const lists = [...document.querySelectorAll('[role="menu"]')];

        const dropdowns = lists
            .map(list => list.closest('tp-yt-iron-dropdown'))
            .filter(dropdown => dropdown !== null);

        // Remove duplicates because a single dropdown
        // may contain multiple role="menu" elements.
        return [...new Set(dropdowns)];
    }

    /**
     * Attaches popup protection to a single dropdown.
     */
    function protectDropdown(dropdown, index) {
        if (dropdown.dataset.playlistPopupProtected === 'true') {
            console.log(
                `Dropdown ${index} already protected`,
                dropdown
            );
            return;
        }

        dropdown.dataset.playlistPopupProtected = 'true';

        dropdown.addEventListener(
            'mousedown',
            () => {
                if (
                    !dropdown.classList.contains(PROTECTOR_CLASS)
                ) {
                    dropdown.classList.add(PROTECTOR_CLASS);

                    console.log(
                        `🟢 Protection class added to dropdown ${index}`,
                        dropdown
                    );
                }
            },
            true
        );

        console.log(
            `🛡 Protection attached to dropdown ${index}`,
            dropdown
        );
    }

    /**
     * Finds all matching dropdowns
     * and attaches protection to each one.
     */
    function protectPlaylistPopups() {
        const dropdowns = findPlaylistDropdowns();

        console.log(
            'Found playlist dropdowns:',
            dropdowns
        );

        if (dropdowns.length === 0) {
            console.warn(
                '⚠️ Playlist dropdowns not found'
            );
            return;
        }

        dropdowns.forEach((dropdown, index) => {
            protectDropdown(dropdown, index);
        });

        console.log(
            `✅ Protection active for playlist dropdowns: ${dropdowns.length}`
        );
    }

    /**
     * Global handler for clicks outside protected dropdowns.
     *
     * Removes the protection class from every protected dropdown
     * except the one containing the click target.
     */
    document.addEventListener(
        'mousedown',
        event => {
            const protectedDropdowns = [
                ...document.querySelectorAll(
                    `tp-yt-iron-dropdown.${PROTECTOR_CLASS}`
                )
            ];

            protectedDropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target)) {
                    dropdown.classList.remove(
                        PROTECTOR_CLASS
                    );

                    console.log(
                        '🔴 Protection class removed from dropdown',
                        dropdown
                    );
                }
            });
        }
    );

    /**
     * Hotkey trigger: middle mouse button.
     */
    document.addEventListener(
        'mousedown',
        event => {
            if (event.button === 1) {
                event.preventDefault();

                console.log(
                    '🖱 Middle click detected → enabling popup protection'
                );

                protectPlaylistPopups();
            }
        }
    );

    console.log(
        '🚀 Playlist Popup Protector (multiple dropdown version) loaded'
    );
})();