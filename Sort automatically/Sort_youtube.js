// ==UserScript==
// @name         YouTube Playlist Sorter (updated UI + buttons)
// @namespace    https://youtube.com/
// @version      1.1
// @description  Sort playlists alphabetically (A–Z → А–Я) when using the Save button or Save from menu on YouTube
// @author       You
// @match        *://www.youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    /* ---------- Playlist sorting ---------- */
    
    function getPlaylistName(el) {
        const label = el.querySelector('[role="listitem"]')?.getAttribute('aria-label') || '';
        return label.split(',')[0].trim().toLowerCase();
    }
    
    async function sortPlaylist() {
        await new Promise(r => setTimeout(r, 300));
    
        const list = document.querySelector('[role="list"]');
        if (!list || list.offsetParent === null) return;
    
        let items = [...list.children];
        if (!items.length) return;
    
        items.sort((a, b) => getPlaylistName(a) > getPlaylistName(b) ? 1 : -1);
        items.forEach(el => el.remove());
        items.forEach(el => list.appendChild(el));
    
        console.log('✅ Playlists sorted:', items.length);
    }
    
    /* ---------- Observe for playlist window ---------- */
    
    function observePlaylist() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.getAttribute?.('role') === 'list') {
                        sortPlaylist();
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    /* ---------- Handle Save button and "..." menu ---------- */
    
    function attachButtonListeners() {
        // main "Save" button (visible directly under video)
        const saveBtn = [...document.querySelectorAll('button[aria-label*="Сохранить"], button[aria-label*="Save"], button[aria-label*="Добавить в плейлист"]')]
            .find(btn => btn.innerText.trim().toLowerCase().includes('сохранить') || btn.innerText.trim().toLowerCase().includes('save') || btn.innerText.trim().toLowerCase().includes('Добавить в плейлист'));
    
        if (saveBtn && !saveBtn.dataset.listenerAttached) {
            saveBtn.dataset.listenerAttached = 'true';
            saveBtn.addEventListener('click', () => {
                console.log('📁 Save button clicked');
                sortPlaylist();
            });
            console.log('✅ Save button listener attached');
        }
    
        // Найти все кнопки "Ещё" / "More" на странице
        const moreButtons = document.querySelectorAll('button[aria-label="Ещё"], button[aria-label="More"], button[aria-label="Меню действий"], button[aria-label="Video actions"]');

        moreButtons.forEach((btn) => {
            if (!btn.dataset.listenerAttached) {
                btn.dataset.listenerAttached = 'true';
                btn.addEventListener('click', () => {
                    console.log('📜 More button clicked');
                    observeMenuForSave();
                });
                console.log('✅ Attached listener to More button');
            }
        });

    }
    
    /* ---------- Watch for menu and attach listener to its items ---------- */
    function observeMenuForSave() {
        // подождать, пока YouTube создаст меню
        setTimeout(() => {
            // ищем оба варианта меню
            const menus = document.querySelectorAll(
                'tp-yt-paper-listbox#items, [role="menu"], [role="listbox"]'
            );

            if (!menus.length) {
                console.warn('⚠️ Menu not found yet');
                return;
            }

            menus.forEach(menu => {
                if (menu.dataset.menuListener) return;
                menu.dataset.menuListener = 'true';

                menu.addEventListener('click', (event) => {
                    // пункт меню может быть role="option" или role="menuitem"
                    const button = event.target.closest('[role="option"], [role="menuitem"]');
                    if (!button) return;

                    const text = button.innerText.trim().toLowerCase();
                    if (text.includes('сохранить') || text.includes('save') || text.includes('Добавить в плейлист')) {
                        console.log('🎯 Menu → Save clicked');
                        sortPlaylist();
                    }
                });

                console.log('✅ Menu listener attached to', menu.getAttribute('role') || menu.tagName);
            });
        }, 400); // чуть больше задержка — YouTube иногда лениво создаёт меню
    }


    
    /* ---------- Periodically try attaching button listeners ---------- */
    
    function watchButtons() {
        attachButtonListeners();
        const obs = new MutationObserver(() => attachButtonListeners());
        obs.observe(document.body, { childList: true, subtree: true });
    }
    
    /* ---------- Run ---------- */
    
    setTimeout(() => {
        watchButtons();
        observePlaylist();
        console.log('🚀 YouTube Playlist Sorter initialized');
    }, 500);
    
    
    })();
    