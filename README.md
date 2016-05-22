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
3. Run `npm install`.
4. Change into the TSD directory and run `tsd install`.
5. Run `gulp` to compile the typescript files.
6. Clone the contents of the templates directory into ~/.raft/templates/ (https://github.com/tlein/AnconaTemplateGame)
7. Add the following to your bashrc:
```
export RAFT_PATH=<Path to the root directory of the raft repo>
export PATH=$PATH:$RAFT_PATH/release/bin
export NODE_PATH=$NODE_PATH:$RAFT_PATH/release/lib
```

# Available Commands
* run `raft create` to create a new project.
* run `raft build` to build the project and it's dependencies.
* run `raft build [platform] [arch]` to build the project for a specific platform. (NOT IMPLEMENTED)
* run `raft run [platform] [arch]` to run the project. (NOT IMPLEMENTED)
* run `raft release-build` to build a release version of the project for all supported platforms. (NOT IMPLEMENTED)
