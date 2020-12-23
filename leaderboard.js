// Read Leaderboard and return top 10 + post new score to leaderboard

const express = require('express');
const router = express.Router();
const { check, validationResult, sanitize } = require('express-validator');
const { insert, select, update } = require('./db');
const xss = require('xss');


let score = 0;

/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */
function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }

    const field = req.body[fieldName];

    if (field) {
      req.body[fieldName] = xss(field);
    }

    next();
  };
}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const validationscore = [
  check('highestscore').isNumeric(),
];

const sanitizationscore = [
  sanitizeXss('highestscore'),
  sanitize('highestscore')
    .trim().blacklist(' ').escape()
    .toInt(),
];

const validationname = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
];

const sanitizationname = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),
];

async function getname(req, res){
 	const errors = validationResult(req);
 	console.log(errors);
 	if(!errors.isEmpty()) {
 		res.end();
 	} else {
 	  	try {
 	   		score = req.body.highestscore;
 	  	} catch (e) {
 	   		console.log('Score ekki rétt', e);
 	  	}
 	  	res.end();
 	}
}

async function name(req, res){
	res.render('name', { title: 'Vista', nafn: '' });
}

async function savescore(req, res){
  const { body: { name } = {} } = req;
  const errors = validationResult(req);
  console.log(errors);

  if(!errors.isEmpty()) {
    const errorMessages = errors.array();
    res.render('error', { title: 'Villa' });
  } else {
    try {
      if(score > 1){
        console.log(name + " scored " + score);
        await update(name, score);
        score = 0;
      }
    } catch (e) {
      console.log('Gat ekki vistað score', e);
    }
    return res.redirect('/leaderboard');
  }
}

async function showleaderboard(req, res){
	let data;
	await select().then((top) => {
		data = top.rows;
    for(let i = 0; i < data.length; i++){
      data[i].place = (i + 1);
    }
	});
	res.render('leaderboard', {title: 'Leaderboard', data});
}

router.post('/endgame', validationscore, sanitizationscore, getname);
router.get('/getname', name);
router.get('/leaderboard', showleaderboard);
router.post('/savescore', validationname, sanitizationname, savescore);

module.exports = router;