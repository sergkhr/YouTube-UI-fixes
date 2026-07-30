// ==UserScript==
// @name         YouTube Playlist Popup Protector (hotkey trigger)
// @namespace    https://youtube.com/
// @version      1.5
// @description  Prevent YouTube playlist popups from closing when clicking inside them, but close them on outside click
// @author       You
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PROTECTOR_CLASS = 'my-ytd--playlist-popup-protector';

    // Создаём тег <style>
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
     * Ищет все уникальные tp-yt-iron-dropdown,
     * внутри которых есть элемент с role="menu".
     */
    function findPlaylistDropdowns() {
        const lists = [...document.querySelectorAll('[role="menu"]')];

        const dropdowns = lists
            .map(list => list.closest('tp-yt-iron-dropdown'))
            .filter(dropdown => dropdown !== null);

        // Убираем дубликаты:
        // один dropdown может содержать несколько элементов role="menu".
        return [...new Set(dropdowns)];
    }

    /**
     * Навешивает защиту на одно окно.
     */
    function protectDropdown(dropdown, index) {
        if (dropdown.dataset.playlistPopupProtected === 'true') {
            console.log(`Dropdown ${index} already protected`, dropdown);
            return;
        }

        dropdown.dataset.playlistPopupProtected = 'true';

        dropdown.addEventListener('mousedown', () => {
            if (!dropdown.classList.contains(PROTECTOR_CLASS)) {
                dropdown.classList.add(PROTECTOR_CLASS);

                console.log(
                    `🟢 Protection class added to dropdown ${index}`,
                    dropdown
                );
            }
        }, true);

        console.log(`🛡 Protection attached to dropdown ${index}`, dropdown);
    }

    /**
     * Ищет все подходящие окна и навешивает защиту на каждое.
     */
    function protectPlaylistPopups() {
        const dropdowns = findPlaylistDropdowns();

        console.log('Found playlist dropdowns:', dropdowns);

        if (dropdowns.length === 0) {
            console.warn('⚠️ Playlist dropdowns not found');
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
     * Один общий обработчик клика вне окон.
     *
     * Удаляет защитный класс со всех защищённых dropdown,
     * кроме того, внутри которого был сделан клик.
     */
    document.addEventListener('mousedown', event => {
        const protectedDropdowns = [
            ...document.querySelectorAll(
                `tp-yt-iron-dropdown.${PROTECTOR_CLASS}`
            )
        ];

        protectedDropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove(PROTECTOR_CLASS);

                console.log(
                    '🔴 Protection class removed from dropdown',
                    dropdown
                );
            }
        });
    });

    /**
     * Горячая клавиша — средняя кнопка мыши.
     */
    document.addEventListener('mousedown', event => {
        if (event.button === 1) {
            event.preventDefault();

            console.log(
                '🖱 Middle click detected → enabling popup protection'
            );

            protectPlaylistPopups();
        }
    });

    console.log(
        '🚀 Playlist Popup Protector (multiple dropdown version) loaded'
    );
})();