import Promise = require('bluebird');
import _ = require('underscore');

import BuildConfig = require('./BuildConfig');
import CMake = require('./CMake');
import Path = require('./Path');
import RaftFile = require('./RaftFile');

import raftlog = require('./Log');

/**
 * Describes a raft project. Contains project data, configuration, and project specific paths.
 */
class Project {
    private static RAFT_DIR = new Path('Raft');
    private static RAFT_FILE = Project.RAFT_DIR.append('raftfile.json');
    private static BUILD_DIR = new Path('build');
    private static DEPENDENCY_DIR = Project.RAFT_DIR.append('libs');
    private static DEPENDENCY_SRC_DIR = Project.DEPENDENCY_DIR.append('src');
    private static DEPENDENCY_BUILD_DIR = Project.DEPENDENCY_DIR.append('build');
    private static DEPENDENCY_INSTALL_DIR = Project.DEPENDENCY_DIR.append('install');
    private static DEPENDENCY_LIB_DIR = new Path('lib');
    private static DEPENDENCY_INC_DIR = new Path('include');

    private raftfile : RaftFile.Root;

    constructor(root : Path) {
        this.root = root;
    }

    /**
    *  Will walk up the file tree until the root directory of a project is found.
    *  @param path The path to start the search from
    *  @return Returns the project if it exists or null if it does not.
    */
    static find(path : Path) : Promise<Project> {
        var paths = [path];
        var raftDir = new Path("Raft");

        while (!_.last(paths).isRoot()) {
            paths.push(_.last(paths).parent());
        }

        var rootDir = _.first(_.filter(paths, (path) => path.append(raftDir).exists()));

        if (rootDir) {
            return (new Project(rootDir)).load();
        } else {
            return Promise.reject(null);
        }
    }

    /**
     * Load a project from the raftfile.
     * @return {Promise<Project>} A promise that resolves to a loaded project.
     */
    load() : Promise<Project> {
        return this.root.append(Project.RAFT_FILE).read()
        .then((data) => {
            raftlog("Project Data", data);
            this.raftfile = JSON.parse(data);
            raftlog("Project Data", JSON.stringify(this.raftfile));
            return this;
        });
    }

    /**
     * Get the dependency descriptor's contained in the project's raftfile.
     * @return {RaftFile.DependencyDescriptor} [description]
     */
    dependencies() : RaftFile.DependencyDescriptor [] {
        return this.raftfile.dependencies.slice(0);
    }

    /**
     * Get the directory that should be used to store the dependency's source.
     * @param  {string} name Name of the dependency.
     * @return {Path}        Path describing where the source should be stored.
     */
    dirForDependency(name : string) : Path {
        return this.root.append(Project.DEPENDENCY_SRC_DIR, name);
    }

    /**
     * Get the folder where the dependency should be built.
     * @param  {string}            name  Name of the dependency.
     * @param  {BuildConfig.Build} build The configuration for the current build.
     * @return {Path}                    Path describing where the dependency should be built.
     */
    dirForDependencyBuild(name : string, build : BuildConfig.Build) {
        return this.root.append(
            Project.DEPENDENCY_BUILD_DIR,
            build.platform,
            build.architecture,
            name);
        }

    /**
     * Get the folder where the dependencies should be installed.
     * @param  {BuildConfig.Build} build The configuration for the current build.
     * @return {Path}                  Path describing where dependencies should be installed.
     */
    dirForDependencyInstall(build :BuildConfig.Build) {
        return this.root.append(
            Project.DEPENDENCY_INSTALL_DIR,
            build.platform,
            build.architecture);
    }

    /**
     * Get the folder where the dependencies library binaries should be installed.
     * @param  {BuildConfig.Build} build The configuration for the current build.
     * @return {Path}                  Path describing where the library binaries should be installed.
     */
    dirForDependencyLib(build :BuildConfig.Build) {
        return this.dirForDependencyInstall(build).append(Project.DEPENDENCY_LIB_DIR);
    }

    /**
     * Get the folder where the dependency headers should be installed.
     * @param  {BuildConfig.Build} build The configuration for the current build.
     * @return {Path}                  Path describing where the dependency headers should be installed.
     */
    dirForDependencyInc(build :BuildConfig.Build) {
        return this.dirForDependencyInstall(build).append(Project.DEPENDENCY_INC_DIR);
    }

    /**
     * Get the directory the project should be built in.
     * @param  {BuildConfig.Build} build The current build configuration.
     * @return {Path}                  [description]
     */
    dirForBuild(build :BuildConfig.Build) {
        if (build.isDeploy) {
            throw Error("deploy has not been implemented");
        } else {
            return this.root.append(Project.BUILD_DIR);
        }
    }

    /**
     * Build the project.
     * @param  {BuildConfig.Build} build The current build configuration.
     * @return {Promise<any>}            A promise that resolves when the build is finished.
     */
    build(build : BuildConfig.Build) : Promise<any> {
        var buildPath = this.dirForBuild(build);
        var cmakeOptions = this.cmakeOptions(this, build)
        return CMake.configure(this.root, buildPath, cmakeOptions)
        .then(() => {
            return CMake.build(buildPath);
        });
    }

    /**
     * Get the cmake options that should be used when building the project.
     * @param  {Project}           rootProject Root raft project for the current build.
     * @param  {BuildConfig.Build} build       Configuration for the current build.
     * @return {object}                        CMake options that should be used for the build.
     */
    cmakeOptions(rootProject : Project, build : BuildConfig.Build) {
        return {
            RAFT : CMake.raftCmakeFile().toString(),
            RAFT_INCLUDE_DIR : rootProject.dirForDependencyInc(build).toString(),
            RAFT_LIB_DIR : rootProject.dirForDependencyLib(build).toString(),
            RAFT_IS_DESKTOP : true,
            RAFT_IS_ANDROID : false,
            CMAKE_INSTALL_PREFIX : this.root.append('install')
        }
    }

    /**
     * Root directory of the project.
     * @type {Path}
     */
    root : Path;
}
export = Project;
