#!/usr/bin/env python3
"""Expand visible VHS Type lines into natural, reproducible keystrokes."""

import argparse
import hashlib
import random
import re
import sys
from pathlib import Path


TYPE_LINE = re.compile(
    r'^(?P<indent>\s*)Type(?:@\S+)?\s+"(?P<text>[^"\r\n]*)"(?P<suffix>\s+.*)?$'
)
UNSUPPORTED = {'"', '$', '`', '\n', '\r'}


def commands_for(text: str, *, rng: random.Random, min_delay: int, max_delay: int) -> list[str]:
    unsupported = sorted(set(text) & UNSUPPORTED)
    if unsupported:
        rendered = ", ".join(repr(char) for char in unsupported)
        raise ValueError(f"unsupported character(s): {rendered}")

    commands = []
    punctuation = set("./:_-")
    for char in text:
        if char == " ":
            commands.append("Space")
            delay = rng.randint(min_delay, max_delay) + 105
        else:
            commands.append(f'Type "{char}"')
            delay = rng.randint(min_delay, max_delay)
            if char in punctuation:
                delay += 70
        commands.append(f"Sleep {delay}ms")
    return commands


def line_rng(seed: int, line_number: int, text: str) -> random.Random:
    digest = hashlib.sha256(f"{seed}:{line_number}:{text}".encode()).digest()
    return random.Random(int.from_bytes(digest[:8], "big"))


def humanize(source: str, *, seed: int, min_delay: int, max_delay: int) -> str:
    output = []
    visible = True
    enabled = True

    for line_number, line in enumerate(source.splitlines(), start=1):
        stripped = line.strip()
        if stripped == "Hide":
            visible = False
        elif stripped == "Show":
            visible = True
        elif stripped.lower() == "# humanize: off":
            enabled = False
            output.append(line)
            continue
        elif stripped.lower() == "# humanize: on":
            enabled = True
            output.append(line)
            continue

        match = TYPE_LINE.match(line)
        if not (visible and enabled and match):
            output.append(line)
            continue

        try:
            commands = commands_for(
                match.group("text"),
                rng=line_rng(seed, line_number, match.group("text")),
                min_delay=min_delay,
                max_delay=max_delay,
            )
        except ValueError as error:
            raise ValueError(f"line {line_number}: {error}") from error

        indent = match.group("indent")
        output.extend(f"{indent}{command}" for command in commands)
        if match.group("suffix"):
            output.append(f"{indent}{match.group('suffix').strip()}")

    return "\n".join(output) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Humanize visible Type lines in a VHS tape while leaving hidden setup untouched."
    )
    parser.add_argument("input", type=Path, help="Source .tape file")
    parser.add_argument("output", type=Path, help="Rendered .tape file")
    parser.add_argument("--seed", type=int, default=7, help="Seed for reproducible timing")
    parser.add_argument("--min-delay", type=int, default=24, help="Fastest key delay in ms")
    parser.add_argument("--max-delay", type=int, default=92, help="Slowest key delay in ms")
    args = parser.parse_args()

    if args.min_delay < 0 or args.max_delay < args.min_delay:
        parser.error("delay range must satisfy 0 <= min-delay <= max-delay")

    try:
        rendered = humanize(
            args.input.read_text(),
            seed=args.seed,
            min_delay=args.min_delay,
            max_delay=args.max_delay,
        )
    except (OSError, ValueError) as error:
        parser.error(str(error))

    args.output.write_text(rendered)
    return 0


if __name__ == "__main__":
    sys.exit(main())
