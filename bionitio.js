#!/usr/bin/env node

/*
Module      : bionitio.js 
Description : The main entry point for the program.
Copyright   : (c) BIONITIO_AUTHOR, BIONITIO_DATE 
License     : BIONITIO_LICENSE 
Maintainer  : BIONITIO_EMAIL 
Portability : POSIX

The program reads one or more input FASTA files. For each file it computes a
variety of statistics, and then prints a summary of the statistics as output.
*/

var opts = require('commander')
var winston = require('winston')

var bionitio = require('./lib/fasta-stats')

// Override handling of unknown options - someone decided exit code 2 was better than the default 1
opts.unknownOption = function (flag) {
  console.error()
  console.error("  error: unknown option `%s'", flag)
  console.error()
  process.exit(2)
}

// Option parsing
opts
  .version('0.1.0')
  .usage('[options] contigs.fasta [contigs2.fasta ...]')
  .description('Print fasta stats')
  .option('-m, --minlen <n>', 'Minimum length sequence to include in stats (default=0)', parseInt, 0)
  .option('-l, --log <LOG_FILE>', 'record program progress in LOG_FILE')
  .parse(process.argv)

// Setup logging
var logger = new (winston.Logger)()
logger.info('Command line')
if (opts.log !== undefined) {
  logger.configure({
    transports: [
      new (winston.transports.File)({ filename: opts.log })
    ]
  })
}

logger.info('Command line: %s', process.argv.join(' '))

console.log('FILENAME\tNUMSEQ\tTOTAL\tMIN\tAVG\tMAX')
bionitio.processFiles(opts.args, opts.minlen, logger, function (file, stats) {
  console.log([file].concat(stats).join('\t'))
})
