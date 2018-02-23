![Pattern Lab Logo](/patternlab.png 'Pattern Lab Logo')

## Using Pattern Lab

TODO

## Contributing

### Prerequisites

To get started, you'll need Node 8 or higher. Managing Node with `nvm` is recommended.

### Testing

#### Cold start testing

To ensure that developers can bootstrap the repo from a fresh clone, do this in your working copy:

```sh
git reset --hard && git clean -dfx && npm install && npm run bootstrap
```

This ensures that any changes you've made will still result in a clean and functional developer experience. **Note**: be sure you've committed any outstanding work before doing this -- it will blow away whatever's still outstanding, including anything staged but not commited.
