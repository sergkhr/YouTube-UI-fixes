// ==UserScript==
// @name         YouTube Playlist Popup Protector (hotkey trigger)
// @namespace    https://youtube.com/
// @version      1.3
// @description  Prevent YouTube playlist popup from closing when clicking inside it, but close it on outside click
// @author       You
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    /**
     * Ищем нужный tp-yt-iron-dropdown, который является родителем блока с role="list"
     */
    function findPlaylistDropdown() {
        const lists = document.querySelectorAll('[role="list"]');
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
    
        // ✅ Блокируем клики внутри окна
        dropdown.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
    
            // Если окно вдруг скрылось из-за фокуса — вернем
            if (dropdown.style.display === 'none') {
                console.log('🚫 Prevented YouTube from hiding playlist popup (click inside)');
                dropdown.style.display = '';
                dropdown.style.zIndex = '2202';
            }
        }, true);
    
        // ✅ Клик вне — вручную закрываем окно
        document.addEventListener('mousedown', (e) => {
            if (!dropdown.contains(e.target) && dropdown.style.display !== 'none') {
                console.log('👋 Click outside — closing playlist popup manually');
                dropdown.style.display = 'none';
                dropdown.style.zIndex = '';
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
    