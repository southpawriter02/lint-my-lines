#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for lint-my-lines
 * @author Jules
 */
"use strict";

const { program } = require("commander");
const { init } = require("../lib/cli/init");
const pkg = require("../package.json");

program
  .name("lint-my-lines")
  .description("ESLint plugin for enforcing comment style guidelines")
  .version(pkg.version);

program
  .command("init")
  .description("Generate ESLint configuration for lint-my-lines")
  .option("-p, --preset <name>", "Preset: minimal, recommended, strict", "recommended")
  .option("--flat", "Use ESLint flat config format (eslint.config.js)")
  .option("--no-flat", "Use legacy .eslintrc format")
  .action((options) => {
    init({
      preset: options.preset,
      flat: options.flat,
    });
  });

program.parse();
