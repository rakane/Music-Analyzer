const ready = () => {
  let songs = tracks;

  let displayedSongs = document.getElementsByClassName('song');
  for (let i = 0; i < displayedSongs.length; i++) {
    if (i === displayedSongs.length - 1) {
      displayedSongs[i].style.borderTop = '2px solid black';
      displayedSongs[i].style.borderBottom = '2px solid black';
    } else {
      displayedSongs[i].style.borderTop = '2px solid black';
    }
  }

  document.getElementById('mix-btn').addEventListener('click', function(e) {
    e.preventDefault();
    let cookie = document.cookie.split('=');
    document.getElementById('mix-btn').style.display = 'none';

    $.ajax({
      url: `/playlist/mix/${cookie[cookie.length - 1]}`,
      type: 'post',
      data: { songs: songs },
      success: (data, status) => {
        if (data.status === 'finished') {
          window.location = `/download/${cookie[cookie.length - 1]}`;
        }
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
