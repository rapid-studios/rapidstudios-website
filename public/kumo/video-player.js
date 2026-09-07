const players = new WeakMap();
const MUTED_MESSAGE = 'Tap Play with sound to hear the full pitch.';

/** Initialize one pitch player. The native video controls remain available. */
export function initVideoPlayer(container) {
  if (players.has(container)) return players.get(container);
  const video = container.querySelector('video');
  const button = container.querySelector('[data-enable-sound]');
  const status = container.querySelector('[data-video-status]');
  const endcard = container.querySelector('[data-booking-endcard]');
  const replayButton = endcard?.querySelector('[data-replay-video]');
  if (!video || !button || !status) return null;

  let generation = 0;
  let destroyed = false;
  let playbackEnded = false;

  button.type = 'button';
  if (replayButton) replayButton.type = 'button';
  if (endcard) endcard.hidden = true;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  video.playsInline = true;
  video.loop = false;
  // This initializer owns the single automatic attempt and its muted fallback.
  // Leaving native autoplay enabled could restart a video the viewer paused.
  video.autoplay = false;

  function show(message, { hidden = false, replay = false } = {}) {
    if (destroyed) return;
    button.hidden = hidden;
    button.textContent = replay ? 'Watch again with sound' : 'Play with sound';
    status.textContent = message;
  }

  function hideEndcard() {
    playbackEnded = false;
    if (endcard) endcard.hidden = true;
  }

  function showEnded() {
    if (endcard && playbackEnded) {
      endcard.hidden = false;
      show('Choose a time with Travis to talk through the concept.', { hidden: true });
    } else {
      show('Watch the pitch again with sound.', { replay: true });
    }
  }

  function showPlaybackState() {
    if (!video.ended || video.error) hideEndcard();
    if (video.error) {
      show('The video could not be loaded. Please reload the page or try again.');
    } else if (video.ended) {
      showEnded();
    } else if (video.paused) {
      show('Paused. Use the video controls to continue.');
    } else if (video.muted || video.volume === 0) {
      show(MUTED_MESSAGE);
    } else {
      show('Playing with sound.', { hidden: true });
    }
  }

  function showFailure(error, manual) {
    if (video.error || error?.name === 'NotSupportedError') {
      show('The video could not be loaded. Please reload the page or try again.');
    } else if (error?.name === 'NotAllowedError') {
      show(manual ? 'Playback was blocked. Try the video’s play control.' : 'Autoplay is blocked. Select Play with sound to start.');
    } else {
      show('Playback was interrupted. Select Play with sound to try again.');
    }
  }

  async function start(manual) {
    const attempt = ++generation;
    const current = () => !destroyed && generation === attempt;
    hideEndcard();
    try {
      if (manual && video.error) video.load();
      video.muted = false;
      if (video.volume === 0) video.volume = 1;
      if (manual) video.currentTime = 0;
      show('Starting the video…');
      // Keep this call before the first await so a tap retains user activation.
      await video.play();
      if (!current()) return false;
      showPlaybackState();
      return !video.paused;
    } catch (error) {
      if (!current()) return false;
      if (manual || error?.name !== 'NotAllowedError' || video.error) {
        showFailure(error, manual);
        return false;
      }
      try {
        video.muted = true;
        show(MUTED_MESSAGE);
        await video.play();
        if (!current()) return false;
        showPlaybackState();
        return !video.paused;
      } catch (fallbackError) {
        if (current()) showFailure(fallbackError, false);
        return false;
      }
    }
  }

  function onPause() {
    ++generation; // A manual pause also cancels any pending autoplay fallback.
    showPlaybackState();
  }

  function onEnded() {
    ++generation;
    playbackEnded = true;
    showEnded();
  }

  function onPlaying() {
    hideEndcard();
    showPlaybackState();
  }

  function onSeek() {
    if (!video.ended) {
      hideEndcard();
      showPlaybackState();
    }
  }

  function onError() {
    ++generation;
    hideEndcard();
    show('The video could not be loaded. Please reload the page or try again.');
  }

  const playWithSound = () => destroyed ? Promise.resolve(false) : start(true);
  const onClick = () => { void playWithSound(); };
  const listeners = [
    [button, 'click', onClick],
    [video, 'playing', onPlaying],
    [video, 'volumechange', showPlaybackState],
    [video, 'pause', onPause],
    [video, 'ended', onEnded],
    [video, 'error', onError],
    [video, 'seeking', onSeek],
    [video, 'seeked', onSeek],
  ];
  if (replayButton) listeners.push([replayButton, 'click', onClick]);
  for (const [target, event, listener] of listeners) target.addEventListener(event, listener);

  const controller = {
    ready: null,
    playWithSound,
    destroy() {
      destroyed = true;
      ++generation;
      for (const [target, event, listener] of listeners) target.removeEventListener(event, listener);
      players.delete(container);
    },
  };
  players.set(container, controller);
  controller.ready = start(false);
  return controller;
}

export function initVideoPlayers(root = globalThis.document) {
  return Array.from(root?.querySelectorAll('[data-video-player]') || [], initVideoPlayer).filter(Boolean);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initVideoPlayers(document), { once: true });
  } else {
    initVideoPlayers(document);
  }
}
