#!/usr/bin/env python3
"""Record the visible commands in a walkthrough VHS tape without a browser.

This intentionally supports only this repository's linear command tapes. It
executes every command, records its real combined output, and fails on errors.
agg renders the resulting asciicast. VHS remains the default recorder.
"""

import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import time


def visible_commands(source):
    visible = True
    pending = None
    commands = []
    for raw in source.splitlines():
        line = raw.strip()
        if line == "Hide":
            visible = False
        elif line == "Show":
            visible = True
        elif visible and line.startswith("Type "):
            if pending is not None:
                raise ValueError("Each visible Type must be followed by Enter")
            pending = json.loads(line[5:])
        elif visible and line == "Enter":
            if pending is None:
                raise ValueError("Enter without a visible command")
            commands.append(pending)
            pending = None
        elif visible and line and not line.startswith(("#", "Output ", "Set ", "Sleep ", "Wait")):
            raise ValueError(f"Unsupported visible tape command: {line}")
    if pending is not None or not commands:
        raise ValueError("Incomplete or empty tape")
    return commands


def record(tape, output, cwd):
    spec = importlib.util.spec_from_file_location("humanize", Path(__file__).with_name("humanize-tape.py"))
    humanize = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(humanize)
    events = []
    timestamp = 0.5
    for number, command in enumerate(visible_commands(tape.read_text())):
        events.append([timestamp, "o", "$ "])
        rng = humanize.line_rng(23, number, command)
        for char in command:
            timestamp += rng.randint(24, 92) / 1000
            events.append([timestamp, "o", char])
        events.append([timestamp + 0.2, "o", "\r\n"])
        started = time.monotonic()
        result = subprocess.run(command, shell=True, executable="/bin/bash", cwd=cwd,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, timeout=180)
        # Output is captured verbatim apart from terminal newline normalization.
        timestamp += time.monotonic() - started + 0.3
        events.append([timestamp, "o", result.stdout.replace("\n", "\r\n")])
        if result.returncode:
            raise RuntimeError(f"{command!r} exited {result.returncode}:\n{result.stdout}")
        timestamp += 2
    events.append([timestamp, "o", "$ "])
    events.append([timestamp + 2, "o", ""])
    header = {"version": 2, "width": 96, "height": 20,
              "env": {"TERM": "xterm-256color"},
              "title": f"Wago: {tape.stem}",
              "theme": {"fg": "#f3effd", "bg": "#161043",
                        "palette": "#161043:#ff9ec4:#74e0ad:#f3d37a:#8c75ff:#c3a8ff:#75d8e8:#f3effd:#7d72b0:#ffb4d2:#91ebc2:#ffe49a:#aa88fa:#d6c3ff:#a4e9f2:#ffffff"}}
    output.write_text("\n".join(json.dumps(x) for x in [header, *events]) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tape", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--cwd", type=Path, required=True)
    args = parser.parse_args()
    record(args.tape, args.output, args.cwd)
