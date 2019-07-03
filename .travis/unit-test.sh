#!/bin/bash

set -e
errors=0

# Run unit tests
mocha test/test.js || {
    echo "'mocha test/test.js' failed"
    let errors+=1
}

[ "$errors" -gt 0 ] && {
    echo "There were $errors errors found"
    exit 1
}

echo "Ok : JS specific tests"
