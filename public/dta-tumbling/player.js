(() => {
  'use strict';
  const player = document.querySelector('[data-player]');
  if (!player) return;
  const video = player.querySelector('video');
  const sound = player.querySelector('[data-sound]');
  const endcard = player.querySelector('[data-endcard]');
  const replay = player.querySelector('[data-replay]');
  const status = document.querySelector('[data-status]');
  let userInteracted = false;
  function emit(name) {
    player.dispatchEvent(new CustomEvent(`pitch:${name}`, {
      bubbles: true, detail: { currentTime: video.currentTime, muted: video.muted }
    }));
  }
  function controls() {
    sound.hidden = !video.muted && !video.paused;
    sound.textContent = video.ended ? 'Replay with sound' : 'Play with sound';
  }
  async function startWithSound() {
    userInteracted = true;
    endcard.hidden = true;
    video.currentTime = 0;
    video.muted = false;
    try { await video.play(); status.textContent = 'Playing from the beginning with sound.'; }
    catch { status.textContent = 'Playback could not start. Use the video controls to try again.'; }
    controls();
  }
  sound.addEventListener('click', startWithSound);
  replay.addEventListener('click', startWithSound);
  video.addEventListener('pointerdown', () => { userInteracted = true; });
  video.addEventListener('keydown', () => { userInteracted = true; });
  video.addEventListener('play', () => {
    endcard.hidden = true;
    status.textContent = video.muted
      ? 'Playing muted. Play with sound restarts from the beginning.'
      : 'Playing with sound. Pause or adjust volume in the video controls.';
    controls();
    emit('play');
  });
  video.addEventListener('pause', () => {
    if (!video.ended) status.textContent = 'Paused. Use the video controls to continue, or Play with sound to restart.';
    controls();
    emit('pause');
  });
  video.addEventListener('volumechange', controls);
  video.addEventListener('ended', () => {
    endcard.hidden = false;
    sound.hidden = true;
    status.textContent = 'Presentation complete. Book a time with Travis or replay.';
    emit('ended');
  });
  video.addEventListener('seeking', () => { if (!video.ended) endcard.hidden = true; });
  video.addEventListener('error', () => {
    status.textContent = 'The presentation is unavailable. You can still explore the concept below.';
    sound.hidden = true;
    endcard.hidden = true;
    emit('error');
  });
  video.textTracks.addEventListener('change', () => emit('caption-change'));
  async function attemptAutoplay() {
    if (userInteracted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.muted = false;
    try { await video.play(); status.textContent = 'Playing with sound. Pause or adjust volume in the video controls.'; }
    catch {
      if (userInteracted) return;
      video.muted = true;
      try { await video.play(); status.textContent = 'Playing muted. Play with sound restarts from the beginning.'; }
      catch { status.textContent = 'Ready when you are. Play with sound starts the presentation.'; }
    }
    controls();
  }
  attemptAutoplay();
})();