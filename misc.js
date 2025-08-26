document.querySelector(".music-player-2").addEventListener("click", () => {
  document
    .querySelector(".music-player-2>div:nth-child(3)")
    .classList.toggle("expanded");
});

// ---------- Playlist & double-click handling ----------
const audio = document.querySelector("audio");
let currentTrack = 1;
const totalTracks = 14;
const DOUBLE_CLICK_MS = 500;

// Choose skip behavior:
// "playRequested" = skip if playback was playing at window start OR a play() was requested during the window OR playback is playing at second click.
// "windowStartOnly" = skip ONLY if playback was already playing at the start of the first click (previous snapshot behavior).
const skipMode = "playRequested"; // change to "windowStartOnly" if you prefer that behavior

function loadTrack(n) {
  audio.src = `audio/${n}.mp3`;
  audio.load();
}
loadTrack(currentTrack);

function nextTrack() {
  currentTrack = (currentTrack % totalTracks) + 1;
  loadTrack(currentTrack);
  // try to play immediately
  audio.play().catch(() => {});
}

// auto-advance on end
audio.addEventListener("ended", nextTrack);

// visual helper (keeps your .expanded UI in sync with actual playback)
function updateVisual(isPlaying) {
  const sel1 = document.querySelector(".music-player>div:nth-child(3)");
  const sel2 = document.querySelector(".music-player-2>div:nth-child(3)");
  if (isPlaying) {
    sel1?.classList.add("expanded");
    sel2?.classList.add("expanded");
  } else {
    sel1?.classList.remove("expanded");
    sel2?.classList.remove("expanded");
  }
}
// keep visuals updated when playback state changes
audio.addEventListener("play", () => updateVisual(true));
audio.addEventListener("pause", () => updateVisual(false));

// double-click/windowsnapshot flags
let lastClickTime = 0;
let windowStartWasPlaying = false;      // whether audio.paused was false at the *first* click
let playRequestedDuringWindow = false;  // whether we called play() during the window

function handlePlayerClick() {
  const now = Date.now();
  const since = now - lastClickTime;

  // second click inside window -> decide skip or pause based on mode & flags
  if (since < DOUBLE_CLICK_MS && lastClickTime !== 0) {
    const currentlyPlaying = !audio.paused; // current real state (may lag early, but we also use flags)
    const shouldSkip = (skipMode === "playRequested")
      ? (windowStartWasPlaying || playRequestedDuringWindow || currentlyPlaying)
      : windowStartWasPlaying; // "windowStartOnly" mode

    if (shouldSkip) {
      nextTrack();
    } else {
      // ensure it stays paused (user double-clicked but we decided not to skip)
      audio.pause();
      updateVisual(false);
    }

    // reset window
    lastClickTime = 0;
    windowStartWasPlaying = false;
    playRequestedDuringWindow = false;
    return;
  }

  // first click of a possible double-click window: snapshot & perform toggle
  windowStartWasPlaying = !audio.paused; // snapshot BEFORE toggling
  playRequestedDuringWindow = false;
  lastClickTime = now;

  // toggle play/pause intention
  if (audio.paused) {
    // request play and mark that we requested it (in case second click arrives before 'playing' event)
    const p = audio.play();
    playRequestedDuringWindow = true;
    // if the play promise rejects (autoplay blocked), clear the flag
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        playRequestedDuringWindow = false;
      });
      // when the play actually starts, the 'play' event will fire and visuals get updated
    }
  } else {
    audio.pause();
    // pause is synchronous, visuals updated by 'pause' listener or call updateVisual(false)
    updateVisual(false);
  }
}

// attach to both players (removes any previously attached playlist click logic — keep your UI toggles separated or integrate)
const players = document.querySelectorAll(".music-player, .music-player-2");
players.forEach(p => {
  p.removeEventListener("click", handlePlayerClick); // safe no-op if not attached
  p.addEventListener("click", handlePlayerClick);
});