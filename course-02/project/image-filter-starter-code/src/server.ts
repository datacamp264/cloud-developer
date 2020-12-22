import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFile} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get( "/filteredimage", async ( req, res ) => {
    // handle query parameter
    let { image_url } = req.query;
    if ( !image_url ) {
      return res.status(422)
          .send(`image_url is required as query parameter`);
    }
    //try download Picture and save it
    filterImageFromURL(image_url).then(
        (localPathToFilterdImageFile) => {

            // try sending the file as response with async error callback function
            res.sendFile(localPathToFilterdImageFile,async function (err) {
              if (err) {
                return res.status(502).send(`something went totally wrong`);
              } else {
                  //finally delete
                  await deleteLocalFile(localPathToFilterdImageFile)
              }
            });

        },
        (error) => {
            return res.status(502)
                .send(`internal server error within picture download`);
        });
  } );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
