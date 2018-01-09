let util = {};

util.findDuplicateds = function (tracksArray) {
    let tracks = tracksArray;
    let notDuplicateds = [];
    let duplicateds = [];
    while(tracks.length > 0){
        let track = tracks[0];
        let repeteds = tracks.filter((item) => {
          return (item.name === track.name && item.artists.join() === track.artists.join());
        });
        tracks = tracks.filter((item) => {
          return  !(item.name === track.name && item.artists.join() === track.artists.join());
        });
        duplicateds.push({'name':track.name,'artists':track.artists,'tracks':repeteds});
    }
    return duplicateds;
};

module.exports = util;
