name: CI

on: [push, pull_request]

jobs:
  test:
    name: Node.js v${{ matrix.nodejs }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        nodejs: [8, 10, 12]

    steps:
    - uses: actions/checkout@master
      with:
        fetch-depth: 1
    - uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.nodejs }}

    - name: Install
      run: |
        npm install
    - name: Test
      run: npm test
