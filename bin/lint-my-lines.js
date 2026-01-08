#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for lint-my-lines
 * @author Jules
 */
"use strict";

const { program } = require("commander");
const { init } = require("../lib/cli/init");
const { lintFiles } = require("../lib/cli/lint");
const pkg = require("../package.json");

program
  .name("lint-my-lines")
  .description("Comment quality linter for JavaScript/TypeScript")
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

program
  .command("lint [files...]")
  .description("Lint files for comment quality issues")
  .option("-p, --preset <preset>", "Rule preset (minimal|recommended|strict|analysis)", "recommended")
  .option("-f, --fix", "Automatically fix problems")
  .option("--format <format>", "Output format (stylish|json|compact)", "stylish")
  .action(async (files, options) => {
    const patterns = files.length > 0 ? files : ["."];
    const exitCode = await lintFiles(patterns, options);
    process.exit(exitCode);
  });

program.parse();
