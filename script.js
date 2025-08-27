document.querySelector(".music-player").addEventListener("click", () => {
  document
    .querySelector(".music-player>div:nth-child(3)")
    .classList.toggle("expanded");
    document
    .querySelector(".music-player-2>div:nth-child(3)")
    .classList.toggle("expanded");
});

document.querySelector(".music-player-2").addEventListener("click", () => {
  document
    .querySelector(".music-player>div:nth-child(3)")
    .classList.toggle("expanded");
  document
    .querySelector(".music-player-2>div:nth-child(3)")
    .classList.toggle("expanded");
});

let thoughtsOpen = false;
let aboutOpen = false;

let appeared = false;

function playerReappear() {
  if(thoughtsOpen||aboutOpen){
    if(appeared){
    return

    }
  }
    const player = document.querySelector(".music-player");
  const player2 = document.querySelector(".music-player-2");
  if(!appeared){
  player.style.opacity = "0";
  player2.style.opacity = "1";
  appeared = true
  }
else{
  player.style.opacity = "1";
  player2.style.opacity = "0";
  appeared = false
}

}

document.querySelector(".about-btn").addEventListener("click", () => {
  if(!aboutOpen){
    aboutOpen = true;
  }
  else{
    aboutOpen = false;
  }
  thoughtsOpen = false;
  playerReappear();
  const elements = document.querySelectorAll(".about-part>*");

  let i = 0;


  const int = setInterval(() => {
    elements[i].classList.toggle("visible");
    i++;
    if (i == elements.length) {
      clearInterval(int);
    }
  }, 50);

  const elements2 = document.querySelectorAll(".thoughts-part>*");

  let i2 = 0;

  const int2 = setInterval(() => {
    elements2[i2].classList.remove("visible");
    i2++;
    if (i2 == elements2.length) {
      clearInterval(int2);
    }
  }, 50);
});

document.querySelector(".thoughts-btn").addEventListener("click", () => {
if(!thoughtsOpen){
    thoughtsOpen = true;
  }
  else{
    thoughtsOpen = false;
  }
  aboutOpen = false;
  const elements = document.querySelectorAll(".thoughts-part>*");

  let i = 0;

  const int = setInterval(() => {
    elements[i].classList.toggle("visible");
    i++;
    if (i == elements.length) {
      clearInterval(int);
    }
  }, 50);

  playerReappear();

  const elements2 = document.querySelectorAll(".about-part>*");

  let i2 = 0;

  const int2 = setInterval(() => {
    elements2[i2].classList.remove("visible");
    i2++;
    if (i2 == elements2.length) {
      clearInterval(int2);
    }
  }, 50);
});

let open = false;

document.querySelector(".see-more").addEventListener("click", () => {
  if (!open) {
    open = true;
    document.querySelector(".see-more").innerHTML = "See Less<<<";
  } else {
    open = false;
    document.querySelector(".see-more").innerHTML = "See More>>>";
  }
  const elements = document.querySelectorAll(".see-more-content>*");

  let i = 0;

  const int = setInterval(() => {
    elements[i].classList.toggle("visible");
    i++;
    if (i == elements.length) {
      clearInterval(int);
    }
  }, 50);
});

// Close about/thoughts when clicking anywhere else
document.addEventListener("click", (e) => {
  const about = document.querySelector(".about-part");
  const thoughts = document.querySelector(".thoughts-part");
  const aboutBtn = document.querySelector(".about-btn");
  const thoughtsBtn = document.querySelector(".thoughts-btn");

  // check if click happened inside about, thoughts, or buttons → do nothing
  if (
    about.contains(e.target) ||
    thoughts.contains(e.target) ||
    aboutBtn.contains(e.target) ||
    thoughtsBtn.contains(e.target)
  ) {
    return;
  }

  // otherwise close them
  aboutOpen = false;
  thoughtsOpen = false;
  appeared = true;

  about.querySelectorAll("*").forEach(el => el.classList.remove("visible"));
  thoughts.querySelectorAll("*").forEach(el => el.classList.remove("visible"));

  playerReappear();

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


const changingText = document.querySelector(".changing-text");

// Words to cycle through
const words = ["Human", "Son", "Founder", "Brother", "Technologist"];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;
let typingSpeed = 200;   // ms per character
let deletingSpeed = 100;  // ms per character when deleting
let delayBetweenWords = 3000; // pause before deleting

function typeEffect() {
  const currentWord = words[wordIndex];

  if (!deleting) {
    // typing forward
    changingText.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentWord.length) {
      // pause at end of word
      deleting = true;
      setTimeout(typeEffect, delayBetweenWords);
      return;
    }
  } else {
    // deleting backwards
    changingText.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }
  }

  setTimeout(typeEffect, deleting ? deletingSpeed : typingSpeed);
}

// Start the typing effect
typeEffect();
