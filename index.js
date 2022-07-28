#!/usr/bin/env node

import cli from "commander";
import { init } from "./commands/init.js";
import { deploy } from "./commands/deploy.js";

cli.description("Welcome to Kuri DLQ-as-a-Service! See the commands bellow or the documentation at <doc link>");
cli.name("kuri");
cli.usage("<command>");
cli.addHelpCommand(false);
cli.helpOption(false);

cli.parse(process.argv);

cli
  .command("init")
  // .argument("[postId]", "ID of post you'd like to retrieve.")
  // .option("-p, --pretty", "Pretty-print output from the API.")
  .description(
    "-- Initialize your Kuri application."
  )
  .action(init);

cli
  .command("deploy")
  // .argument("[postId]", "ID of post you'd like to retrieve.")
  // .option("-p, --pretty", "Pretty-print output from the API.")
  .description(
    "-- Deploy Kuri Infrastructure"
  )
  .action(deploy);

cli.parse(process.argv);