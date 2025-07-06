import { dataSong } from "./data/songs.js";

// FUNCTION CONSTRUCTOR
function MusicPlay() {
  this._dataSong = dataSong;
  this._showSong = document.querySelector(".music-player__show");
  this._playList = document.querySelector("#playlist");
  this._currentIndexSong = 0;
  this._isShuffle = false;
  this._isLoopSong = false;

  this.renderMusicPlay();
  this.renderPlaylist();
  this._initEvent();
}

// METHOD RENDER
MusicPlay.prototype.renderPlaylist = function () {
  if (!this._playList) {
    console.warn("Không tìm thấy phần tử #playlist!");
    return;
  }

  let htmlPlayList = "";

  // Duyệt mảng dataSong
  this._dataSong.forEach((song, index) => {
    const template = `<div class="playlist-item ${
      this._currentIndexSong === index ? "active" : ""
    }" data-index="${index}">
            <div class="playlist-item-thumbnail">
              <img src="${song.thumbnail}" alt=""/>
            </div>
            <div class="playlist-item-info">
              <span class="playlist-song-title">${song.title}</span>
              <span class="playlist-song-artist">${song.singer}</span>
            </div>
            <span class="playlist-duration">${song.duration}</span>
          </div>`;
    htmlPlayList += template;
  });

  this._playList.innerHTML = htmlPlayList;
};

// METHOD RENDER MUSIC PLAYER
MusicPlay.prototype.renderMusicPlay = function () {
  const template = `<div class="player-header">
        <h1>Music Player</h1>
        <div class="player-controls-top">
          <button class="btn-shuffle" id="shuffleBtn">
            <i class="fas fa-random"></i>
          </button>
          <button class="btn-repeat" id="repeatBtn">
            <i class="fas fa-redo"></i>
          </button>
        </div>
      </div>
      <div class="main-content">
        <div class="album-section">
          <div class="album-art">
            <img
              src="${this._dataSong[this._currentIndexSong].thumbnail}"
              alt=""
              id="albumArt"
            />
            <div class="vinyl-effect"></div>
          </div>
        </div>
        <div class="controls-section">
          <div class="song-info">
            <h2 class="song-title" id="songTitle">${
              this._dataSong[this._currentIndexSong].title
            }</h2>
            <p class="song-artist" id="songArtist">${
              this._dataSong[this._currentIndexSong].singer
            }</p>
          </div>
          <div class="progress-container">
            <div class="time-display">
              <span class="current-time" id="currentTime">00:00</span>
              <span class="total-time" id="totalTime">${
                this._dataSong[this._currentIndexSong].duration
              }</span>
            </div>
            <div class="progress-bar">
              <div class="progress-track" id="progressTrack">
                <div class="progress-fill" id="progressFill"></div>
                <div class="progress-handle" id="progressHandle"></div>
              </div>
            </div>
          </div>
          <div class="main-controls">
            <div class="main-controls__buttons">
              <button class="btn-prev" id="prevBtn">
                <i class="fas fa-step-backward"></i>
              </button>
              <button class="btn-play-pause" id="playPauseBtn">
                <i class="fas fa-play"></i>
              </button>
              <button class="btn-next" id="nextBtn">
                <i class="fas fa-step-forward"></i>
              </button>
            </div>
            <button class="btn-volume" id="volumeBtn">
              <i class="fas fa-volume-up" id="volumeIcon"></i>
            </button>
          </div>
        </div>
      </div>
      <audio id="audioPlayer" preload="metadata">
        <source src="${
          this._dataSong[this._currentIndexSong].srcSong
        }" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>`;

  this._showSong.innerHTML = template;
};

// METHOD KÍCH HOẠT PLAY
MusicPlay.prototype._onPlay = function () {
  this._audio.play();
  this._btnPlayPause.innerHTML = `<i class="fas fa-pause"></i>`;
  this._imgShow.classList.add("playing");
};

// METHOD KÍCH HOẠT PAUSE
MusicPlay.prototype._onPause = function () {
  this._audio.pause();
  this._btnPlayPause.innerHTML = `<i class="fas fa-play"></i>`;
  this._imgShow.classList.remove("playing");
};

// METHOD CHANGE SONG
MusicPlay.prototype._changeSong = function (direction) {
  const length = this._dataSong.length;
  this._currentIndexSong =
    (this._currentIndexSong + direction + length) % length;

  this.renderMusicPlay();
  this.renderPlaylist();
  this._initEvent();
  this._onPlay();
};

// METHOD PLAY SONG BY INDEX
MusicPlay.prototype.goToSongByIndex = function (index) {
  if (
    typeof index === "number" &&
    index >= 0 &&
    index < this._dataSong.length
  ) {
    this._currentIndexSong = index;
    this.renderMusicPlay();
    this.renderPlaylist();
    this._initEvent();
    this._onPlay();
  } else {
    console.warn("Index không hợp lệ:", index);
  }
};

// METHOD GET RANDOM INDEX
MusicPlay.prototype._getRandomIndex = function () {
  const length = this._dataSong.length;
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * length);
  } while (newIndex === this._currentIndexSong);
  return newIndex;
};

