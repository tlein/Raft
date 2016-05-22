import _ = require('underscore');
import Promise = require('bluebird');
import Promptly = require('promptly');
import colors = require('colors');

import BuildConfig = require('./BuildConfig');
import Dependency = require('./Dependency');
import Path = require('./Path');
import Project = require('./Project');
import Template = require('./Template');
import RaftFile = require('./RaftFile');
import VCS = require('./VCS');
import raftlog = require('./Log');

/**
 * Build the raft project the user is currently in.
 * @param  {object} options Can be used to specify the parameters for the build configuration.
 * @return {Promise}        A promise that resolves once the build is finished.
 */
export function build(options : {platform? : string, architecture? : string} = {}) : Promise<any> {

    //TODO implement platform and architecture arguments
    var buildSettings : BuildConfig.Build;
    if (options.platform && options.platform.toUpperCase() === "ANDROID") {
        buildSettings = {
            isDeploy : false,
            platform : BuildConfig.Platform.Android,
            architecture : BuildConfig.Architecture.armeabi
        }
    } else {
        buildSettings = {
            isDeploy : false,
            platform : BuildConfig.Platform.Host,
            architecture : BuildConfig.Architecture.Host
        }
    }

    return Project.find(Path.cwd()).then(function(project) {
        var dependencies = _.map(project.dependencies(), (dependency) => {
            return RaftFile.createDependency(dependency, project.raftDir)
        });

        raftlog("Project", `Getting ${dependencies.length} for the project`);

        return Promise.map(
            dependencies,
            (dependency) => Dependency.getDependency(project, buildSettings, dependency)
        ).then(() => project.build(buildSettings));
    });
}

/**
 * Create an instance of a specified template.
 * @param  {string} templateType The type of template we're creating an instance of.
 * @return {Promise<any>}        A promise that resolves when the new template instance is ready.
 */
export function create(templateType : string) : Promise<any> {
    var templateDir = Path.home().append('.raft/templates/' + templateType + '/');
    if (!templateDir.append('index.js').exists()) {
        throw new Error(errorMessage("No index.js at " + templateDir));
    }

    var templateSetup = require(templateDir.toString());
    var templateArgs = {
        Promise: Promise,
        Path: Path,
        prompt: {
            ask: ask
        },
        errorMessage: errorMessage
    };
    return templateSetup(templateArgs).then((context : any) => {
        return Template.instantiateTemplate(templateDir, Path.cwd(), context);
    });
};

function ask(question : string, validatorFunction? : (input : string) => string) : Promise<any> {
    return Promise.fromCallback((callback) => {
        if (validatorFunction) {
            Promptly.prompt(question, {validator : validatorFunction}, callback);
        } else {
            Promptly.prompt(question, callback);
        }
    });
}

function errorMessage(msg : string) : string {
    return colors.red.underline("Error") + ": " + msg;
}
