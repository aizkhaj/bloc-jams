var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    
    setVolume(currentVolume);
};

var setVolume = function(volume) {
    if(currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};
    
var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) {
    var template = 
     '<tr class="album-view-song-item">'
    +'  <td class="song-item-number" data-song-number="'+ songNumber +'">' + songNumber + '</td>'
    +'  <td class="song-item-title">' + songName + '</td>'
    +'  <td class="song-item-duration">' + songLength + '</td>'
    +'</tr>'
    ;

    var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            var currentlyPlayingCell = getSongNumberCell(songNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        } 
        
        if (currentlyPlayingSongNumber !== songNumber) {
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
            
        /*
            $(this).html(playButtonTemplate);
            currentlyPlayingSongNumber = null;
            currentSongFromAlbum = null;
            $('.main-controls .play-pause').html(playerBarPlayButton);
        */
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number'); 
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
   /*    refactored from: 
        songListContainer.addEventListener('mouseover', function(event) {
       if (event.target.parentElement.className === 'album-view-song-item') {
           var songItem = getSongItem(event.target);
           
           if (songItem.getAttribute('data-song-number') !== currentlyPlayingSong) {
               songItem.innerHTML = playButtonTemplate;
            }
       }
               
        note that getSongItem basically looks for any item and redirect it to .song-item-number. we replace that with songNumberCell where it just finds .song-item-number within the event.target.
        
        We then create var songNumber to find the attribute data-song-number within the song-item-number element...referring to this to manipulate the song-item-number's html while keeping data-song-number constant.
       
    */
    };
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number'); 
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        /* refactored from:
        var songItem = getSongItem(event.target); 
            var songItemNumber = songItem.getAttribute('data-song-number');
            
            if (songItemNumber !== currentlyPlayingSong) {
                songItem.innerHTML = songItemNumber;
            } 
        */
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function() {
    /*
- Know what the previous song is. This includes the situation in which the next song is the first song, following the final song in the album (that is, it should "wrap" around).
- Use the trackIndex() helper function to get the index of the current song and then increment the value of the index.
- Set a new current song to currentSongFromAlbum.
- Update the player bar to show the new song.
- Update the HTML of the previous song's .song-item-number element with a number.
- Update the HTML of the new song's .song-item-number element with a pause button.
*/
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    //Set a new current song
    setSong(currentSongIndex + 1);
    
    currentSoundFile.play()
    
    //Update player bar info
    //You want to show new song. You will change text of a few elements
    updatePlayerBarSong();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    //this will allow us to reset the pause or playbutton templates to the song's number. Otherwise it would just show us the pause button everytime we change the song.
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2; 
    }
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    setSong(currentSongIndex + 1);
    
    currentSoundFile.play();
    //Update player bar info
    //You want to show new song. You will change text of a few elements
    updatePlayerBarSong();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    //this will allow us to reset the pause or playbutton templates to the song's number. Otherwise it would just show us the pause button everytime we change the song.
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

 $(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
});