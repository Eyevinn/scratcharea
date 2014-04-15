var FeedParser = require('feedparser');
var http = require('http');
var currentRequest = null;

var url = 'http://nrkbeta.no/torrent/monsen/nordkalotten365.rss';

var Nrk = Backbone.Collection.extend({
    apiUrl: url,
    model: App.Model.Movie,
    
    initialize: function(models, options) {
        this.options = options;
        Nrk.__super__.initialize.apply(this, arguments);
    },
    
    fetch: function() {
        var collection = this;
                
        http.get(this.apiUrl, function (res) {

			var feedMeta;
			var indx = 10;
			var movies = [];
			memory = {};
			
			res.pipe(new FeedParser({}))
				.on('error', function(error) {
					console.log("Error parsing feed");
				})
				.on('meta', function(meta) {
					feedMeta = meta;
				})
				.on('readable', function() {
					var stream = this, item;
					while (item = stream.read()) {
						var torrents = {};
						torrents['720p'] = item.guid;
						
						var movieModel = {
							imdb:	''+indx,
							title:	item.title,
							year:	'2009',
							runtime: 107,
							synopsis: item.description,
							voteAverage: 5.0,
			
							image:		item.image.url,
							bigImage:   item.image.url,
							backdrop:   item.image.url,
			
							quality:    '720p',
							torrent:    item.guid,
							torrents:   torrents,
			
							videos:     {},
							subtitles:  {},
							seeders:    500,
							leechers:   200,
			
							hasMetadata: true,
							hasSubtitle: true
						};
						indx++;
						var stored = memory[movieModel.imdb];
						// Create it on memory map if it doesn't exist.
						if (typeof stored === 'undefined') {
							stored = memory[movieModel.imdb] = movieModel;
						}

						// Push it if not currently on array.
						if (movies.indexOf(stored) === -1) {
							movies.push(stored);
						}					
					}
				})
				.on('end', function() {
					collection.set(movies);
					console.log(movies);
					collection.trigger('loaded');				
				});	
		})
    }
});


App.Scrapers.Nrk = Nrk;