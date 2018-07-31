/*
Module      : fasta-stats.js  
Description : Read a FASTA file and compute statistics about its contents 
Copyright   : (c) BIONITIO_AUTHOR, BIONITIO_DATE
License     : BIONITIO_LICENSE
Maintainer  : BIONITIO_EMAIL
Portability : POSIX
*/

var fs = require('fs')
var through = require('through2')

var fasta = require('./fasta-parser')
/// /////////////////////////////////////////////////////////

exports.processFiles = processFiles

// Stream to process a fasta file for stats
function processFasta (file, minlen) {
  var bp = 0
  var n = 0
  var min, max
  var stream = through.obj(nextSeq, done)
  return stream

    // Filter, and collect stats on each sequence
  function nextSeq (data, enc, next) {
    var obj = JSON.parse(data.toString())
    var l = obj.seq.length
    if (l >= minlen) {
      min = n === 0 ? l : Math.min(l, min)
      max = n === 0 ? l : Math.max(l, max)
      n += 1
      bp += l
    }
    next()
  }

  function done () {
    if (n > 0) { this.push([n, bp, min, Math.floor(bp / n), max]) } else { this.push([n, bp, '-', '-', '-']) }
    this.push(null)
  }
}

function processFile (handle, file, minlen, logger, cb) {
    handle
      .on('error', function (err) {
        console.error('Error reading file', file)
        logger.error('Error reading file : %s', file)
        process.exit(1)
      })
      .pipe(fasta())
      .on('error', function (err, x) {
        console.error('Failed parsing of file', file, err)
        logger.error('Error reading file : %s', file)
        process.exit(3)
      })
      .pipe(processFasta(file, minlen))
      .on('data', function (stats) {
        cb(file, stats)
      })
 }

// Loop over all the files specified
function processFiles (files, minlen, logger, cb) {
  if (files.length === 0) { 
    logger.info('Processing FASTA file: stdin with minlen %i', minlen)
    processFile(process.stdin, "stdin", minlen, logger, cb);
    return
  }

  for (idx in files) {
    file = files[idx]

    logger.info('Processing FASTA file: %s with minlen %i', file, minlen)

    // Read the file, pipe through the fasta parser, then through our filter, then output as appropriate
    processFile(fs.createReadStream(file), file, minlen, logger, cb);
  }
}
