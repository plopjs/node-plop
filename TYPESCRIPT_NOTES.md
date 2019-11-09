I renamed all .js to .ts in a separate commit to allow git to track the renames.
Also, by excluding that commit from a diff, you can more easily view the code changes on Github.

To make the code changes as minimal as possible:

* I disabled several eslint rules.  They should be re-enabled, and the necessary fixes applied.
* I disabled "noImplicitAny" in tsconfig.  It should be be re-enabled and the necessary annotations added.
