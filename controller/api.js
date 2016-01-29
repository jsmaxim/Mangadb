'use strict';

module.exports = function(app, router, Manga) {
  // middleware to use for all requests
  router.use(function(req, res, next) {
    // do logging
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var info = JSON.stringify({
      'ip-address': ip,
      'language': req.headers["accept-language"].split(',')[0],
      'software': req.headers['user-agent'].split(') ')[0].split(' (')[1]
    });
    console.log('Something is happening from ' + info);
    next(); // make sure we go to the next routes and don't stop here
  });

  // test route to make sure everything is working (accessed at GET https://mangadb-r282.herokuapp.com/api)
  router.get('/', function(req, res) {
    res.json({
      message: 'Welcome, check the API usage at https://mangadb-r282.herokuapp.com, there is nothing to do here.'
    });
  });
  app.route('/')
    .get(function(req, res) {
      res.render('index');
    });

  // FIND MANGA BY TITLE
  // on routes that end in /mangas/:manga_title
  // ----------------------------------------------------
  router.route('/mangas/:manga_title')

  // Get the manga with that title (accessed at GET https://mangadb-r282.herokuapp.com/api/mangas/:manga_title)
  .get(function(req, res) {
    Manga.findOne({
      title: req.params.manga_title
    }, function(err, manga) {
      if (err) {
        res.status(404).json({
          error: req.params.manga_title + ' not found.'
        });
        console.log('Manga not found.');
      } else {
        console.log(req.params.manga_title + ' found!');
        res.json(manga);
      }
    });
  })

  // UPDATE MANGA BY TITLE
  // Update the manga with this title (accessed at PUT https://mangadb-r282.herokuapp.com/api/mangas/:manga_title)
  .put(function(req, res) {
      // use our manga model to find the manga we want
      Manga.findOne({
        title: req.params.manga_title
      }, function(err, manga) {
        if (err) {
          res.status(404).json({
            error: req.params.manga_title + ' not found.'
          });
          console.log('Manga not found.');
        } else {
          manga.title = req.body.title; // update the mangas info
          manga.author = req.body.author || manga.author;
          manga.url = req.body.url || manga.url;
          manga.userStatus = req.body.userStatus || manga.userStatus;
          manga.type = req.body.type || manga.type;
          manga.categories = req.body.categories || manga.categories;
          manga.chapter = req.body.chapter || manga.chapter;
          manga.seriesStatus = req.body.seriesStatus || manga.seriesStatus;
          manga.plot = req.body.plot || manga.plot;
          manga.altName = req.body.altName || manga.altName;
          // update the manga
          var msg = req.body.title + ' manga updated.';
          var errMsg = 'All fields are required for creating new manga, the title is required for updating though..';
          save(manga, res, msg, errMsg);
        }
      });
    })

  // DELETE MANGA BY TITLE
  // Delete the manga with this title (accessed at DELETE https://mangadb-r282.herokuapp.com/api/mangas/:manga_title)
  .delete(function(req, res) {
    Manga.remove({
      title: req.params.manga_title
    }, function(err, manga) {
      if (err) {
        res.status(404).json({
          error: 'Could not find manga'
        });
        console.log('Manga not found');
      } else {
        res.json({
          message: 'Successfully deleted'
        });
      }
    });
  });

  // CREATE NEW MANGA
  router.route('/mangas')

  // Create a manga (accessed at POST https://mangadb-r282.herokuapp.com/api/mangas)
  .post(function(req, res) {

    var manga = new Manga(); // create a new instance of the Manga model
    manga.title = req.body.title; // set the manga name (comes from the request)
    manga.author = req.body.author;
    manga.url = req.body.url;
    manga.userStatus = req.body.userStatus;
    manga.type = req.body.type;
    manga.categories = req.body.categories;
    manga.chapter = req.body.chapter;
    manga.seriesStatus = req.body.seriesStatus;
    manga.plot = req.body.plot;
    manga.altName = req.body.altName;
    // Call function to save manga
    var msg = req.body.title + ' manga created.';
    var errMsg = 'A manga already exist with duplicated name or url.';
    save(manga, res, msg, errMsg);

  })

  // FIND ALL MANGAS.
  // Get all the mangas (accessed at GET https://mangadb-r282.herokuapp.com/api/mangas)
  .get(function(req, res) {
    Manga.find(function(err, mangas) {
      if (err) {
        res.status(404).json({
          error: 'No mangas found.'
        });
        console.log('No mangas found.');
      } else {
        console.log('Mangas found!');
        res.json(mangas);
      }
    });
  });

  function save(manga, res, msg, errMsg) {
    // save the manga and check for errors
    manga.save(function(err) {
      if (err) {
        res.status(409).json({
          error: errMsg
        });
        console.log('Error creating manga.');
      } else {
        console.log('Manga Created!');
        res.json({
          message: msg
        });
      }
    });
  }

};