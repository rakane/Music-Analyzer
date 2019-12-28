const ready = () => {
  console.log('ready');
  let songs = tracks;
  console.log(songs);
  document.getElementById('mix-btn').addEventListener('click', function(e) {
    e.preventDefault();
    let cookie = document.cookie.split('=');
    document.getElementById('mix-btn').style.display = 'none';

    $.ajax({
      url: `/playlist/mix/${cookie[cookie.length - 1]}`,
      type: 'post',
      data: { songs: songs },
      success: (data, status) => {}
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
