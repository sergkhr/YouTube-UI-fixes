// ==UserScript==
// @name         YouTube Playlist Popup Protector (hotkey trigger)
// @namespace    https://youtube.com/
// @version      1.2
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
    
        let lastClickInside = false;
    
        // Определяем, был ли клик внутри окна
        document.addEventListener('mousedown', (event) => {
            lastClickInside = dropdown.contains(event.target);
    
            // Если клик вне — закрываем окно вручную
            if (!lastClickInside && dropdown.style.display !== 'none') {
                console.log('👋 Click outside — closing playlist popup');
                dropdown.style.display = 'none';
                dropdown.style.zIndex = '';
            }
        });
    
        // Следим за изменением атрибутов стиля
        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'style') {
                    const display = dropdown.style.display;
                    const z = dropdown.style.zIndex;
    
                    // YouTube пытается скрыть окно (но мы кликнули внутри)
                    if (display === 'none' && lastClickInside) {
                        console.log('🚫 Prevented YouTube from hiding playlist popup (click inside)');
                        dropdown.style.display = '';
                        dropdown.style.zIndex = '2202'; // восстановим z-index
                        lastClickInside = false;
                    }
    
                    // Если YouTube сбросил z-index, но окно всё ещё видно — восстанавливаем
                    else if (z !== '2202' && display !== 'none') {
                        dropdown.style.zIndex = '2202';
                    }
                }
            }
        });
    
        observer.observe(dropdown, { attributes: true, attributeFilter: ['style'] });
    
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
    