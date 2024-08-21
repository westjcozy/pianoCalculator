const display = document.getElementById("display");

function updateDisplayFontSize() {
  const maxFontSize = 5;
  const minFontSize = 1;
  const currentLength = display.value.length;

  if (currentLength < 10) {
    display.style.fontSize = `${maxFontSize}rem`;
  } else {
    const newFontSize = Math.max(
      minFontSize,
      maxFontSize - (currentLength - 10) * 0.2
    );
    display.style.fontSize = `${newFontSize}rem`;
  }
  console.log(`Current font size: ${display.style.fontSize}`);
}

function appendToDisplay(input) {
  display.value += input;
  updateDisplayFontSize();
}

function clearDisplay() {
  display.value = display.value.slice(0, -1);
  updateDisplayFontSize();
}

function clearAllDisplay() {
  display.value = "";
  updateDisplayFontSize();
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch (error) {
    display.value = "Error";
  }
  updateDisplayFontSize();
}

const WHITE_KEYS = ["m", "v", "b", "n", "z", "x", "c"];
const BLACK_KEYS = ["g", "h", "j", "s", "d"];

const recordButton = document.querySelector(".record-button");
const playButton = document.querySelector(".play-button"); // 수정된 부분
const saveButton = document.querySelector(".save-button");
const songLink = document.querySelector(".song-link");
const keys = document.querySelectorAll(".key");
const whiteKeys = document.querySelectorAll(".key.white");
const blackKeys = document.querySelectorAll(".key.black");

const keyMap = [...keys].reduce((map, key) => {
  map[key.dataset.note] = key;
  return map;
}, {});

let recordingStartTime;
let songNotes = currentSong && currentSong.notes;

keys.forEach((key) => {
  key.addEventListener("click", () => playNote(key));
});

if (recordButton) {
  recordButton.addEventListener("click", toggleRecording);
}
if (saveButton) {
  saveButton.addEventListener("click", saveSong);
}
if (playButton) {
  // 추가된 부분
  playButton.addEventListener("click", playSong);
}

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  const whiteKeyIndex = WHITE_KEYS.indexOf(key);
  const blackKeyIndex = BLACK_KEYS.indexOf(key);

  console.log(`Key pressed: ${key}`);

  if (whiteKeyIndex > -1) {
    playNote(whiteKeys[whiteKeyIndex]);
  } else if (blackKeyIndex > -1) {
    playNote(blackKeys[blackKeyIndex]);
  }
});

function toggleRecording() {
  recordButton.classList.toggle("active");
  if (isRecording()) {
    startRecording();
  } else {
    stopRecording();
  }
}

function isRecording() {
  return recordButton != null && recordButton.classList.contains("active");
}

function startRecording() {
  recordingStartTime = Date.now();
  songNotes = [];
  playButton.classList.remove("show");
  saveButton.classList.remove("show");
}

function stopRecording() {
  playSong();
  playButton.classList.add("show");
  saveButton.classList.add("show");
}

function playSong() {
  if (songNotes.length === 0) return;
  songNotes.forEach((note) => {
    setTimeout(() => {
      playNote(keyMap[note.key]);
    }, note.startTime);
  });
}

function playNote(key) {
  if (isRecording()) recordNote(key.dataset.note);
  const noteAudio = document.getElementById(key.dataset.note);
  if (noteAudio) {
    noteAudio.currentTime = 0;
    noteAudio.play();
    key.classList.add("active");
    noteAudio.addEventListener("ended", () => {
      key.classList.remove("active");
    });
  } else {
    console.log("Can't find audio for note:", key.dataset.note);
  }
}

function recordNote(note) {
  songNotes.push({
    key: note,
    startTime: Date.now() - recordingStartTime,
  });
}

function saveSong() {
  axios.post("/songs", { songNotes: songNotes }).then((res) => {
    songLink.classList.add("show");
    songLink.href = `/songs/${res.data._id}`;
  });
}

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const key = e.key;

  if (key >= "0" && key <= "9") {
    appendToDisplay(key);
    const button = Array.from(keys).find(
      (btn) => btn.textContent.trim() === key
    );
    if (button) {
      button.classList.add("active");
    }
  } else if (key === "Backspace") {
    clearDisplay();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key;

  if (key >= "0" && key <= "9") {
    const button = Array.from(keys).find(
      (btn) => btn.textContent.trim() === key
    );
    if (button) {
      button.classList.remove("active");
    }
  }
});
