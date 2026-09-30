// ==UserScript==
// @name         YouTube Radio / Jam Playlist Panel Fix
// @namespace    https://github.com/sergkhr/YouTube-UI-fixes
// @version      1.1
// @description  Restores the playlist panel for YouTube Radio/Jam playlists and hides it again when leaving Radio.
// @author       sergkhr
// @homepageURL  https://github.com/sergkhr/YouTube-UI-fixes
// @supportURL   https://github.com/sergkhr/YouTube-UI-fixes/issues
// @updateURL    https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Jam%20playlist%20view%20returner/Return_jam_playlist_view.js
// @downloadURL  https://raw.githubusercontent.com/sergkhr/YouTube-UI-fixes/master/Jam%20playlist%20view%20returner/Return_jam_playlist_view.js
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

    // Keep the forced-open state separately from the DOM.
    // This is needed in case YouTube replaces the panel element
    // while navigating away from a Radio page.
    let forcedOpenByScript = false;

    /**
     * Determines the current playlist state:
     *
     * radio    — YouTube Radio / Mix / Jam
     * playlist — regular playlist
     * none     — no playlist
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
     * Marks the panel as opened by this script
     * and removes the hidden attribute.
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
     * Hides the panel only if it was previously opened by this script.
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
     * Observes the current playlist panel directly.
     *
     * This is necessary because YouTube may add the hidden
     * attribute again after this script has removed it.
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
     * Applies the correct panel behavior for the current page state.
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
                // force the playlist panel to remain visible.
                forceOpenPanel(panel);
                break;

            case 'playlist':
                /*
                 * Regular playlist:
                 *
                 * return full control to YouTube.
                 * Do not modify the hidden attribute here.
                 */
                panel.removeAttribute(MARKER_ATTRIBUTE);
                forcedOpenByScript = false;
                break;

            case 'none':
                /*
                 * No playlist:
                 *
                 * hide the panel only if this script opened it.
                 */
                closeForcedPanel(panel);
                break;
        }
    }

    /**
     * Prevents many updatePlaylistPanel() calls from running
     * consecutively during large DOM updates.
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
     * Main YouTube SPA navigation event.
     */
    document.addEventListener('yt-navigate-finish', () => {
        scheduleUpdate();
    });

    /**
     * YouTube may create ytd-playlist-panel-renderer
     * after navigation has already finished.
     *
     * Observe DOM changes as a fallback.
     */
    const pageObserver = new MutationObserver(() => {
        /*
         * Running the update on regular pages is safe:
         * the script does not modify the hidden state
         * of regular playlist panels.
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