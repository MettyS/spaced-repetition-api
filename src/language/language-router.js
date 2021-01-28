const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json();

const languageRouter = express.Router()



languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )
      //console.log(language);

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
    const headInfo = await LanguageService.getWords(
      req.app.get('db'),
      req.language.id,
    )

    const { head, total_score } = headInfo
    res.json(LanguageService.serializeHead(head, total_score));
    res.status(200);
    /*
    {
      "nextWord": "Testnextword",
      "wordCorrectCount": 222,
      "wordIncorrectCount": 333,
      "totalScore": 999
    }
    */
  }
  catch(er) {
    console.log(er);
    next(er);
  }
  })

languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    try {
      const guess = req.body ? req.body.guess : undefined;

      if(!(!!guess)){
        return res.status(400).json({
          error: `Missing 'guess' in request body`,
        })
      }

      console.log('the guess is: ', guess);
      
      const resObj = await LanguageService.handleGuess(req.app.get('db'), req.language.id, guess)
      
        //console.log('RESINFO==========> ', resInfo)
      res.json(resObj);
      res.status(200);
      // res.send('yay')

    }
    catch (er) {
      console.log(er);
    }
  })

module.exports = languageRouter
