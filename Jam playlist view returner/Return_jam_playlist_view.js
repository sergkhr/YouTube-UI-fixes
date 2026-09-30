// ==UserScript==
// @name         YouTube Radio / Jam Playlist Panel Fix
// @namespace    https://youtube.com/
// @version      1.0
// @description  Restores the playlist panel for YouTube Radio/Jam playlists and hides it again when leaving Radio.
// @author       You
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PANEL_SELECTOR = 'ytd-playlist-panel-renderer';
    const MARKER_ATTRIBUTE = 'data-radio-panel-forced-open';

    let currentPanel = null;
    let panelObserver = null;

    // Дополнительно запоминаем состояние отдельно от DOM.
    // Это нужно на случай, если YouTube заменит сам элемент панели
    // во время перехода со страницы Radio.
    let forcedOpenByScript = false;

    /**
     * Определяет текущее состояние страницы:
     *
     * radio    — YouTube Radio / Mix / Jam
     * playlist — обычный плейлист
     * none     — плейлиста нет
     */
    function getPlaylistState() {
        const url = new URL(location.href);

        const list = url.searchParams.get('list');
        const startRadio = url.searchParams.get('start_radio');

        if (
            startRadio === '1' ||
            (list && list.startsWith('RD'))
        ) {
            return 'radio';
        }

        if (list) {
            return 'playlist';
        }

        return 'none';
    }

    /**
     * Помечает панель как открытую нашим скриптом
     * и снимает hidden.
     */
    function forceOpenPanel(panel) {
        forcedOpenByScript = true;

        panel.setAttribute(MARKER_ATTRIBUTE, 'true');

        if (panel.hasAttribute('hidden')) {
            panel.removeAttribute('hidden');

            console.log(
                '[Radio Panel Fix] Removed hidden from Radio playlist panel'
            );
        }
    }

    /**
     * Закрывает панель, но только если ранее её открыл наш скрипт.
     */
    function closeForcedPanel(panel) {
        const markedByScript =
            panel.getAttribute(MARKER_ATTRIBUTE) === 'true';

        if (!forcedOpenByScript && !markedByScript) {
            return;
        }

        panel.setAttribute('hidden', '');
        panel.removeAttribute(MARKER_ATTRIBUTE);

        forcedOpenByScript = false;

        console.log(
            '[Radio Panel Fix] Left Radio without a playlist; panel hidden again'
        );
    }

    /**
     * Начинает отдельно следить за конкретной панелью.
     *
     * Это нужно потому, что YouTube может повторно поставить
     * hidden уже после того, как мы его сняли.
     */
    function observePanel(panel) {
        if (panel === currentPanel) {
            return;
        }

        if (panelObserver) {
            panelObserver.disconnect();
        }

        currentPanel = panel;

        panelObserver = new MutationObserver(() => {
            if (getPlaylistState() !== 'radio') {
                return;
            }

            if (panel.hasAttribute('hidden')) {
                forceOpenPanel(panel);
            }
        });

        panelObserver.observe(panel, {
            attributes: true,
            attributeFilter: ['hidden']
        });
    }

    /**
     * Основная логика.
     */
    function updatePlaylistPanel() {
        const state = getPlaylistState();
        const panel = document.querySelector(PANEL_SELECTOR);

        if (!panel) {
            return;
        }

        observePanel(panel);

        switch (state) {
            case 'radio':
                // Radio / Jam:
                // принудительно показываем панель.
                forceOpenPanel(panel);
                break;

            case 'playlist':
                /*
                 * Обычный плейлист:
                 *
                 * управление полностью возвращаем YouTube.
                 * hidden здесь намеренно не меняем.
                 */
                panel.removeAttribute(MARKER_ATTRIBUTE);
                forcedOpenByScript = false;
                break;

            case 'none':
                /*
                 * Плейлиста нет:
                 *
                 * закрываем панель только в том случае,
                 * если она была раскрыта нашим скриптом.
                 */
                closeForcedPanel(panel);
                break;
        }
    }

    /**
     * Небольшая защита от десятков вызовов updatePlaylistPanel()
     * подряд при массовых изменениях DOM.
     */
    let updateScheduled = false;

    function scheduleUpdate() {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;

        requestAnimationFrame(() => {
            updateScheduled = false;
            updatePlaylistPanel();
        });
    }

    /**
     * Основное событие SPA-навигации YouTube.
     */
    document.addEventListener('yt-navigate-finish', () => {
        scheduleUpdate();
    });

    /**
     * YouTube может создать ytd-playlist-panel-renderer
     * уже после завершения навигации.
     *
     * Поэтому следим также за изменениями DOM.
     */
    const pageObserver = new MutationObserver(() => {
        /*
         * На обычной странице без нашего Radio вмешиваться
         * практически незачем.
         *
         * Но update всё равно безопасен: для обычного плейлиста
         * он ничего с hidden не делает.
         */
        scheduleUpdate();
    });

    function start() {
        pageObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        scheduleUpdate();

        console.log('[Radio Panel Fix] Started');
    }

    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, {
            once: true
        });
    }
})();