# Raft

Raft is build tool for the Ancona game engine.  It helps you get your ducks in order.

# Dependencies
In order to install Raft you need the following programs:

* node
* npm
* gulp-cli (can be installed through npm)
* tsd (can be installed through npm)

# Install instructions
In the future this will likely be wrapped up in an npm package.  Until then you will need to build and install it manually.

1. Clone the repository onto your machine.
2. Change into the directory.
3. Run `npm install`
4. Change into the TSD file and run `tsd install`
5. Add release/lib to your NODE_PATH environment variable.
6. Add release/bin to your PATH environment variable.

# Available Commands

* run `raft create` to create a new project. (NOT IMPLEMENTED)
* run `raft [platform] [arch]` to build the project and it's dependencies. (NOT IMPLEMENTED)
* run `raft run [platform] [arch]` to run the project. (NOT IMPLEMENTED)
* run `raft release-build` to build a release version of the project for all supported platforms. (NOT IMPLEMENTED)
