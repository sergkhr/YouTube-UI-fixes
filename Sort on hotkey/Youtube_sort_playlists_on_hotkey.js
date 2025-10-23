// ==UserScript==
// @name         YouTube Playlist Sorter (hotkey trigger)
// @namespace    https://youtube.com/
// @version      1.0
// @description  Sort playlists alphabetically (A–Z → А–Я) when middle mouse button is clicked on YouTube
// @author       You
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    /* ---------- Sorting function ---------- */
    function getPlaylistName(el) {
        const label = el.querySelector('[role="listitem"]')?.getAttribute('aria-label') || '';
        return label.split(',')[0].trim().toLowerCase();
    }
    
    async function sortPlaylist() {
        await new Promise(resolve => setTimeout(resolve, 300));
    
        const list = document.querySelector('[role="list"]');
        if (!list || list.offsetParent === null) {
            console.warn('⚠️ Playlist list not found or hidden');
            return;
        }
    
        let items = [...list.children];
        if (items.length === 0) return;
    
        items.sort((a, b) => getPlaylistName(a) > getPlaylistName(b) ? 1 : -1);
        items.forEach(el => el.remove());
        items.forEach(el => list.appendChild(el));
    
        console.log('✅ Playlists sorted:', items.length);
    }
    
    /* ---------- Hotkey / Mouse trigger ---------- */
    document.addEventListener('mousedown', (event) => {
        // Средняя кнопка мыши (обычно event.button === 1)
        if (event.button === 1) {
            console.log('🖱 Middle mouse clicked → sorting playlists');
            sortPlaylist();
        }
    });
    
    console.log('🚀 YouTube Playlist Sorter (hotkey version) loaded');
    })();
    