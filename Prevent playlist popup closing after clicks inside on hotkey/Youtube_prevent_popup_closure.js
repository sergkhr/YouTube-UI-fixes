// ==UserScript==
// @name         YouTube Playlist Popup Protector (hotkey trigger)
// @namespace    https://youtube.com/
// @version      1.4
// @description  Prevent YouTube playlist popup from closing when clicking inside it, but close it on outside click
// @author       You
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // создаём тег <style>
    const style = document.createElement('style');
    style.textContent = `
        .my-ytd--playlist-popup-protector {
            display: unset !important;
            z-index: 2202 !important;
        }
    `;
    document.head.appendChild(style);

    console.log('🎨 Custom style for playlist popup added');


    /**
     * Ищем нужный tp-yt-iron-dropdown, который является родителем блока с role="menu"
     */
    function findPlaylistDropdown() {
        const lists = document.querySelectorAll('[role="menu"]');
        for (const list of lists) {
            const dropdown = list.closest('tp-yt-iron-dropdown');
            if (dropdown) {
                return dropdown;
            }
        }
        return null;
    }

    /**
     * Навешивает защиту на окно и управляет закрытием
     */
    function protectPlaylistPopup() {
        const dropdown = findPlaylistDropdown();
        if (!dropdown) {
            console.warn('⚠️ Playlist dropdown not found');
            return;
        }

        console.log('🛡 Protecting playlist dropdown', dropdown);

        // Пометим, что защита уже активна, чтобы не навешивать повторно
        if (dropdown.dataset.protected) return;
        dropdown.dataset.protected = 'true';

        // ✅ Клик внутри окна — включаем защиту (добавляем класс)
        dropdown.addEventListener('mousedown', (e) => {
            if (!dropdown.classList.contains('my-ytd--playlist-popup-protector')) {
                dropdown.classList.add('my-ytd--playlist-popup-protector');
                console.log('🟢 Protection class added to dropdown');
            }
        }, true);

        // ✅ Клик вне окна — убираем защиту (удаляем класс)
        document.addEventListener('mousedown', (e) => {
            if (!dropdown.contains(e.target) && dropdown.classList.contains('my-ytd--playlist-popup-protector')) {
                dropdown.classList.remove('my-ytd--playlist-popup-protector');
                console.log('🔴 Protection class removed from dropdown');
            }
        });


        console.log('✅ Protection active for playlist dropdown (manual close mode)');
    }

    /**
     * Горячая клавиша — средняя кнопка мыши
     */
    document.addEventListener('mousedown', (event) => {
        if (event.button === 1) {
            event.preventDefault(); // чтобы не открывало ссылки
            console.log('🖱 Middle click detected → enabling popup protection');
            protectPlaylistPopup();
        }
    });

    console.log('🚀 Playlist Popup Protector (manual close version) loaded');
    })();
