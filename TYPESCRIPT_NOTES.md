I renamed all .js to .ts in a separate commit to allow git to track the renames.
Also, by excluding that commit from a diff, you can more easily view the code changes on Github.

To make the code changes as minimal as possible:

* I disabled several eslint rules.  They should be re-enabled, and the necessary fixes applied.
* I disabled "noImplicitAny" in tsconfig.  It should be be re-enabled and the necessary annotations added.

## Migration to emitted declarations

This PR is written to be merge-able today.
Emitted declarations will be omitted from the module; the manually-written index.d.ts will be bundled.

Future PRs can add test plopfiles and use them to test both the manually-written and automatically-emitted declarations.

Once the automatically-emitted declarations have parity with the manually-written ones, we can ditch the manually-written
one.
