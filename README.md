# Ditto Integrity Checker
Runs a series of SQL statements on the Ditto database to check all references for validity, whether a constraint exists or not.

## Setup
1. Clone repository
2. In root directory, run `npm i`
3. Copy `config.js.sample` to `config.js` and fill in the database instance info.
4. If needed, update the `dbTablesAndKeys` variable in `check.js` to include the references you wish to check.
5. Run `npm run check`