// METHOD GET CURRENT TIME
MusicPlay.prototype._getCurrentTime = function () {
  let currentTimeSecond = Math.floor(this._audio.currentTime);
  let minutes = Math.floor(currentTimeSecond / 60);
  let seconds = currentTimeSecond % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

// METHOD SHOW CURRENT TIME
MusicPlay.prototype._showCurrentTime = function () {
  clearInterval(this._updateTimeInterval);
  this._updateTimeInterval = setInterval(() => {
    let currentTime = this._getCurrentTime();
    this._currentTime.textContent = currentTime;
  }, 1000);
};

// METHOD UPDATE PERCENT PROGRESS
MusicPlay.prototype._updatePercentProgress = function (percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  this._progressFill.style.width = `${clamped}%`;
  this._progressHandle.style.left = `${clamped}%`;
};

// METHOD PLAY
MusicPlay.prototype._initEvent = function () {
  // Gán lại các phần tử sau khi render
  this._playListItems = document.querySelectorAll(".playlist-item");
  this._btnPlayPause = document.querySelector("#playPauseBtn");
  this._btnNextSong = document.querySelector("#nextBtn");
  this._btnPrevSong = document.querySelector("#prevBtn");
  this._audio = document.querySelector("#audioPlayer");
  this._imgShow = document.querySelector(".album-art");
  this._btnShuffle = document.querySelector("#shuffleBtn");
  this._btnLoopSong = document.querySelector("#repeatBtn");
  this._btnVolume = document.querySelector("#volumeBtn");
  this._currentTime = document.querySelector("#currentTime");
  this._progressTrack = document.querySelector("#progressTrack");
  this._progressFill = document.querySelector("#progressFill");
  this._progressHandle = document.querySelector("#progressHandle");

  // Xử Lý Click chọn bài hát
  this._playListItems.forEach((songItem) => {
    songItem.onclick = () => {
      const indexTarget = parseInt(songItem.dataset.index);
      this.goToSongByIndex(indexTarget);
      this._showCurrentTime();
    };
  });

  // Nút Play/Pause
  this._btnPlayPause.onclick = () => {
    const totalTime = document.querySelector("#totalTime");
    if (this._audio.paused) {
      this._onPlay();

      // Hiển thị time
      this._showCurrentTime();
    } else {
      this._onPause();
      clearInterval(this._updateTimeInterval);
    }
  };

  // Xử lý khi phát xong bài hát hiện tại
  this._audio.onended = () => {
    if (this._isLoopSong) {
      this._audio.currentTime = 0;
      this._audio.play();
    } else {
      this._btnNextSong.click();
    }
  };

  // Xử lý Progress Hiển thị theo Phần Trăm Tiến trình
  this._audio.ontimeupdate = () => {
    const percent = (this._audio.currentTime / this._audio.duration) * 100;
    this._updatePercentProgress(percent);
  };

  // Xử lý tua
  this._progressTrack.onclick = (e) => {
    const rect = this._progressTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const seekTime = percent * this._audio.duration;
    this._audio.currentTime = seekTime;
  };

  // Xử lý Muted
  this._btnVolume.onclick = () => {
    this._audio.muted = !this._audio.muted;

    const volumeIcon = document.querySelector("#volumeIcon");
    if (this._audio.muted) {
      volumeIcon.className = "fas fa-volume-mute";
    } else {
      volumeIcon.className = "fas fa-volume-up";
    }
  };

  // Nút Next
  this._btnNextSong.onclick = () => {
    if (this._isLoopSong) {
      this._audio.currentTime = 0;
      this._audio.play();
      return;
    } else {
      if (this._isShuffle) {
        const newIndex = this._getRandomIndex();
        this._changeSong(newIndex);
        this._showCurrentTime();
      } else {
        this._changeSong(1);
        this._showCurrentTime();
      }
    }
  };

  // Nút Prev
  this._btnPrevSong.onclick = () => {
    if (this._isLoopSong) {
      this._audio.currentTime = 0;
      this._audio.play();
      return;
    } else {
      if (this._isShuffle) {
        const newIndex = this._getRandomIndex();
        this._changeSong(newIndex);
        this._showCurrentTime();
      } else {
        this._changeSong(-1);
        this._showCurrentTime();
      }
    }
  };

  // Nút Trộn Bài
  // Giữ trạng thái CSS của nút Shuffle sau khi render lại
  this._btnShuffle.classList.toggle("active", this._isShuffle);
  this._btnShuffle.onclick = () => {
    this._isShuffle = !this._isShuffle;
    this._btnShuffle.classList.toggle("active", this._isShuffle);
  };

  // Lặp lại bài hát hiện tại
  this._btnLoopSong.classList.toggle("active", this._isLoopSong);
  this._btnLoopSong.onclick = () => {
    this._isLoopSong = !this._isLoopSong;
    this._btnLoopSong.classList.toggle("active", this._isLoopSong);
  };
};

// Use
document.addEventListener("DOMContentLoaded", () => {
  const musicApp = new MusicPlay();
});
